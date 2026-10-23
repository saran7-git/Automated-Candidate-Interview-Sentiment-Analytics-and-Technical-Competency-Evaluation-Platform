import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { interviewAPI, answerAPI } from '../../services/api';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  Circle,
  AlertCircle,
  BrainCircuit,
  Cpu,
  Sparkles,
} from 'lucide-react';

export const InterviewSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [interview, setInterview] = useState(location.state?.interview || null);
  const [questions, setQuestions] = useState(location.state?.questions || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 mins
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState('');

  // Timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitFinal();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch interview & questions if not in router state
  useEffect(() => {
    if (!questions.length) {
      const fetchSession = async () => {
        try {
          const res = await interviewAPI.getInterviewById(id);
          if (res.data?.success) {
            setInterview(res.data.interview);
            setQuestions(res.data.questions);

            // Populate existing answers if any
            const ansObj = {};
            (res.data.answers || []).forEach((a) => {
              ansObj[a.question_id] = a.text_answer;
            });
            setAnswersMap(ansObj);
          }
        } catch (err) {
          setError('Failed to load assessment session. Please try again.');
        }
      };
      fetchSession();
    }
  }, [id]);

  const currentQuestion = questions[currentIndex] || null;
  const currentAnswer = currentQuestion ? answersMap[currentQuestion.id || currentQuestion.question_id] || '' : '';

  const handleAnswerChange = (val) => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id || currentQuestion.question_id;
    setAnswersMap((prev) => ({ ...prev, [qId]: val }));
  };

  const handleSaveAnswer = async () => {
    if (!currentQuestion) return;
    setIsSaving(true);
    try {
      const qId = currentQuestion.id || currentQuestion.question_id;
      await answerAPI.saveAnswer({
        interviewId: id,
        questionId: qId,
        textAnswer: currentAnswer,
        timeSpentSeconds: 60,
      });
    } catch (err) {
      console.warn('[Save Warning]:', err.message);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleNext = async () => {
    await handleSaveAnswer();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitFinal();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitFinal = async () => {
    setIsProcessing(true);
    setProcessingStep(1); // Answer received

    // Simulated step sequence for realistic UX
    setTimeout(() => setProcessingStep(2), 700); // Technical concepts detected
    setTimeout(() => setProcessingStep(3), 1400); // Evaluating competency
    setTimeout(() => setProcessingStep(4), 2100); // Generating insights

    try {
      const payloadAnswers = questions.map((q) => {
        const qId = q.id || q.question_id;
        return {
          questionId: qId,
          textAnswer: answersMap[qId] || '',
          timeSpentSeconds: 60,
        };
      });

      const res = await interviewAPI.completeInterview(id, {
        answers: payloadAnswers,
        durationSeconds: (30 * 60) - timeRemaining,
      });

      setTimeout(() => {
        navigate(`/candidate/results/${id}`, { replace: true });
      }, 2600);
    } catch (err) {
      setError(err.response?.data?.message || 'Error evaluating interview.');
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between">
      {/* 1. TOP BAR */}
      <header className="h-16 bg-[#0f172a] border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-sm shadow-glow-blue">
            IQ
          </div>
          <div>
            <span className="text-sm font-extrabold text-white tracking-tight">InterviewIQ</span>
            <span className="text-slate-500 mx-2">•</span>
            <span className="text-xs font-semibold text-slate-300">Technical Interview</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl">
            Question <span className="text-blue-400">{currentIndex + 1}</span> / {questions.length}
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Time Remaining: {formatTime(timeRemaining)}</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left 3 Columns: Question & Answer Editor */}
        <div className="lg:col-span-3 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Question Box */}
          <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-card">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Question {currentIndex + 1}
              </span>
              <span className="text-[11px] font-semibold bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-md">
                {currentQuestion?.skill || currentQuestion?.category || 'Technical'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {currentQuestion?.question || 'Loading question prompt...'}
            </h2>
          </div>

          {/* Answer Editor Box */}
          <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Your Technical Response</span>
              <span>{wordCount} Words</span>
            </div>

            <textarea
              rows={11}
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your structured answer here. Include core architectural concepts, key trade-offs, and technical rationale..."
              className="w-full p-4 rounded-2xl bg-[#090d16] border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-slate-100 placeholder-slate-600 outline-none resize-none font-sans leading-relaxed transition-all"
            />

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveAnswer}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'Saved ✓' : 'Save Answer'}
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-glow-blue flex items-center gap-1.5"
                >
                  <span>{currentIndex === questions.length - 1 ? 'Submit Assessment' : 'Submit & Continue'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Interview Progress Palette */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-3xl p-6 shadow-card space-y-4 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Interview Progress</h3>
            <span className="text-[11px] font-bold text-blue-400">
              {Object.keys(answersMap).filter((k) => answersMap[k]?.trim().length > 0).length} / {questions.length} Answered
            </span>
          </div>

          <div className="space-y-2">
            {questions.map((q, idx) => {
              const qId = q.id || q.question_id;
              const isAnswered = answersMap[qId]?.trim().length > 0;
              const isCurrent = currentIndex === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleSaveAnswer();
                    setCurrentIndex(idx);
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-glow-blue'
                      : isAnswered
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/15'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isAnswered ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <Circle className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-slate-600" />
                    )}
                    Question {idx + 1}
                  </span>
                  <span className="text-[10px] opacity-75">
                    {isAnswered ? 'Answered' : isCurrent ? 'Active' : 'Pending'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleSubmitFinal}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-glow-emerald flex items-center justify-center gap-2"
            >
              <span>Finish & Generate Report</span>
            </button>
          </div>
        </div>
      </main>

      {/* 3. AI PROCESSING MODAL */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center animate-pulse">
              <BrainCircuit className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Analyzing Your Response...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Evaluating technical competency, keyword presence, and communication sentiment.
              </p>
            </div>

            <div className="space-y-3 text-left max-w-xs mx-auto text-xs font-semibold">
              <div className={`flex items-center gap-3 ${processingStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {processingStep >= 1 ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                <span>Answer received</span>
              </div>
              <div className={`flex items-center gap-3 ${processingStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {processingStep >= 2 ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                <span>Technical concepts detected</span>
              </div>
              <div className={`flex items-center gap-3 ${processingStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {processingStep >= 3 ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                <span>Evaluating competency & relevance</span>
              </div>
              <div className={`flex items-center gap-3 ${processingStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {processingStep >= 4 ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                <span>Generating insights & performance report</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSessionPage;
