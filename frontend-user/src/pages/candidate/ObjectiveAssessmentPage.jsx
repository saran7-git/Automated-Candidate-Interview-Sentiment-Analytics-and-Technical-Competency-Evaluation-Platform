import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { assessmentAPI, proctoringAPI } from '../../services/api';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  Shield,
  HelpCircle,
  X,
  FileCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const ObjectiveAssessmentPage = () => {
  const { sectionType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({}); // { [questionId]: selectedOption }
  const [flaggedMap, setFlaggedMap] = useState({}); // { [questionId]: boolean }
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [error, setError] = useState(null);

  // Tab switch / visibility monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && session?.id) {
        proctoringAPI
          .logEvent({
            sessionId: session.id,
            sessionType: 'assessment',
            eventType: 'tab_switch',
            severity: 'medium',
            details: 'Candidate switched active browser tab or minimized window during timed exam.',
          })
          .catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session?.id]);

  // Initialize Assessment Session
  useEffect(() => {
    const initSession = async () => {
      try {
        const targetSection = sectionType || location.state?.section?.id || 'aptitude';
        const res = await assessmentAPI.startSession(targetSection);

        if (res.data?.success && res.data?.session) {
          const sess = res.data.session;
          setSession(sess);
          setQuestions(sess.questions || []);
          setTimeRemaining(sess.remainingSeconds || 30 * 60);

          // Populate existing saved answers
          const ansMap = {};
          const flagMap = {};
          (sess.savedAnswers || []).forEach((a) => {
            if (a.selected_option !== null && a.selected_option !== undefined) {
              ansMap[a.question_id] = Number(a.selected_option);
            }
            if (a.is_flagged) {
              flagMap[a.question_id] = true;
            }
          });
          setAnswersMap(ansMap);
          setFlaggedMap(flagMap);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to initialize assessment. Please try again.');
      }
    };

    initSession();
  }, [sectionType]);

  // Server-authoritative timer countdown
  useEffect(() => {
    if (!session || isSubmitting || submitResult) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.id, isSubmitting, submitResult]);

  const handleAutoSubmit = async () => {
    if (isSubmitting || submitResult) return;
    setIsSubmitting(true);
    try {
      const res = await assessmentAPI.submitSession(session.id);
      if (res.data?.success) {
        setSubmitResult(res.data.result);
      }
    } catch (err) {
      setError('Auto-submission error: ' + (err.message || 'Server timeout.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentIndex] || null;
  const currentQId = currentQuestion?.id;
  const selectedOption = currentQId !== undefined ? answersMap[currentQId] : undefined;
  const isCurrentFlagged = currentQId !== undefined ? !!flaggedMap[currentQId] : false;

  const handleSelectOption = async (optionIdx) => {
    if (!currentQId || !session) return;

    const updatedAnswers = { ...answersMap, [currentQId]: optionIdx };
    setAnswersMap(updatedAnswers);

    // Autosave to server
    setIsSaving(true);
    try {
      await assessmentAPI.saveAnswer(session.id, {
        questionId: currentQId,
        selectedOption: optionIdx,
        isFlagged: isCurrentFlagged,
        timeSpentSeconds: 30,
      });
      setLastSavedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.warn('Autosave notice:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearOption = async () => {
    if (!currentQId || !session) return;

    const updatedAnswers = { ...answersMap };
    delete updatedAnswers[currentQId];
    setAnswersMap(updatedAnswers);

    setIsSaving(true);
    try {
      await assessmentAPI.saveAnswer(session.id, {
        questionId: currentQId,
        selectedOption: null,
        isFlagged: isCurrentFlagged,
        timeSpentSeconds: 15,
      });
      setLastSavedTime(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.warn('Autosave notice:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFlag = async () => {
    if (!currentQId || !session) return;

    const newFlagState = !isCurrentFlagged;
    setFlaggedMap((prev) => ({ ...prev, [currentQId]: newFlagState }));

    try {
      await assessmentAPI.saveAnswer(session.id, {
        questionId: currentQId,
        selectedOption: selectedOption !== undefined ? selectedOption : null,
        isFlagged: newFlagState,
        timeSpentSeconds: 10,
      });
    } catch (err) {
      console.warn('Flag save notice:', err.message);
    }
  };

  const handleVoluntarySubmit = async () => {
    if (!session) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const res = await assessmentAPI.submitSession(session.id);
      if (res.data?.success) {
        setSubmitResult(res.data.result);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answersMap).length;
  const flaggedCount = Object.values(flaggedMap).filter(Boolean).length;
  const totalCount = questions.length || 20;
  const unansweredCount = Math.max(0, totalCount - answeredCount);

  // If assessment has been submitted, show Scorecard View
  if (submitResult) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="enterprise-card p-8 md:p-10 bg-white text-center rounded-2xl shadow-sm border border-slate-200 max-w-2xl w-full">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-2">
            Assessment Completed
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {submitResult.title || 'Assessment Submitted Successfully'}
          </h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto mb-8">
            Your responses have been verified against the question bank answer keys. Your performance has been logged in your assessment profile.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-semibold mb-1">Total Questions</div>
              <div className="text-xl font-bold text-slate-900">{submitResult.totalQuestions}</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] text-slate-500 font-semibold mb-1">Answered</div>
              <div className="text-xl font-bold text-slate-900">{submitResult.answeredCount}</div>
            </div>
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
              <div className="text-[11px] text-teal-700 font-semibold mb-1">Score</div>
              <div className="text-xl font-bold text-teal-800">
                {submitResult.score} / {submitResult.maxScore}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="text-[11px] text-emerald-700 font-semibold mb-1">Accuracy</div>
              <div className="text-xl font-bold text-emerald-800">{submitResult.percentage}%</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/assessments')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Back to Assessment Suite
            </button>
            <button
              onClick={() => navigate('/candidate/comprehensive-report')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              View Comprehensive Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 flex items-center justify-center">
        <div className="enterprise-card p-8 bg-white border border-rose-200 rounded-2xl shadow-sm max-w-md w-full text-center">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Unable to Load Assessment</h2>
          <p className="text-xs text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/assessments')}
            className="w-full px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Return to Assessment Hub
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Preparing Assessment Environment...</p>
        </div>
      </div>
    );
  }

  const isTimerCritical = timeRemaining <= 300; // < 5 mins
  const isTimerUrgent = timeRemaining <= 60; // < 1 min

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Assessment Navigation & Status Bar */}
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

            <span className="badge-navy uppercase tracking-wider text-[11px] truncate">
              {session?.section_type?.replace('_', ' ')} Exam
            </span>

            <span className="hidden sm:inline-block text-slate-300">•</span>

            <h1 className="text-sm font-bold text-slate-800 truncate">
              Question {currentIndex + 1} of {totalCount}
            </h1>

            {lastSavedTime && (
              <span className="hidden lg:inline-flex text-[11px] text-slate-500 items-center gap-1 ml-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Autosaved at {lastSavedTime}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Server Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono text-xs font-bold transition-colors ${
                isTimerUrgent
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : isTimerCritical
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Finish & Submit</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols): Question Statement & Options */}
          <div className="lg:col-span-8 space-y-6">
            <div className="enterprise-card p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              {/* Question Metadata Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Topic: <span className="text-slate-800 font-semibold">{currentQuestion.topic || 'General'}</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="badge-teal text-[11px] font-bold">{currentQuestion.difficulty || 'Medium'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFlag}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isCurrentFlagged
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-600 text-amber-600' : ''}`}
                    />
                    <span>{isCurrentFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
                  </button>
                  <span className="badge-navy text-[11px] font-semibold">{currentQuestion.marks || 1} Mark</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-6">
                <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                  {currentQuestion.statement}
                </p>
              </div>

              {/* 4 Multiple Choice Options */}
              <div className="space-y-3 mb-8">
                {(currentQuestion.options || []).map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  const optionLabel = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'bg-teal-50/70 border-teal-500 ring-1 ring-teal-500 shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {optionLabel}
                      </div>
                      <span className="text-sm font-medium text-slate-800 leading-relaxed pt-0.5">
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedOption === undefined}
                    onClick={handleClearOption}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Clear Selection
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentIndex < totalCount - 1) {
                        setCurrentIndex((prev) => prev + 1);
                      } else {
                        setShowConfirmModal(true);
                      }
                    }}
                    className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>{currentIndex < totalCount - 1 ? 'Save & Next' : 'Proceed to Submit'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Sticky Question Navigation Palette */}
          <div className="lg:col-span-4 space-y-4">
            <div className="enterprise-card p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs sticky top-20">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
                <span>Question Palette</span>
                <span className="text-xs text-slate-500 font-semibold">{totalCount} Questions</span>
              </h3>

              {/* Palette Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600 flex-shrink-0" />
                  <span>Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500 flex-shrink-0" />
                  <span>Flagged ({flaggedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 flex-shrink-0" />
                  <span>Unanswered ({unansweredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded ring-2 ring-teal-500 flex-shrink-0" />
                  <span>Current</span>
                </div>
              </div>

              {/* 1 to 20 Questions Grid */}
              <div className="grid grid-cols-5 gap-2.5 mb-6">
                {questions.map((q, idx) => {
                  const isAnswered = answersMap[q.id] !== undefined;
                  const isFlagged = !!flaggedMap[q.id];
                  const isCurrent = idx === currentIndex;

                  let btnClass = 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100';
                  if (isAnswered) {
                    btnClass = 'bg-emerald-600 text-white font-bold shadow-2xs';
                  }
                  if (isFlagged) {
                    btnClass = 'bg-amber-500 text-white font-bold';
                  }
                  if (isCurrent) {
                    btnClass += ' ring-2 ring-teal-500 ring-offset-2';
                  }

                  return (
                    <button
                      key={q.id || idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${btnClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Quick Submit Button */}
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Submit Assessment Section</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Voluntary Submission Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="enterprise-card p-6 md:p-8 bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Submit Assessment Section?
            </h3>
            <p className="text-xs text-slate-600 text-center mb-6">
              Once submitted, you will not be able to modify your answers for this section.
            </p>

            <div className="space-y-2 p-3 bg-slate-50 rounded-xl text-xs mb-6 border border-slate-200">
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Answered Questions:</span>
                <span className="font-bold text-emerald-700">
                  {answeredCount} of {totalCount}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Flagged for Review:</span>
                <span className="font-bold text-amber-700">{flaggedCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Unanswered Questions:</span>
                <span className="font-bold text-rose-700">{unansweredCount}</span>
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
                Back to Test
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleVoluntarySubmit}
                className="flex-1 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Yes, Submit Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="enterprise-card p-6 bg-white max-w-sm w-full rounded-2xl shadow-xl border border-slate-200 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-2">Leave Assessment?</h3>
            <p className="text-xs text-slate-600 mb-6">
              Your saved answers will remain saved on the server. The timer will continue to count down until submitted.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Continue Exam
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

export default ObjectiveAssessmentPage;
