import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { assessmentAPI, proctoringAPI } from '../../services/api';
import {
  Clock,
  Play,
  Send,
  RotateCcw,
  Maximize2,
  Minimize2,
  Code2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Terminal,
  HelpCircle,
  Sparkles,
  Database,
  Layers,
  FileCheck,
  ArrowLeft,
  AlertTriangle,
  Sun,
  Moon,
  Settings,
  ChevronDown,
  ChevronUp,
  Cpu,
  Check,
  X,
  Sliders,
} from 'lucide-react';

export const CodingAssessmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [problems, setProblems] = useState([]);
  const [activeProblemIdx, setActiveProblemIdx] = useState(0);
  const [language, setLanguage] = useState('python');
  const [codeMap, setCodeMap] = useState({}); // { [problemId_language]: code }
  const [timeRemaining, setTimeRemaining] = useState(60 * 60); // 60 mins

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [activeTestTab, setActiveTestTab] = useState(0); // 0, 1, 2 for test cases
  const [consoleView, setConsoleView] = useState('testcases'); // 'testcases' | 'custom' | 'terminal'
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState(null);
  const [submissionHistory, setSubmissionHistory] = useState({}); // { [problemId]: result }
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Editor customization states
  const [editorTheme, setEditorTheme] = useState('vs-dark'); // 'vs-dark' | 'light'
  const [fontSize, setFontSize] = useState(14);
  const [showMinimap, setShowMinimap] = useState(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [error, setError] = useState(null);

  // Map assessment language keys to Monaco Editor languages
  const getMonacoLanguage = (lang) => {
    switch (lang.toLowerCase()) {
      case 'c':
        return 'c';
      case 'cpp':
        return 'cpp';
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'mysql':
        return 'sql';
      default:
        return 'plaintext';
    }
  };

  // Initialize 60-Minute Coding Assessment Session
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await assessmentAPI.startSession('coding');
        if (res.data?.success && res.data?.session) {
          const sess = res.data.session;
          setSession(sess);
          setProblems(sess.questions || []);
          setTimeRemaining(sess.remainingSeconds || 60 * 60);

          // Populate initial starter code for problems across all 5 languages
          const initialCode = {};
          (sess.questions || []).forEach((prob) => {
            const starters = prob.starter_code || {};
            ['python', 'c', 'cpp', 'java', 'mysql'].forEach((l) => {
              initialCode[`${prob.id}_${l}`] = starters[l] || '';
            });
          });
          setCodeMap(initialCode);

          // Seed default sample input if available
          if (sess.questions?.[0]?.sample_input) {
            setCustomInput(sess.questions[0].sample_input);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to start coding assessment session.');
      }
    };

    initSession();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!session || isSubmitting) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.id, isSubmitting]);

  // Tab switch proctoring log
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && session?.id) {
        proctoringAPI
          .logEvent({
            sessionId: session.id,
            sessionType: 'assessment',
            eventType: 'tab_switch',
            severity: 'medium',
            details: 'Candidate switched tabs away from coding assessment environment.',
          })
          .catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [session?.id]);

  const activeProblem = problems[activeProblemIdx] || null;
  const currentKey = activeProblem ? `${activeProblem.id}_${language}` : '';
  const currentCode = codeMap[currentKey] || '';

  const handleCodeChange = (newVal) => {
    if (!activeProblem) return;
    setCodeMap((prev) => ({ ...prev, [currentKey]: newVal || '' }));
  };

  const handleResetCode = () => {
    if (!activeProblem) return;
    const starter = activeProblem.starter_code?.[language] || '';
    setCodeMap((prev) => ({ ...prev, [currentKey]: starter }));
  };

  // Run Code against Sample Test Cases or Custom Input
  const handleRunCode = async () => {
    if (!activeProblem || isRunning) return;
    setIsRunning(true);
    setRunResults(null);
    setCustomOutput(null);

    const commandPrompt =
      language === 'python'
        ? `$ python3 solution.py < input.txt`
        : language === 'c'
        ? `$ gcc -O2 solution.c -o solution && ./solution < input.txt`
        : language === 'cpp'
        ? `$ g++ -O2 solution.cpp -o solution && ./solution < input.txt`
        : language === 'java'
        ? `$ javac Solution.java && java Solution < input.txt`
        : `$ mysql -u candidate -p < query.sql`;

    try {
      if (consoleView === 'custom' && customInput.trim()) {
        const res = await assessmentAPI.runCode({
          problemId: activeProblem.id,
          language,
          code: currentCode,
          customInput,
        });

        if (res.data?.success) {
          setCustomOutput(res.data);
          setTerminalLogs((prev) => [
            ...prev,
            { command: commandPrompt, output: res.data.stdout || res.data.output, stderr: res.data.stderr, time: new Date().toLocaleTimeString() },
          ]);
        }
      } else {
        const res = await assessmentAPI.runCode({
          problemId: activeProblem.id,
          language,
          code: currentCode,
        });

        if (res.data?.success) {
          setRunResults(res.data.testResults);
          setActiveTestTab(0);
          setConsoleView('testcases');

          const firstResult = res.data.testResults?.[0];
          setTerminalLogs((prev) => [
            ...prev,
            {
              command: commandPrompt,
              output: firstResult?.actualOutput || 'Compilation and execution completed.',
              stderr: firstResult?.stderr,
              time: new Date().toLocaleTimeString(),
            },
          ]);
        }
      }
    } catch (err) {
      setRunResults([
        {
          passed: false,
          actualOutput: '',
          stderr: err.message || 'Compiler execution timeout or service error.',
          status: 'Compilation Error',
        },
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code against All (Sample + Hidden) Test Cases
  const handleSubmitCode = async () => {
    if (!activeProblem || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await assessmentAPI.submitCode({
        sessionId: session?.id,
        problemId: activeProblem.id,
        language,
        code: currentCode,
      });

      if (res.data?.success && res.data?.evaluation) {
        setSubmissionHistory((prev) => ({
          ...prev,
          [activeProblem.id]: res.data.evaluation,
        }));
        setRunResults(res.data.evaluation.testResults);
        setActiveTestTab(0);
        setConsoleView('testcases');
      }
    } catch (err) {
      alert('Submission error: ' + (err.message || 'Please retry.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete the entire 60-minute Coding Assessment
  const handleFinalSubmit = async () => {
    if (!session) return;
    try {
      await assessmentAPI.submitSession(session.id);
      navigate('/candidate/comprehensive-report');
    } catch (err) {
      console.warn('Final submit notice:', err.message);
      navigate('/candidate/comprehensive-report');
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!activeProblem) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Initializing Compiler Environment...</p>
        </div>
      </div>
    );
  }

  const isTimerCritical = timeRemaining <= 300;

  // Selected test case details
  const activeTestCase = runResults?.[activeTestTab] || null;

  return (
    <div
      className={`min-h-screen bg-slate-50 text-slate-900 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-hidden flex flex-col' : 'pb-8'
      }`}
    >
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Return to Hub"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <span className="badge-navy uppercase tracking-wider text-[11px] flex items-center gap-1.5 truncate">
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              Online Compiler Sandbox
            </span>

            {/* Problem Navigation Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg ml-2">
              {problems.map((prob, idx) => {
                const isProbDone = !!submissionHistory[prob.id];
                return (
                  <button
                    key={prob.id}
                    onClick={() => {
                      setActiveProblemIdx(idx);
                      setRunResults(null);
                      if (prob.sample_input) setCustomInput(prob.sample_input);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      activeProblemIdx === idx
                        ? 'bg-white text-slate-900 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isProbDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>Problem {idx + 1}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Server Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition-colors ${
                isTimerCritical
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Finish Assessment</span>
              <span className="sm:hidden">Finish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
          {/* Left Column (5 cols): Problem Statement, Constraints, Sample Tests */}
          <div className="lg:col-span-5 enterprise-card p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs h-[calc(100vh-140px)] min-h-[580px] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between gap-2">
              <span className="badge-teal font-bold">{activeProblem.difficulty || 'Easy'}</span>
              <span className="text-xs text-slate-500 font-semibold">{activeProblem.category}</span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 leading-snug">{activeProblem.title}</h2>

            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {activeProblem.statement}
            </div>

            {activeProblem.constraints && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Constraints</h4>
                <pre className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700 whitespace-pre-wrap">
                  {activeProblem.constraints}
                </pre>
              </div>
            )}

            {activeProblem.sample_input && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Sample Input & Output</h4>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Input:</div>
                    <pre className="text-xs font-mono text-slate-800 bg-white p-2 rounded border border-slate-200">{activeProblem.sample_input}</pre>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Expected Output:</div>
                    <pre className="text-xs font-mono text-teal-800 font-semibold bg-teal-50/50 p-2 rounded border border-teal-200">{activeProblem.sample_output}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Status if evaluated */}
            {submissionHistory[activeProblem.id] && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Problem Evaluated ({submissionHistory[activeProblem.id].scorePercentage}%)</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Passed {submissionHistory[activeProblem.id].passedCount} of {submissionHistory[activeProblem.id].totalTests} test cases (including hidden test cases).
                </p>
              </div>
            )}
          </div>

          {/* Right Column (7 cols): Real Monaco Editor & Interactive Console */}
          <div className="lg:col-span-7 flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-slate-950 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
            {/* Top Toolbar */}
            <div className="p-2.5 bg-[#0e1626] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
              <div className="flex items-center gap-2">
                {/* Language Selector */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-teal-300 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                >
                  <option value="python">Python 3 (3.12)</option>
                  <option value="cpp">C++ (GCC 14.1)</option>
                  <option value="c">C (GCC 14.1)</option>
                  <option value="java">Java (JDK 17)</option>
                  <option value="mysql">MySQL 8.0</option>
                </select>

                {/* Reset to template */}
                <button
                  onClick={handleResetCode}
                  title="Reset to Template"
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Font Size Selector */}
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-slate-400 text-xs rounded-lg px-2 py-1 focus:outline-none"
                  title="Editor Font Size"
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                </select>

                {/* Editor Theme Toggle */}
                <button
                  onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title={`Switch to ${editorTheme === 'vs-dark' ? 'Light' : 'Dark'} theme`}
                >
                  {editorTheme === 'vs-dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Run Code Button */}
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors shadow-2xs"
                  title="Compile & Run against test cases (Ctrl + Enter)"
                >
                  <Play className="w-3 h-3 text-teal-400 fill-teal-400" />
                  <span>{isRunning ? 'Compiling...' : 'Run Code'}</span>
                </button>

                {/* Submit Code Button */}
                <button
                  onClick={handleSubmitCode}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Send className="w-3 h-3" />
                  <span>{isSubmitting ? 'Evaluating...' : 'Submit Code'}</span>
                </button>
              </div>
            </div>

            {/* Monaco Code Editor Workspace */}
            <div className="flex-1 relative overflow-hidden bg-[#1e1e1e]">
              <Editor
                height="100%"
                language={getMonacoLanguage(language)}
                value={currentCode}
                theme={editorTheme}
                onChange={handleCodeChange}
                loading={
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs gap-2">
                    <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading VS Code Editor Engine...</span>
                  </div>
                }
                options={{
                  fontSize: fontSize,
                  fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                  fontLigatures: true,
                  minimap: { enabled: showMinimap },
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  insertSpaces: true,
                  bracketPairColorization: { enabled: true },
                  autoClosingBrackets: 'always',
                  formatOnPaste: true,
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>

            {/* Interactive Bottom Console / Output Drawer (LeetCode style) */}
            <div
              className={`bg-[#0a0f1d] border-t border-slate-800 flex flex-col flex-shrink-0 transition-all duration-200 ${
                isConsoleExpanded ? 'h-80' : 'h-56'
              }`}
            >
              {/* Console Tabs & Header Bar */}
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-semibold bg-[#0e1626]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setConsoleView('testcases')}
                    className={`pb-1 border-b-2 flex items-center gap-1.5 transition-colors ${
                      consoleView === 'testcases'
                        ? 'border-teal-400 text-teal-300 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Test Cases</span>
                  </button>

                  <button
                    onClick={() => setConsoleView('custom')}
                    className={`pb-1 border-b-2 flex items-center gap-1.5 transition-colors ${
                      consoleView === 'custom'
                        ? 'border-teal-400 text-teal-300 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Custom Stdin</span>
                  </button>

                  <button
                    onClick={() => setConsoleView('terminal')}
                    className={`pb-1 border-b-2 flex items-center gap-1.5 transition-colors ${
                      consoleView === 'terminal'
                        ? 'border-teal-400 text-teal-300 font-bold'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Compiler Console</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
                    className="p-1 text-slate-400 hover:text-slate-200"
                    title={isConsoleExpanded ? 'Collapse Console' : 'Expand Console'}
                  >
                    {isConsoleExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Console Body */}
              <div className="flex-1 p-3.5 overflow-y-auto font-mono text-xs text-slate-200">
                {/* 1. Test Cases View */}
                {consoleView === 'testcases' && (
                  <div className="space-y-3 h-full flex flex-col">
                    {runResults ? (
                      <>
                        {/* Case 1, Case 2, Case 3 Horizontal Pill Tabs */}
                        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 flex-shrink-0">
                          {runResults.map((tr, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveTestTab(idx)}
                              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
                                activeTestTab === idx
                                  ? 'bg-slate-800 text-white shadow-2xs border border-slate-700'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                              }`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  tr.passed ? 'bg-emerald-400' : 'bg-rose-400'
                                }`}
                              />
                              <span>Case {idx + 1}</span>
                            </button>
                          ))}
                        </div>

                        {/* Active Test Case Execution Report */}
                        {activeTestCase && (
                          <div className="flex-1 overflow-y-auto space-y-2.5">
                            {/* Status Header Badge */}
                            <div className="flex items-center justify-between">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  activeTestCase.passed
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                {activeTestCase.passed ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                                <span>{activeTestCase.status || (activeTestCase.passed ? 'Accepted' : 'Wrong Answer')}</span>
                              </span>

                              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                                <span>Runtime: <strong className="text-teal-400">{activeTestCase.executionTimeMs || 22} ms</strong></span>
                                <span>Memory: <strong className="text-slate-300">{Math.round((activeTestCase.memoryKb || 14200) / 1024)} MB</strong></span>
                              </div>
                            </div>

                            {/* Compiler Error / Stderr Traceback */}
                            {activeTestCase.stderr && (
                              <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl space-y-1">
                                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                                  Compiler Diagnostics:
                                </div>
                                <pre className="text-xs text-rose-300 whitespace-pre-wrap">
                                  {activeTestCase.stderr}
                                </pre>
                              </div>
                            )}

                            {/* Input, Expected, Actual Output */}
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Input:</span>
                                <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200">
                                  {activeTestCase.input || '<No Stdin>'}
                                </pre>
                              </div>

                              <div>
                                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Expected Output:</span>
                                <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-teal-400 font-bold">
                                  {activeTestCase.expectedOutput}
                                </pre>
                              </div>

                              <div>
                                <span className="text-[11px] text-slate-400 font-semibold block mb-1">Actual Output:</span>
                                <pre
                                  className={`p-2.5 rounded-lg border font-bold ${
                                    activeTestCase.passed
                                      ? 'bg-slate-900 border-slate-800 text-emerald-400'
                                      : 'bg-rose-950/30 border-rose-900/60 text-rose-400'
                                  }`}
                                >
                                  {activeTestCase.actualOutput || '<No Output>'}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
                        <Code2 className="w-8 h-8 text-slate-600 stroke-1" />
                        <p>Write your code above and click <b className="text-teal-400">Run Code</b> to compile and test against sample inputs.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Custom Input View */}
                {consoleView === 'custom' && (
                  <div className="space-y-3 h-full flex flex-col">
                    <div className="flex-1 flex flex-col space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Custom Stdin:</span>
                        <button
                          onClick={handleRunCode}
                          disabled={isRunning}
                          className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold"
                        >
                          {isRunning ? 'Executing...' : 'Run with Custom Input'}
                        </button>
                      </div>

                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter custom input arguments here..."
                        className="w-full h-24 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs resize-none focus:outline-none focus:border-teal-500"
                      />

                      {customOutput && (
                        <div className="space-y-1 mt-2">
                          <span className="text-[11px] text-slate-400 font-semibold">Custom Execution Output:</span>
                          <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-teal-400 font-mono text-xs whitespace-pre-wrap">
                            {customOutput.stdout || customOutput.output || customOutput.stderr || '<No Output>'}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Terminal View */}
                {consoleView === 'terminal' && (
                  <div className="space-y-2 h-full overflow-y-auto">
                    <div className="text-slate-500 text-[11px] pb-1 border-b border-slate-800">
                      InterviewIQ Compiler Shell [GCC 14.1 / Python 3.12 / JDK 17 / MySQL 8.0]
                    </div>

                    {terminalLogs.length > 0 ? (
                      terminalLogs.map((log, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="text-teal-400 font-bold">{log.command}</div>
                          {log.output && <pre className="text-slate-200 whitespace-pre-wrap pl-2">{log.output}</pre>}
                          {log.stderr && <pre className="text-rose-400 whitespace-pre-wrap pl-2">{log.stderr}</pre>}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-500 italic text-xs py-4">
                        Terminal ready. Execute code to view compiler build pipeline and stdout trace.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Finish Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="enterprise-card p-6 md:p-8 bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Submit Coding Assessment?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              This will evaluate your code against all hidden test cases and record your score.
            </p>

            <div className="space-y-2 p-3 bg-slate-50 rounded-xl text-xs mb-6 border border-slate-200">
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Problem 1:</span>
                <span className="font-bold text-slate-900">
                  {submissionHistory[problems[0]?.id] ? 'Submitted & Scored' : 'Saved Draft'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Problem 2:</span>
                <span className="font-bold text-slate-900">
                  {submissionHistory[problems[1]?.id] ? 'Submitted & Scored' : 'Saved Draft'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-200 pt-1">
                <span className="text-slate-600">Time Remaining:</span>
                <span className="font-bold text-slate-900">{formatTimer(timeRemaining)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Continue Coding
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex-1 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Yes, Complete Assessment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="enterprise-card p-6 bg-white max-w-sm w-full rounded-2xl shadow-xl border border-slate-200 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-2">Leave Coding Session?</h3>
            <p className="text-xs text-slate-600 mb-6">
              Your written code will remain saved. The 60-minute timer will continue running until final submission.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Keep Coding
              </button>
              <button
                onClick={() => navigate('/assessments')}
                className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Exit to Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingAssessmentPage;
