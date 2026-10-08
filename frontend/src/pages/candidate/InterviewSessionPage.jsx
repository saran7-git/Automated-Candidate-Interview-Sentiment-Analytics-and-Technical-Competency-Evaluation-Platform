import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionAPI, responseAPI } from '../../api/client';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import ProctoringCamera from '../../components/ProctoringCamera';
import SpeechToTextButton from '../../components/SpeechToTextButton';
import { useMediaStream } from '../../hooks/useMediaStream';
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
  RotateCcw,
  Camera,
  Mic,
  ShieldCheck,
  Volume2
} from 'lucide-react';

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
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1800); // 30 mins default
  const [warningCount, setWarningCount] = useState(0);

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

  // Proctoring: Detect window blur / tab switching
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount((prev) => {
          const next = prev + 1;
          warning(`Assessment Alert (${next}): Tab switch detected. Please stay focused on the assessment window.`);
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [warning]);

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
      const durationMins = sess.interview?.duration || 30;
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

  const currentQuestion = questions[currentIndex];
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
      console.warn('Autosave background failure:', err.message);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSubmitInterview = async () => {
    setIsSubmitModalOpen(false);
    setSubmitting(true);

    try {
      // Step 1: Submitting answers
      setSubmitStep('Analyzing candidate response...');
      const payloadAnswers = questions.map((q) => {
        const qId = q._id || q.id;
        return {
          questionId: qId,
          candidateAnswer: answers[qId] || ''
        };
      });

      // Step 2 & 3: AI execution
      setTimeout(() => {
        setSubmitStep('Evaluating technical competency & sentiment tone...');
      }, 1000);

      setTimeout(() => {
        setSubmitStep('Generating final interview insights and score breakdown...');
      }, 2000);

      const res = await sessionAPI.submit(sessionId, {
        answers: payloadAnswers
      });

      success('Interview submitted successfully! AI evaluation complete.');
      navigate(`/candidate/complete/${sessionId}`);
    } catch (err) {
      error(err.message || 'Submission failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Preparing interview environment..." />;
  }

  if (submitting) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner
          message={submitStep}
          submessage="AI NLP pipeline is parsing responses, matching concepts, and calculating competency metrics."
          isAi={true}
        />
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter((a) => (a || '').trim().length > 0).length;
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
  const charCount = currentAnswer.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header bar with progress and timer */}
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
            <span className="text-[11px] uppercase tracking-wider">AI Proctored</span>
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

      {/* Progress Bar & Question Jump Palette */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>Overall Progress: {Math.round((answeredCount / questions.length) * 100)}%</span>
          <span>{answeredCount} / {questions.length} Answered</span>
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
                title={`Question ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
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
              Please formulate a complete, technically sound response. Provide definitions, key mechanisms, and practical examples.
            </p>
          </div>

          {/* Answer Textarea */}
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
              rows={8}
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your detailed answer or click 'Dictate with Microphone' above to speak naturally. Describe fundamental principles, relevant frameworks, and practical examples..."
              className="w-full p-4 text-sm bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition leading-relaxed"
            />
          </div>

          {/* Navigation controls */}
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
                  <span>Submit Final Interview</span>
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
        title="Submit Interview for Evaluation"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            You have completed <strong>{answeredCount}</strong> out of <strong>{questions.length}</strong> questions.
          </p>

          {answeredCount < questions.length && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <span>
                You have <strong>{questions.length - answeredCount}</strong> unanswered questions. Unanswered questions will receive 0 technical marks.
              </span>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed">
            Upon clicking "Confirm Submission", the AI sentiment analysis and technical competency evaluation pipeline will automatically process your responses.
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
        warningCount={warningCount}
      />
    </div>
  );
};

export default InterviewSessionPage;
