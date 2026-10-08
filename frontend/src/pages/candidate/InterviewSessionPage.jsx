import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI, responseAPI } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import ProctoringCamera from '../../components/ProctoringCamera';
import ProctoringWarningOverlay from '../../components/ProctoringWarningOverlay';
import SpeechToTextButton from '../../components/SpeechToTextButton';
import CodeEditor from '../../components/CodeEditor';
import MCQQuestionView from '../../components/MCQQuestionView';
import { useMediaStream } from '../../hooks/useMediaStream';
import { useProctoringEngine } from '../../hooks/useProctoringEngine';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Mic,
  HeartHandshake,
  ShieldCheck,
  ShieldAlert,
  Volume2
} from 'lucide-react';

const ROUND_CONFIGS = [
  { id: 'mcq', label: '1. MCQ Round', icon: Check, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { id: 'technical', label: '2. Technical Round', icon: Cpu, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'aptitude', label: '3. Aptitude Round', icon: Sparkles, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'coding', label: '4. Coding Round', icon: Code2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'communication', label: '5. Communication Round', icon: Mic, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'hr', label: '6. HR Final AI', icon: HeartHandshake, color: 'text-rose-600 bg-rose-50 border-rose-200' }
];

const InterviewSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { success, error, warning } = useToast();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(2700); // 45 mins default

  // Active camera and microphone stream for the assessment
  const {
    stream,
    isCameraActive,
    isMicActive,
    audioLevel,
    toggleCamera,
    toggleMic
  } = useMediaStream({ video: true, audio: true, autoStart: true });

  const timerRef = useRef(null);

  // Terminate assessment immediately upon uncorrected malpractice
  const handleTerminateAssessment = async ({ reason, violationType }) => {
    try {
      await sessionAPI.terminate(sessionId, { reason, violationType });
    } catch (e) {
      console.warn('Termination API notice:', e.message);
    }
    navigate(`/candidate/terminated/${sessionId}`, {
      state: { reason, violationType }
    });
  };

  // AI Proctoring Engine: Computer Vision Face & Gaze Tracking
  const {
    isOutOfFrame,
    isLookingAway,
    activeViolation,
    countdownSeconds,
    isTerminated
  } = useProctoringEngine({
    stream,
    isCameraActive,
    onTerminate: handleTerminateAssessment,
    enabled: !loading && !submitting
  });

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
      const qList = sess.interview?.questions || [];
      setQuestions(qList);

      // Pre-fill existing responses
      const initialAnswers = {};
      (sess.responses || []).forEach((r) => {
        initialAnswers[r.questionId] = r.candidateAnswer;
      });
      setAnswers(initialAnswers);

      // Initialize timer based on interview duration
      const durationMins = sess.interview?.duration || 45;
      setTimeLeftSeconds(durationMins * 60);

      // Start timer
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      error(err.message || 'Failed to load interview session');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionRound = (q) => {
    if (!q) return 'technical';
    if (q.round) return q.round;
    const cat = (q.category || '').toLowerCase();
    const title = (q.question || '').toLowerCase();
    if (q.type === 'coding' || title.includes('two sum') || title.includes('code')) return 'coding';
    if (q.options && q.options.length > 0) {
      if (cat.includes('aptitude') || cat.includes('reasoning') || title.includes('microchip') || title.includes('cluster')) {
        return 'aptitude';
      }
      return 'mcq';
    }
    if (q.type === 'speech' || cat.includes('communication') || title.includes('verbal') || title.includes('incident')) {
      return 'communication';
    }
    if (cat.includes('hr') || cat.includes('behavioral') || title.includes('disagreement')) return 'hr';
    return 'technical';
  };

  const currentQuestion = questions[currentIndex];
  const currentRoundId = getQuestionRound(currentQuestion);
  const currentRoundConfig = ROUND_CONFIGS.find((r) => r.id === currentRoundId) || ROUND_CONFIGS[1];
  const currentAnswer = currentQuestion ? answers[currentQuestion._id || currentQuestion.id] || '' : '';

  const handleAnswerChange = (text) => {
    if (!currentQuestion) return;
    const qId = currentQuestion._id || currentQuestion.id;
    setAnswers((prev) => ({
      ...prev,
      [qId]: text
    }));
  };

  const handleVoiceTranscript = (spokenText) => {
    if (!currentQuestion) return;
    const qId = currentQuestion._id || currentQuestion.id;
    const existing = answers[qId] ? answers[qId].trim() + ' ' : '';
    const updated = existing + spokenText;
    setAnswers((prev) => ({
      ...prev,
      [qId]: updated
    }));
    autosaveAnswer(qId, updated);
  };

  // Autosave answer on question change
  const autosaveAnswer = async (qId, ansText) => {
    if (!sessionId || !qId) return;
    try {
      await responseAPI.saveAnswer({
        sessionId,
        questionId: qId,
        candidateAnswer: ansText || ''
      });
    } catch (err) {
      console.warn('Autosave background notice:', err.message);
    }
  };

  const handleNext = () => {
    if (currentQuestion) {
      autosaveAnswer(currentQuestion._id || currentQuestion.id, currentAnswer);
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion) {
      autosaveAnswer(currentQuestion._id || currentQuestion.id, currentAnswer);
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    if (currentQuestion) {
      autosaveAnswer(currentQuestion._id || currentQuestion.id, currentAnswer);
    }
    setCurrentIndex(index);
  };

  const handleJumpToRound = (roundId) => {
    const targetIdx = questions.findIndex((q) => getQuestionRound(q) === roundId);
    if (targetIdx !== -1) {
      handleJumpToQuestion(targetIdx);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSubmitInterview = async () => {
    setIsSubmitModalOpen(false);
    setSubmitting(true);

    try {
      setSubmitStep('Compiling multi-round assessment submissions...');
      const payloadAnswers = questions.map((q) => {
        const qId = q._id || q.id;
        return {
          questionId: qId,
          candidateAnswer: answers[qId] || ''
        };
      });

      setTimeout(() => {
        setSubmitStep('Executing AI Technical & NLP Sentiment Evaluation...');
      }, 1000);

      setTimeout(() => {
        setSubmitStep('Generating final multi-round evaluation dossier...');
      }, 2000);

      await sessionAPI.submit(sessionId, {
        answers: payloadAnswers
      });

      success('Assessment submitted successfully! Evaluation completed.');
      navigate(`/candidate/complete/${sessionId}`);
    } catch (err) {
      error(err.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing 6-round proctored assessment environment..." />;
  }

  if (submitting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner
          message={submitStep}
          submessage="AI pipeline is evaluating MCQs, code correctness, verbal communication, and technical depth."
          isAi={true}
        />
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter((a) => (a || '').trim().length > 0).length;
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const charCount = currentAnswer.length;
  const RoundIcon = currentRoundConfig.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Zero-Tolerance Proctoring Malpractice Warning Overlay */}
      <ProctoringWarningOverlay
        activeViolation={activeViolation}
        countdownSeconds={countdownSeconds}
        isTerminated={isTerminated}
      />

      {/* Top Header bar with Progress, Telemetry, and Timer */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {session?.interview?.title}
          </span>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Proctoring Status & Timer */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold border border-slate-800 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider">AI Proctoring Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mic: {audioLevel > 5 ? `${audioLevel}%` : 'Listening'}</span>
          </div>

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
              timeLeftSeconds < 300
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Time Left: {formatTime(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition shadow-md shadow-emerald-600/20"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Interview</span>
          </button>
        </div>
      </div>

      {/* 6 Assessment Rounds Navigation Tabs */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {ROUND_CONFIGS.map((rnd) => {
            const isRoundActive = currentRoundId === rnd.id;
            const RndIcon = rnd.icon;
            const roundQuestions = questions.filter((q) => getQuestionRound(q) === rnd.id);
            const roundAnswered = roundQuestions.filter((q) => (answers[q._id || q.id] || '').trim().length > 0).length;

            return (
              <button
                key={rnd.id}
                type="button"
                onClick={() => handleJumpToRound(rnd.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isRoundActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                <RndIcon className={`w-3.5 h-3.5 ${isRoundActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{rnd.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isRoundActive ? 'bg-slate-800 text-indigo-300' : 'bg-slate-200 text-slate-600'
                }`}>
                  {roundAnswered}/{roundQuestions.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar & Question Jump Palette */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Overall Assessment Progress: {Math.round((answeredCount / questions.length) * 100)}%</span>
          <span>{answeredCount} / {questions.length} Answered Across All Rounds</span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Bubble Palette */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const qId = q._id || q.id;
            const hasAnswer = (answers[qId] || '').trim().length > 0;
            const qRnd = getQuestionRound(q);

            return (
              <button
                key={qId}
                onClick={() => handleJumpToQuestion(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2'
                    : hasAnswer
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={`Q${idx + 1} (${qRnd.toUpperCase()})`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card with Dynamic Per-Round Renderers */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white flex items-center gap-1.5 shadow-sm">
                <RoundIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentRoundConfig.label}</span>
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                {currentQuestion.category}
              </span>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                Difficulty: {currentQuestion.difficulty}
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Max Score: {currentQuestion.maxScore || 10} Points
            </div>
          </div>

          {/* Question Text */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
            <p className="mt-1.5 text-xs text-slate-500">
              {currentRoundId === 'mcq' || currentRoundId === 'aptitude'
                ? 'Select the single best answer option below.'
                : currentRoundId === 'coding'
                ? 'Write clean, optimal code in the editor below and validate against test cases.'
                : currentRoundId === 'communication'
                ? 'Click "Dictate with Microphone" to record your verbal briefing response.'
                : 'Formulate a comprehensive, technically sound answer. Definitions, mechanisms, and examples are evaluated.'}
            </p>
          </div>

          {/* Dynamic Input Body: MCQ / Coding / Speech / Text */}
          {currentRoundId === 'mcq' || currentRoundId === 'aptitude' || (currentQuestion.options && currentQuestion.options.length > 0) ? (
            <MCQQuestionView
              question={currentQuestion}
              selectedAnswer={currentAnswer}
              onSelectAnswer={(opt) => {
                handleAnswerChange(opt);
                autosaveAnswer(currentQuestion._id || currentQuestion.id, opt);
              }}
            />
          ) : currentRoundId === 'coding' || currentQuestion.type === 'coding' ? (
            <CodeEditor
              code={currentAnswer || currentQuestion.starterCode}
              starterCode={currentQuestion.starterCode}
              testCases={currentQuestion.testCases}
              onChange={(codeVal) => {
                handleAnswerChange(codeVal);
                autosaveAnswer(currentQuestion._id || currentQuestion.id, codeVal);
              }}
            />
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-slate-600">
                <label htmlFor="answer-box">Your Response</label>
                <div className="flex items-center gap-3">
                  <SpeechToTextButton onTranscript={handleVoiceTranscript} />
                  <div className="flex items-center gap-2 text-slate-400 font-normal">
                    <span>{wordCount} Words</span>
                    <span>•</span>
                    <span>{charCount} Characters</span>
                  </div>
                </div>
              </div>

              <textarea
                id="answer-box"
                rows={currentRoundId === 'communication' ? 6 : 8}
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder={
                  currentRoundId === 'communication'
                    ? 'Speak your response using the microphone button above, or type your structured executive briefing here...'
                    : 'Type your detailed answer or click "Dictate with Microphone" to speak. Describe fundamental principles, relevant frameworks, and practical examples...'
                }
                className="w-full p-4 text-sm bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition leading-relaxed"
              />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Question</span>
            </button>

            <div className="flex items-center gap-2">
              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Final Multi-Round Assessment</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Multi-Round Assessment"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you ready to submit your assessment? You have completed{' '}
            <strong className="text-slate-900">{answeredCount}</strong> of{' '}
            <strong className="text-slate-900">{questions.length}</strong> questions across all 6 rounds.
          </p>

          {questions.length - answeredCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                You have <strong>{questions.length - answeredCount}</strong> unanswered questions. Unanswered questions will receive 0 marks.
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed">
            Upon confirmation, the automated AI pipeline evaluates your MCQ answers, technical concept coverage, code correctness, verbal communication, and HR behavioral sentiment.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Continue Answering
            </button>
            <button
              onClick={handleSubmitInterview}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition"
            >
              Confirm Submission
            </button>
          </div>
        </div>
      </Modal>

      {/* Floating Picture-in-Picture Proctoring Camera Widget */}
      <ProctoringCamera
        stream={stream}
        isCameraActive={isCameraActive}
        isMicActive={isMicActive}
        audioLevel={audioLevel}
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMic}
        warningCount={isOutOfFrame || isLookingAway ? 1 : 0}
      />
    </div>
  );
};

export default InterviewSessionPage;
