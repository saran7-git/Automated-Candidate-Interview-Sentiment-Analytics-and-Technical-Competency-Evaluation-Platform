import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewService, recordingService } from '../../services/api';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { useAudioMeter } from '../../hooks/useAudioMeter';
import { WebcamCard } from '../../components/interview/WebcamCard';
import { SubmissionModal } from '../../components/interview/SubmissionModal';
import { ScreenShareWarningModal } from '../../components/interview/ScreenShareWarningModal';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Send,
  HelpCircle,
  Sparkles,
  Mic,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Volume2
} from 'lucide-react';

export const InterviewActivePage = () => {
  const navigate = useNavigate();

  // Interview state
  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: { textAnswer, timeSpent, timestampOffset } }
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState(null);

  // Countdown timer state
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // in seconds
  const timerRef = useRef(null);

  // Upload & Submission Modal State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStep, setUploadStep] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitError, setSubmitError] = useState('');

  // Media Recording Hook
  const {
    userStream,
    screenStream,
    isRecording,
    recordingDuration,
    isScreenSharingStopped,
    requestUserMedia,
    requestScreenMedia,
    startRecording,
    stopRecording,
    stopAllStreams,
    markQuestionTimestamp,
  } = useMediaRecorder();

  // Real-time audio analyzer for mic level meters
  const { audioLevel, frequencyData } = useAudioMeter(userStream, true);

  // Track per-question time spent
  const questionStartTimeRef = useRef(Date.now());

  // 1. Initialize Interview and Media Streams on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const storedConfig = sessionStorage.getItem('interview_config');
        const config = storedConfig
          ? JSON.parse(storedConfig)
          : { domain: 'React.js', difficulty: 'Medium', questionCount: 5 };

        // 1. Start interview on backend
        const res = await interviewService.startInterview(config);
        if (!res.data.success) {
          throw new Error(res.data.message || 'Failed to initialize interview.');
        }

        const interviewData = res.data.interview;
        setInterview(interviewData);

        // Calculate timer: 3 mins per question
        const totalAllocatedSeconds = (interviewData.questions.length || 5) * (
          interviewData.difficulty === 'Easy' ? 2 * 60 : interviewData.difficulty === 'Medium' ? 3 * 60 : 4 * 60
        );
        setTimeRemaining(totalAllocatedSeconds);

        // Pre-fill answer state
        const initialAnswers = {};
        interviewData.questions.forEach((q, idx) => {
          const qId = q.questionId || q._id;
          initialAnswers[qId] = {
            textAnswer: '',
            timeSpent: 0,
            timestampOffset: idx === 0 ? 0 : null,
          };
        });
        setAnswers(initialAnswers);

        // 2. Request hardware and screen streams
        const activeUserStream = await requestUserMedia();
        const activeScreenStream = await requestScreenMedia();

        // 3. Begin Media Recording automatically
        if (activeUserStream) {
          startRecording(activeUserStream, activeScreenStream);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Interview init error:', err);
        setInitError(err.message || 'Failed to launch interview session.');
        setIsLoading(false);
      }
    };

    initSession();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. Countdown Timer Loop
  useEffect(() => {
    if (isLoading || !interview) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, interview]);

  // Save current question's time spent when switching questions
  const recordCurrentQuestionTime = () => {
    if (!interview) return;
    const currentQ = interview.questions[currentIndex];
    if (!currentQ) return;
    const qId = currentQ.questionId || currentQ._id;
    const elapsedOnThisQuestion = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        timeSpent: (prev[qId]?.timeSpent || 0) + elapsedOnThisQuestion,
      },
    }));

    questionStartTimeRef.current = Date.now();
  };

  const handleNextQuestion = () => {
    recordCurrentQuestionTime();
    if (currentIndex < (interview?.questions?.length || 0) - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      markQuestionTimestamp(nextIdx);

      const nextQ = interview.questions[nextIdx];
      const nextQId = nextQ.questionId || nextQ._id;

      // Update timestamp offset if not already recorded
      setAnswers((prev) => {
        if (prev[nextQId] && prev[nextQId].timestampOffset === null) {
          return {
            ...prev,
            [nextQId]: { ...prev[nextQId], timestampOffset: recordingDuration },
          };
        }
        return prev;
      });
    }
  };

  const handlePrevQuestion = () => {
    recordCurrentQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleJumpToQuestion = (targetIdx) => {
    recordCurrentQuestionTime();
    setCurrentIndex(targetIdx);
    markQuestionTimestamp(targetIdx);

    const targetQ = interview.questions[targetIdx];
    const targetQId = targetQ.questionId || targetQ._id;

    setAnswers((prev) => {
      if (prev[targetQId] && prev[targetQId].timestampOffset === null) {
        return {
          ...prev,
          [targetQId]: { ...prev[targetQId], timestampOffset: recordingDuration },
        };
      }
      return prev;
    });
  };

  const handleAnswerChange = (text) => {
    if (!interview) return;
    const currentQ = interview.questions[currentIndex];
    const qId = currentQ.questionId || currentQ._id;

    setAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        textAnswer: text,
      },
    }));
  };

  const toggleFlag = (idx) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  // 3. Interview Submission & Upload Pipeline
  const handleAutoSubmit = () => {
    handleSubmitInterview(true);
  };

  const handleSubmitInterview = async (isTimeUp = false) => {
    if (isSubmitting) return;
    recordCurrentQuestionTime();

    setIsSubmitting(true);
    setUploadStep('stopping');
    setUploadProgress(10);
    setSubmitError('');

    try {
      // 1. Stop all recorders and obtain final blobs
      const recordedData = await stopRecording();
      setUploadProgress(25);

      const interviewId = interview._id;

      // 2. Upload Candidate Webcam Recording
      if (recordedData.webcamBlob) {
        setUploadStep('uploading_webcam');
        const webcamForm = new FormData();
        webcamForm.append('file', recordedData.webcamBlob, `webcam_${interviewId}.webm`);
        webcamForm.append('interviewId', interviewId);
        webcamForm.append('type', 'webcam');
        webcamForm.append('duration', recordedData.duration);

        await recordingService.uploadRecording(webcamForm, (pct) => {
          setUploadProgress(Math.round(25 + pct * 0.25)); // 25% -> 50%
        });
      }

      // 3. Upload Candidate Screen Recording
      if (recordedData.screenBlob) {
        setUploadStep('uploading_screen');
        const screenForm = new FormData();
        screenForm.append('file', recordedData.screenBlob, `screen_${interviewId}.webm`);
        screenForm.append('interviewId', interviewId);
        screenForm.append('type', 'screen');
        screenForm.append('duration', recordedData.duration);

        await recordingService.uploadRecording(screenForm, (pct) => {
          setUploadProgress(Math.round(50 + pct * 0.20)); // 50% -> 70%
        });
      }

      // 4. Upload Pure Audio Stream
      if (recordedData.audioBlob) {
        setUploadStep('uploading_audio');
        const audioForm = new FormData();
        audioForm.append('file', recordedData.audioBlob, `audio_${interviewId}.webm`);
        audioForm.append('interviewId', interviewId);
        audioForm.append('type', 'audio');
        audioForm.append('duration', recordedData.duration);

        await recordingService.uploadRecording(audioForm, (pct) => {
          setUploadProgress(Math.round(70 + pct * 0.15)); // 70% -> 85%
        });
      }

      // 5. Submit Answers and Run Automated AI Evaluation
      setUploadStep('evaluating');
      setUploadProgress(90);

      const formattedAnswers = interview.questions.map((q, idx) => {
        const qId = q.questionId || q._id;
        const ansObj = answers[qId] || {};
        const recordedOffset = recordedData.questionTimestamps[idx] ?? (ansObj.timestampOffset || idx * 60);

        return {
          questionId: qId,
          textAnswer: ansObj.textAnswer || '',
          timeSpent: ansObj.timeSpent || 0,
          timestampOffset: recordedOffset,
        };
      });

      const submitRes = await interviewService.submitInterview(interviewId, {
        answers: formattedAnswers,
        duration: recordedData.duration,
      });

      if (!submitRes.data.success) {
        throw new Error(submitRes.data.message || 'Evaluation failed.');
      }

      setUploadStep('completed');
      setUploadProgress(100);

      // Stop camera/mic hardware
      stopAllStreams();

      // Redirect to comprehensive results dashboard
      setTimeout(() => {
        navigate(`/candidate/results/${interviewId}`);
      }, 1200);
    } catch (err) {
      console.error('Submission Error:', err);
      setUploadStep('error');
      setSubmitError(err.message || 'An error occurred while uploading recordings and submitting answers.');
      setIsSubmitting(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-base font-bold text-white">Launching Secure Interview Room...</p>
          <p className="text-xs text-slate-400">Initializing camera, mic, and screen recording pipelines</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="max-w-md mx-auto my-12 glass-panel p-8 rounded-3xl border border-rose-500/30 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Interview Launch Error</h3>
        <p className="text-xs text-slate-300">{initError}</p>
        <button
          onClick={() => navigate('/candidate/setup')}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold rounded-xl text-xs transition-colors"
        >
          Return to Setup
        </button>
      </div>
    );
  }

  const currentQuestion = interview?.questions[currentIndex];
  const currentQId = currentQuestion?.questionId || currentQuestion?._id;
  const currentAnswer = answers[currentQId]?.textAnswer || '';
  const isTimeLow = timeRemaining <= 180; // 3 minutes remaining

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {interview?.domain} • {interview?.difficulty}
          </span>
          <span className="h-4 w-px bg-slate-700 hidden sm:block"></span>
          <span className="text-sm font-extrabold text-white">
            Question {currentIndex + 1} of {interview?.questions?.length}
          </span>
        </div>

        {/* Countdown Timer Badge */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isTimeLow
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse'
                : 'bg-dark-900/80 text-slate-200 border-slate-700'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeLow ? 'text-rose-400' : 'text-brand-400'}`} />
            <span>Time Remaining: {formatTime(timeRemaining)}</span>
          </div>

          <button
            onClick={() => handleSubmitInterview(false)}
            disabled={isSubmitting}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Interview</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Webcam & Live Hardware Monitoring */}
        <div className="lg:col-span-4 space-y-4">
          <WebcamCard
            userStream={userStream}
            screenStream={screenStream}
            isRecording={isRecording}
            duration={recordingDuration}
            isScreenActive={!isScreenSharingStopped && !!screenStream}
            audioBands={frequencyData}
            audioLevel={audioLevel}
          />

          {/* Quick Question Navigation Pills */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
              <span>Question Palette</span>
              <span className="text-[10px] text-slate-400">
                {Object.values(answers).filter((a) => a.textAnswer.trim().length > 0).length} / {interview?.questions.length} Answered
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {interview?.questions.map((q, idx) => {
                const qId = q.questionId || q._id;
                const isAnswered = answers[qId]?.textAnswer?.trim().length > 0;
                const isCurrent = currentIndex === idx;
                const isFlagged = flaggedQuestions[idx];

                return (
                  <button
                    key={idx}
                    onClick={() => handleJumpToQuestion(idx)}
                    className={`relative h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'bg-brand-500 text-dark-950 ring-2 ring-brand-400 shadow-md'
                        : isAnswered
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-dark-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-dark-950" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Question Prompt, Text Answer & Spoken Guidance */}
        <div className="lg:col-span-8 space-y-5">
          {/* Question Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold">
                  {currentQuestion?.skill || currentQuestion?.domain}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  {currentQuestion?.marks || 10} Marks
                </span>
              </div>

              <button
                type="button"
                onClick={() => toggleFlag(currentIndex)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  flaggedQuestions[currentIndex]
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-dark-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{flaggedQuestions[currentIndex] ? 'Flagged' : 'Flag for Review'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {currentQuestion?.questionText || currentQuestion?.question}
              </h2>
            </div>

            {/* Answer Input Area */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300 uppercase">
                  Candidate Technical Explanation
                </label>
                <span className="text-slate-400 font-mono">
                  {currentAnswer.length} characters ({currentAnswer.split(/\s+/).filter(Boolean).length} words)
                </span>
              </div>

              <textarea
                rows={8}
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your structured technical explanation here. Mention key architecture, mechanics, edge cases, and design trade-offs..."
                className="w-full p-4 bg-dark-900 border border-slate-700 rounded-2xl text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-mono placeholder:font-sans placeholder:text-slate-500 leading-relaxed"
              />

              {/* Spoken Answer Banner */}
              <div className="p-4 rounded-2xl bg-dark-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-200">Verbal & Audio Explanation Active</span>
                    <p className="text-[11px] text-slate-400">
                      You can also speak your answer out loud. The interviewer will listen to your audio stream.
                    </p>
                  </div>
                </div>
                <span className="text-emerald-400 font-bold shrink-0 flex items-center gap-1">
                  ● Mic Recording
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handlePrevQuestion}
                disabled={currentIndex === 0}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < (interview?.questions?.length || 0) - 1 ? (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-brand-500 hover:bg-brand-400 text-dark-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-md shadow-brand-500/20"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmitInterview(false)}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center gap-2"
                >
                  <span>Finish & Submit</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screen Disconnect Warning Modal */}
      <ScreenShareWarningModal
        isOpen={isScreenSharingStopped}
        onResume={requestScreenMedia}
      />

      {/* Upload and AI Evaluation Progress Modal */}
      <SubmissionModal
        isOpen={isSubmitting}
        uploadStep={uploadStep}
        uploadProgress={uploadProgress}
        errorMessage={submitError}
      />
    </div>
  );
};
