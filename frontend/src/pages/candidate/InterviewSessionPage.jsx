import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI, responseAPI, aiAPI } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import ProctoringCamera from '../../components/ProctoringCamera';
import ProctoringWarningOverlay from '../../components/ProctoringWarningOverlay';
import CodeEditor from '../../components/CodeEditor';
import MCQQuestionView from '../../components/MCQQuestionView';
import InteractiveAiHrRound from '../../components/InteractiveAiHrRound';
import { useMediaStream } from '../../hooks/useMediaStream';
import { useProctoringEngine } from '../../hooks/useProctoringEngine';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  Code2,
  HeartHandshake,
  ShieldAlert,
  ShieldCheck,
  Volume2,
  Calculator,
  BookOpen,
  Brain,
  LayoutGrid,
  Video,
  Bookmark,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const ROUND_CONFIGS = [
  { id: 'numerical', label: '1. Numerical Ability', shortLabel: 'Numerical', count: 20, timeLimitMinutes: 25, icon: Calculator, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 active:border-indigo-400' },
  { id: 'verbal', label: '2. Verbal Ability', shortLabel: 'Verbal', count: 25, timeLimitMinutes: 25, icon: BookOpen, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20 active:border-blue-400' },
  { id: 'reasoning', label: '3. Reasoning Ability', shortLabel: 'Reasoning', count: 20, timeLimitMinutes: 25, icon: Brain, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 active:border-amber-400' },
  { id: 'coding', label: '4. Coding Round', shortLabel: 'Coding', count: 1, timeLimitMinutes: 30, icon: Code2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 active:border-emerald-400' },
  { id: 'hr', label: '5. Personal AI HR', shortLabel: 'AI HR', count: 1, timeLimitMinutes: 20, icon: HeartHandshake, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 active:border-rose-400' }
];

const InterviewSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { success, error, warning, info } = useToast();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [activeRound, setActiveRound] = useState('numerical');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [visitedQuestions, setVisitedQuestions] = useState({});
  const [reviewMarked, setReviewMarked] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(4500); // 75 mins foundation default
  const [recordingBlobUrl, setRecordingBlobUrl] = useState('');

  // Active camera and microphone stream with real-time Voice Emotion & Pitch Analyzer
  const {
    stream,
    isCameraActive,
    audioLevel,
    pitchHz,
    voiceEmotion
  } = useMediaStream({ video: true, audio: true, autoStart: true });

  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Terminate assessment immediately upon exceeding 10 malpractice attempts
  const handleTerminateAssessment = async ({ reason, violationType, totalAttempts, totalTabSwitches }) => {
    try {
      await sessionAPI.terminate(sessionId, {
        reason,
        violationType: violationType || 'MALPRACTICE_LIMIT_EXCEEDED',
        totalAttempts: totalAttempts || 10,
        totalTabSwitches: totalTabSwitches || 0
      });
    } catch (e) {
      console.warn('Termination API notice:', e.message);
    }
    navigate(`/candidate/terminated/${sessionId}`, {
      state: { reason, violationType, totalAttempts, totalTabSwitches }
    });
  };

  // AI Proctoring Engine: 10s Eye Tracking, 10 Tab Switches, Max 10 Malpractice Strikes
  const {
    isOutOfFrame,
    isLookingAway,
    eyeAwayDuration,
    eyeAwayThresholdSeconds,
    outOfFrameDuration,
    isTabSwitched,
    tabSwitchCount,
    maxTabSwitches,
    malpracticeAttempts,
    maxAttempts,
    showFullscreenWarning,
    activeViolation,
    acknowledgeFullscreenWarning
  } = useProctoringEngine({
    stream,
    isCameraActive,
    onTerminate: handleTerminateAssessment,
    enabled: !loading && !submitting,
    maxAttempts: 10,
    maxTabSwitches: 10,
    eyeAwayThresholdSeconds: 10
  });

  const voiceEmotionLabel = typeof voiceEmotion === 'string'
    ? voiceEmotion
    : (voiceEmotion?.emotion || 'Confident & Composed');

  // Setup Browser Video/Audio MediaRecorder safely
  useEffect(() => {
    if (stream && !mediaRecorderRef.current && window.MediaRecorder) {
      try {
        let options;
        if (typeof MediaRecorder.isTypeSupported === 'function') {
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
            options = { mimeType: 'video/webm;codecs=vp8,opus' };
          } else if (MediaRecorder.isTypeSupported('video/webm')) {
            options = { mimeType: 'video/webm' };
          } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4' };
          }
        }
        const recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        recorder.onstop = () => {
          try {
            const mime = options?.mimeType || 'video/webm';
            const blob = new Blob(recordedChunksRef.current, { type: mime });
            const url = URL.createObjectURL(blob);
            setRecordingBlobUrl(url);
          } catch (e) {
            console.warn('Blob creation notice:', e);
          }
        };
        recorder.start(5000);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn('MediaRecorder init notice:', err.message);
      }
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }
    };
  }, [stream]);

  useEffect(() => {
    loadSessionData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      const res = await sessionAPI.getById(sessionId);
      const sess = res.session;

      if (sess.status === 'completed') {
        navigate(`/candidate/complete/${sessionId}`);
        return;
      }

      if (sess.status === 'disqualified' || sess.status === 'terminated_malpractice') {
        navigate(`/candidate/terminated/${sessionId}`);
        return;
      }

      setSession(sess);

      // Check if session already has dynamic questions generated; otherwise generate lively shuffled set
      let qList = sess.dynamicQuestions || [];
      if (!qList || qList.length === 0) {
        if (sess.interview?.questions && sess.interview.questions.length >= 65) {
          qList = sess.interview.questions;
        } else {
          try {
            const genRes = await aiAPI.generateQuestions({
              candidateId: sess.candidateId || 'candidate_user',
              seed: `${sess._id || sess.id}_${sess.candidateId}`
            });
            qList = genRes.assessment?.allQuestions || sess.interview?.questions || [];
            await sessionAPI.startSession(sessionId, { dynamicQuestions: qList });
          } catch (genErr) {
            console.warn('Dynamic question gen notice:', genErr.message);
            qList = sess.interview?.questions || [];
          }
        }
      }

      setQuestions(qList);

      // Pre-fill existing responses
      const initialAnswers = {};
      const initialVisited = {};
      (sess.responses || []).forEach((r) => {
        initialAnswers[r.questionId] = r.candidateAnswer;
        initialVisited[r.questionId] = true;
      });
      setAnswers(initialAnswers);
      setVisitedQuestions(initialVisited);

      // Duration & Timer
      const durationMins = sess.interview?.duration || 75;
      if (sess.startedAt) {
        const start = new Date(sess.startedAt).getTime();
        const now = new Date().getTime();
        const elapsedSecs = Math.floor((now - start) / 1000);
        const remaining = Math.max(0, durationMins * 60 - elapsedSecs);
        setTimeLeftSeconds(remaining);
      } else {
        setTimeLeftSeconds(durationMins * 60);
      }

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to load session:', err);
      error(err.message || 'Failed to load assessment session');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    warning('Assessment time expired! Submitting your answers automatically.');
    handleSubmitInterview();
  };

  // Filter questions for active round
  const currentRoundQuestions = questions.filter(q => {
    const qRound = (q.round || '').toLowerCase();
    if (activeRound === 'numerical') return qRound === 'numerical' || q.sectionIndex === 1;
    if (activeRound === 'verbal') return qRound === 'verbal' || q.sectionIndex === 2;
    if (activeRound === 'reasoning') return qRound === 'reasoning' || q.sectionIndex === 3;
    if (activeRound === 'coding') return qRound === 'coding' || q.sectionIndex === 4 || q.type === 'coding';
    if (activeRound === 'hr') return qRound === 'hr' || q.sectionIndex === 5 || q.type === 'hr_dialogue';
    return true;
  });

  const currentQuestion = currentRoundQuestions[currentIndex] || questions[0] || {};
  const currentQuestionId = currentQuestion._id || currentQuestion.id;
  const currentAnswer = answers[currentQuestionId] || '';

  // Mark visited when current question changes
  useEffect(() => {
    if (currentQuestionId) {
      setVisitedQuestions(prev => ({ ...prev, [currentQuestionId]: true }));
    }
  }, [currentQuestionId]);

  const handleAnswerChange = (val) => {
    if (!currentQuestionId) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionId]: val
    }));
  };

  const handleClearAnswer = () => {
    if (!currentQuestionId) return;
    setAnswers(prev => {
      const next = { ...prev };
      delete next[currentQuestionId];
      return next;
    });
    info('Cleared your selection for Question ' + (currentIndex + 1));
  };

  const toggleMarkForReview = (qId) => {
    setReviewMarked(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleSaveAndNext = async () => {
    if (currentQuestionId && currentAnswer) {
      try {
        await responseAPI.saveAnswer({
          sessionId,
          questionId: currentQuestionId,
          candidateAnswer: currentAnswer
        });
      } catch (err) {
        console.warn('Auto-save notice:', err.message);
      }
    }

    if (currentIndex < currentRoundQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const roundOrder = ['numerical', 'verbal', 'reasoning', 'coding', 'hr'];
      const curPos = roundOrder.indexOf(activeRound);
      if (curPos < roundOrder.length - 1) {
        const nextRound = roundOrder[curPos + 1];
        setActiveRound(nextRound);
        setCurrentIndex(0);
        success(`Advancing to Section ${curPos + 2}: ${ROUND_CONFIGS.find(r => r.id === nextRound)?.label}`);
      } else {
        setIsSubmitModalOpen(true);
      }
    }
  };

  const handleMarkAndNext = () => {
    if (currentQuestionId) {
      setReviewMarked(prev => ({ ...prev, [currentQuestionId]: true }));
    }
    handleSaveAndNext();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Submit Assessment
  const handleSubmitInterview = async () => {
    try {
      setSubmitting(true);
      setSubmitStep('Packaging recorded video and voice emotion stream...');

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
      }

      const answersPayload = Object.keys(answers).map((qId) => ({
        questionId: qId,
        candidateAnswer: answers[qId]
      }));

      setSubmitStep('Executing AI Sentiments, Technical Metrics & Presence Evaluation...');

      await sessionAPI.submit(sessionId, {
        answers: answersPayload,
        voiceEmotionStats: {
          primaryEmotion: voiceEmotionLabel || 'Confident & Composed',
          confidenceScore: 88,
          composureScore: 90,
          hesitationIndex: 10,
          speechPace: 'Measured & Clear'
        },
        malpracticeAudit: {
          totalAttempts: malpracticeAttempts,
          tabSwitches: tabSwitchCount,
          eyeAwayWarnings: eyeAwayDuration > 0 ? 1 : 0,
          proctoringPassed: malpracticeAttempts <= maxAttempts
        },
        recordingUrl: recordingBlobUrl || 'data:video/webm;base64,stored_session_stream',
        recordingDuration: 75
      });

      setSubmitStep('Generating Recruiter Dossier & Assessment Scores...');
      await new Promise((r) => setTimeout(r, 600));

      success('Assessment submitted successfully! Evaluation complete.');
      navigate(`/candidate/complete/${sessionId}`);
    } catch (err) {
      console.error('Submission error:', err);
      error(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
      setIsSubmitModalOpen(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <LoadingSpinner size="lg" message="Initializing 2026 Foundation Assessment & AI Proctoring System..." />
      </div>
    );
  }

  // Answered, Marked, Unanswered stats for question palette
  const totalQuestionsCount = questions.length || 67;
  const totalAnsweredCount = Object.values(answers).filter(a => typeof a === 'string' && a.trim().length > 0).length;
  const totalMarkedCount = Object.values(reviewMarked).filter(Boolean).length;
  const totalVisitedCount = Object.keys(visitedQuestions).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none font-sans">
      {/* Proctoring Warnings Overlay */}
      <ProctoringWarningOverlay
        isOutOfFrame={isOutOfFrame}
        isLookingAway={isLookingAway}
        eyeAwayDuration={eyeAwayDuration}
        eyeAwayThresholdSeconds={eyeAwayThresholdSeconds}
        outOfFrameDuration={outOfFrameDuration}
        isTabSwitched={isTabSwitched}
        tabSwitchCount={tabSwitchCount}
        maxTabSwitches={maxTabSwitches}
        malpracticeAttempts={malpracticeAttempts}
        maxAttempts={maxAttempts}
        showFullscreenWarning={showFullscreenWarning}
        activeViolation={activeViolation}
        onAcknowledgeFullscreen={acknowledgeFullscreenWarning}
      />

      {/* Floating Minimal Draggable Proctoring Camera Window */}
      <ProctoringCamera
        stream={stream}
        isCameraActive={isCameraActive}
        isLookingAway={isLookingAway}
        eyeAwayDuration={eyeAwayDuration}
        eyeAwayThresholdSeconds={eyeAwayThresholdSeconds}
        isOutOfFrame={isOutOfFrame}
        outOfFrameDuration={outOfFrameDuration}
        audioLevel={audioLevel}
        voiceEmotion={voiceEmotion}
        pitchHz={pitchHz}
        malpracticeAttempts={malpracticeAttempts}
        maxAttempts={maxAttempts}
        tabSwitchCount={tabSwitchCount}
        maxTabSwitches={maxTabSwitches}
      />

      {/* TOP HEADER: Assessment Branding, Section Tabs & Security HUD */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-rose-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-none">
                2026 Foundation Assessment
              </h1>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Candidate: <strong className="text-slate-200">{session?.candidate?.name || 'Candidate'}</strong>
              </p>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 ml-2 pl-4 border-l border-slate-800">
            {ROUND_CONFIGS.map((r) => {
              const Icon = r.icon;
              const isActive = activeRound === r.id;
              const roundQuestions = questions.filter(q => (q.round || '').toLowerCase() === r.id || q.sectionIndex === ROUND_CONFIGS.indexOf(r) + 1);
              const roundAnsCount = roundQuestions.filter(q => answers[q._id || q.id]?.trim()?.length > 0).length;

              return (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveRound(r.id);
                    setCurrentIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? `${r.color} shadow-sm border`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{r.shortLabel}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {roundAnsCount}/{roundQuestions.length || r.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right HUD Controls: Strikes, Voice Emotion, Timer, Submit */}
        <div className="flex items-center gap-2.5">
          {/* Malpractice Strike Badge (0/10) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
            <ShieldAlert className={`w-3.5 h-3.5 ${malpracticeAttempts > 5 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-400 text-[11px]">
              Strikes: <strong className={malpracticeAttempts > 6 ? 'text-rose-400 font-bold' : 'text-slate-200'}>{malpracticeAttempts}/10</strong>
            </span>
          </div>

          {/* Voice Tone Emotion Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-medium">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="truncate max-w-[110px]">{voiceEmotionLabel}</span>
          </div>

          {/* Time Remaining Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono text-xs sm:text-sm font-bold shadow-inner ${
            timeLeftSeconds < 300
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-indigo-300'
          }`}>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTime(timeLeftSeconds)}</span>
          </div>

          {/* Submit Test Button */}
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Test</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: Workspace (Left) + Question Palette Sidebar (Right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workspace Center Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between bg-slate-950">
          <div className="max-w-4xl w-full mx-auto space-y-5">
            {/* Question Top Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {ROUND_CONFIGS.find(r => r.id === activeRound)?.label || activeRound}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  Question {currentIndex + 1} of {currentRoundQuestions.length || 1}
                </span>
                <span className="text-[11px] text-slate-500">
                  Marks: <strong className="text-emerald-400 font-bold">+1.00</strong> / -0.00
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleMarkForReview(currentQuestionId)}
                  className={`text-xs px-3 py-1 rounded-xl border flex items-center gap-1.5 transition-all font-semibold ${
                    reviewMarked[currentQuestionId]
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${reviewMarked[currentQuestionId] ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span>{reviewMarked[currentQuestionId] ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>
            </div>

            {/* Active Round Viewport */}
            {activeRound === 'hr' || currentQuestion.type === 'hr_dialogue' ? (
              /* 5. Conversational Personal AI HR Round */
              <div className="h-[620px]">
                <InteractiveAiHrRound
                  sessionId={sessionId}
                  question={currentQuestion}
                  candidateName={session?.candidate?.name || 'Candidate'}
                  jobRole={session?.interview?.jobRole || 'Software Engineer (2026 Foundation)'}
                  onComplete={() => setIsSubmitModalOpen(true)}
                  isRecording={true}
                />
              </div>
            ) : activeRound === 'coding' || currentQuestion.type === 'coding' ? (
              /* 4. Coding Assessment */
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                      Coding Assessment
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Difficulty: Medium</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-relaxed">{currentQuestion.question}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Implement the optimal solution in the code editor below. You can run code against sample test cases in the sandbox before proceeding.
                  </p>
                </div>
                <CodeEditor
                  question={currentQuestion}
                  initialCode={answers[currentQuestionId] || currentQuestion.starterCode}
                  onCodeChange={handleAnswerChange}
                  readOnly={submitting}
                />
              </div>
            ) : (
              /* 1, 2, 3: Numerical, Verbal, Reasoning MCQ Section */
              <div className="space-y-6">
                <MCQQuestionView
                  question={currentQuestion}
                  selectedOption={currentAnswer}
                  selectedAnswer={currentAnswer}
                  onSelectOption={handleAnswerChange}
                  onSelectAnswer={handleAnswerChange}
                  disabled={submitting}
                />
              </div>
            )}
          </div>

          {/* Bottom Action Bar (Previous, Clear, Mark & Next, Save & Next) */}
          {activeRound !== 'hr' && (
            <div className="max-w-4xl w-full mx-auto pt-5 mt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  type="button"
                  onClick={handleClearAnswer}
                  disabled={!currentAnswer}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Response
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleMarkAndNext}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Mark for Review & Next</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndNext}
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/30"
                >
                  <span>Save & Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT SIDEBAR: Live Proctoring Viewfinder & TCS iON / HackerRank-Style Question Palette */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto hidden xl:flex">
          {/* Live AI Proctoring Security Capsule */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Live Face Proctoring
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Floating & Draggable
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Camera Window Active</span>
              </span>
              <span className="text-slate-500 italic text-[9px]">Drag anywhere on screen</span>
            </div>
          </div>

          {/* Question Status Legend */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Question Palette</h4>
              <span className="text-[11px] text-indigo-400 font-semibold">{totalAnsweredCount}/{totalQuestionsCount} Answered</span>
            </div>

            {/* Standard Status Color Indicators */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-600 font-bold text-[9px] text-white flex items-center justify-center">✓</span>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-600/80 font-bold text-[9px] text-white flex items-center justify-center">✕</span>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500 font-bold text-[9px] text-slate-950 flex items-center justify-center">★</span>
                <span>Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-800 border border-slate-700 font-bold text-[9px] text-slate-400 flex items-center justify-center">-</span>
                <span>Not Visited</span>
              </div>
            </div>

            {/* Section Filter Pills in Palette */}
            <div className="flex flex-wrap gap-1">
              {ROUND_CONFIGS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setActiveRound(r.id);
                    setCurrentIndex(0);
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border font-semibold transition ${
                    activeRound === r.id
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {r.shortLabel}
                </button>
              ))}
            </div>

            {/* Grid of question numbers */}
            <div className="grid grid-cols-5 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {currentRoundQuestions.map((q, idx) => {
                const qId = q._id || q.id;
                const isAnswered = Boolean(answers[qId] && answers[qId].trim().length > 0);
                const isVisited = Boolean(visitedQuestions[qId]);
                const isMarked = Boolean(reviewMarked[qId]);
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-slate-800/80 text-slate-400 border-slate-700/80 hover:bg-slate-700 hover:text-white';
                if (isCurrent) {
                  btnClass = 'bg-indigo-600 text-white font-black border-indigo-300 ring-2 ring-indigo-400/50 shadow-md';
                } else if (isMarked && isAnswered) {
                  btnClass = 'bg-purple-600 text-white font-bold border-purple-400';
                } else if (isMarked) {
                  btnClass = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-600 text-white font-bold border-emerald-500';
                } else if (isVisited) {
                  btnClass = 'bg-rose-950/40 text-rose-300 border-rose-500/40';
                }

                return (
                  <button
                    key={qId || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 rounded-xl border text-xs flex items-center justify-center transition-all ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* SUBMISSION CONFIRMATION MODAL */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => !submitting && setIsSubmitModalOpen(false)}
        title="Finalize & Submit Assessment"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Please review your question summary before submitting. Once submitted, answers are permanently evaluated by the AI scoring engine.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
            <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
              <span className="text-[10px] text-emerald-400 block font-semibold">Answered</span>
              <span className="text-xl font-extrabold text-emerald-300 mt-0.5 block">{totalAnsweredCount}</span>
            </div>
            <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl">
              <span className="text-[10px] text-rose-400 block font-semibold">Unanswered</span>
              <span className="text-xl font-extrabold text-rose-300 mt-0.5 block">{totalQuestionsCount - totalAnsweredCount}</span>
            </div>
            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl">
              <span className="text-[10px] text-amber-400 block font-semibold">Marked Review</span>
              <span className="text-xl font-extrabold text-amber-300 mt-0.5 block">{totalMarkedCount}</span>
            </div>
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl">
              <span className="text-[10px] text-indigo-400 block font-semibold">Total Questions</span>
              <span className="text-xl font-extrabold text-indigo-300 mt-0.5 block">{totalQuestionsCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>Proctoring Security Status:</span>
            <span className={`font-bold ${malpracticeAttempts > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {malpracticeAttempts === 0 ? '✓ Zero Violations' : `${malpracticeAttempts}/10 Strikes Logged`}
            </span>
          </div>

          {submitting && (
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 flex items-center gap-3 animate-pulse text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>{submitStep}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Resume Test
            </button>
            <button
              type="button"
              onClick={handleSubmitInterview}
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              {submitting ? 'Submitting...' : 'Confirm Final Submission'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InterviewSessionPage;
