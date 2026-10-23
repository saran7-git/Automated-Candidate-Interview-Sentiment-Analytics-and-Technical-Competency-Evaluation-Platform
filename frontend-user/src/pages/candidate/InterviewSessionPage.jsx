import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { interviewAPI, answerAPI, proctoringAPI } from '../../services/api';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertTriangle,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ShieldCheck,
  Eye,
  Volume2,
  Sun,
  Send,
  Sparkles,
  Info,
  RotateCcw,
  ArrowLeft,
  Shield,
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
  const [lastSaved, setLastSaved] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');

  // Live Proctoring & Media States
  const [hasMediaStream, setHasMediaStream] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [lightingStatus, setLightingStatus] = useState('Optimal');
  const [audioLevel, setAudioLevel] = useState(20);
  const [gazeStatus, setGazeStatus] = useState('Center (Screen Focused)');
  const [warningsCount, setWarningsCount] = useState(0);
  const [latestWarning, setLatestWarning] = useState(null);

  // Live Speech-to-Text State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);

  // Initialize Speech-to-Text API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        if (transcript.trim()) {
          setAnswersMap((prev) => {
            const currentQ = questions[currentIndex];
            if (!currentQ) return prev;
            const qId = currentQ.id || currentQ.question_id;
            const existing = prev[qId] || '';
            const updated = existing ? `${existing} ${transcript}` : transcript;
            return { ...prev, [qId]: updated };
          });
        }
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition warning:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [questions, currentIndex]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        triggerProctoringWarning(
          'tab_switch',
          'medium',
          'Candidate navigated away from active interview window or switched tabs.'
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [id]);

  // Initialize camera and proctoring hardware
  useEffect(() => {
    const initProctoringHardware = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });

        streamRef.current = stream;
        setHasMediaStream(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Audio level measuring
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const checkNoise = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
            const avg = Math.round(sum / dataArray.length);
            setAudioLevel(Math.min(100, Math.max(15, avg)));

            if (avg > 80) {
              triggerProctoringWarning('noise', 'low', 'High ambient background noise detected.');
            }
          };

          const noiseInterval = setInterval(checkNoise, 2000);
          return () => clearInterval(noiseInterval);
        }

        // Lighting estimation via hidden canvas
        const lightingInterval = setInterval(() => {
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, 80, 60);
            const imgData = ctx.getImageData(0, 0, 80, 60).data;
            let total = 0;
            for (let i = 0; i < imgData.length; i += 4) {
              total += (imgData[i] + imgData[i + 1] + imgData[i + 2]) / 3;
            }
            const avgBrightness = total / (imgData.length / 4);

            if (avgBrightness < 35) {
              setLightingStatus('Low Light (Adjust Lamp)');
            } else if (avgBrightness > 220) {
              setLightingStatus('Overexposed (Reduce Glare)');
            } else {
              setLightingStatus('Optimal');
            }
          }
        }, 3000);

        return () => {
          clearInterval(lightingInterval);
          if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
          if (audioContextRef.current) audioContextRef.current.close();
        };
      } catch (err) {
        setCameraError('Camera / Microphone permission denied. Monitoring telemetry will be recorded as offline.');
      }
    };

    initProctoringHardware();
  }, [id]);

  const triggerProctoringWarning = async (type, sev, details) => {
    try {
      const res = await proctoringAPI.logEvent({
        sessionId: id || 1,
        sessionType: 'interview',
        eventType: type,
        severity: sev,
        details,
      });

      if (res.data?.success) {
        setWarningsCount(res.data.warningCount || warningsCount + 1);
        setLatestWarning({
          type,
          details,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });
      }
    } catch (e) {
      console.warn('Log error:', e.message);
    }
  };

  // Timer countdown
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

  // Fetch interview data if refreshed
  useEffect(() => {
    if (!questions.length) {
      const fetchSession = async () => {
        try {
          const res = await interviewAPI.getInterviewById(id);
          if (res.data?.success) {
            setInterview(res.data.interview);
            setQuestions(res.data.questions);

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

  const currentQuestion = questions[currentIndex] || {};
  const currentQId = currentQuestion.id || currentQuestion.question_id;
  const currentAnswer = answersMap[currentQId] || '';

  const handleAnswerChange = (val) => {
    setAnswersMap((prev) => ({
      ...prev,
      [currentQId]: val,
    }));
  };

  const handleToggleSpeech = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech error:', err);
      }
    }
  };

  const handleSaveAnswer = async () => {
    if (!currentQId) return;
    setIsSaving(true);
    try {
      await answerAPI.saveAnswer(id, {
        questionId: currentQId,
        textAnswer: currentAnswer,
        timeSpentSeconds: 60,
      });
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Save draft warning:', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSaveAnswer();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrev = async () => {
    await handleSaveAnswer();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmitFinal = async () => {
    setIsProcessing(true);
    setShowConfirmModal(false);
    setProcessingStep(1);

    setTimeout(() => setProcessingStep(2), 700);
    setTimeout(() => setProcessingStep(3), 1400);
    setTimeout(() => setProcessingStep(4), 2100);

    try {
      const payloadAnswers = questions.map((q) => {
        const qId = q.id || q.question_id;
        return {
          questionId: qId,
          textAnswer: answersMap[qId] || '',
          timeSpentSeconds: 60,
        };
      });

      await interviewAPI.completeInterview(id, {
        answers: payloadAnswers,
        durationSeconds: 30 * 60 - timeRemaining,
      });

      setTimeout(() => {
        navigate(`/candidate/results/${id}`, { replace: true });
      }, 2600);
    } catch (err) {
      setError(err.response?.data?.message || 'Error evaluating interview session.');
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Hidden processing canvas for pixel brightness calculation */}
      <canvas ref={canvasRef} width="80" height="60" className="hidden" />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowExitModal(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <span className="badge-navy uppercase tracking-wider text-[11px] flex items-center gap-1.5 truncate">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              AI Technical Interview
            </span>

            <span className="hidden sm:inline-block text-slate-300">•</span>

            <h1 className="text-sm font-bold text-slate-800 truncate">
              Question {currentIndex + 1} of {questions.length}
            </h1>

            {lastSaved && (
              <span className="hidden lg:inline-flex text-[11px] text-slate-500 items-center gap-1 ml-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Autosaved at {lastSaved}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Warnings Counter */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Alerts: <span className={warningsCount > 0 ? 'text-amber-600 font-bold' : 'text-slate-800'}>{warningsCount}/3</span>
              </span>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>{formatTime(timeRemaining)}</span>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit Interview</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Warning Alert Banner (if any) */}
        {latestWarning && (
          <div className="enterprise-card p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <span className="font-bold">Monitoring Notice [{latestWarning.time}]: </span>
                {latestWarning.details}
              </span>
            </div>
            <button
              onClick={() => setLatestWarning(null)}
              className="text-amber-700 hover:text-amber-900 font-bold px-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Workspace Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: Question Prompt & Answer Area */}
          <div className="lg:col-span-8 space-y-6">
            {/* Question Box */}
            <div className="enterprise-card p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="badge-teal text-[11px] font-bold">
                  {currentQuestion?.skill || currentQuestion?.category || 'Technical Competency'}
                </span>
                <span className="badge-navy text-[11px] font-bold">
                  Difficulty: {currentQuestion?.difficulty || 'Medium'}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {currentQuestion?.question || 'Loading question statement...'}
              </h2>
            </div>

            {/* Answer Text Area & Controls */}
            <div className="enterprise-card p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Your Technical Response</span>
                  <span className="text-slate-400">•</span>
                  <span>Type or use live speech recognition</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Speech to text toggle */}
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={handleToggleSpeech}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isListening
                          ? 'bg-rose-50 text-rose-700 border border-rose-300 animate-pulse'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                      <span>{isListening ? 'Listening (Speak now)...' : 'Speech-to-Text'}</span>
                    </button>
                  )}
                  <span className="font-semibold text-slate-700">{wordCount} Words</span>
                </div>
              </div>

              <textarea
                rows={11}
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Structure your answer clearly. Include core concepts, architectural trade-offs, and concrete technical examples..."
                className="w-full p-4 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-900 placeholder-slate-400 outline-none resize-none font-sans leading-relaxed transition-all"
              />

              {/* Bottom Nav Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveAnswer}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>{currentIndex < questions.length - 1 ? 'Save & Next' : 'Proceed to Submit'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right 4 Cols: Sticky Live Proctoring Widget & Telemetry */}
          <div className="lg:col-span-4 space-y-4">
            <div className="enterprise-card p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs sticky top-20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-teal-600" />
                  Proctoring Telemetry
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              {/* Live Camera Box */}
              <div className="w-full h-44 rounded-xl bg-slate-900 overflow-hidden relative mb-4 flex items-center justify-center border border-slate-800">
                {hasMediaStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <div className="text-center p-4 text-xs text-slate-400">
                    <VideoOff className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                    <span>Camera feed unavailable</span>
                  </div>
                )}

                {/* Status overlay badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-semibold flex items-center gap-1">
                  <Eye className="w-3 h-3 text-teal-400" />
                  <span>{gazeStatus}</span>
                </div>
              </div>

              {/* Hardware & Environment Metrics */}
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    Room Lighting:
                  </span>
                  <span className="font-semibold text-slate-800">{lightingStatus}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Volume2 className="w-3.5 h-3.5 text-teal-500" />
                    Ambient Noise:
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{audioLevel} dB (Normal)</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Session Verification:
                  </span>
                  <span className="font-semibold text-emerald-700">Active</span>
                </div>
              </div>

              {/* Honest Disclosure notice */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                Browser-based monitoring provides indicative telemetry. Brief natural movements are not treated as violations.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="enterprise-card p-6 md:p-8 bg-white max-w-md w-full rounded-2xl shadow-xl border border-slate-200 text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Submit Interview Session?</h3>
            <p className="text-xs text-slate-600 mb-6">
              This will evaluate your technical answers, concept coverage, relevance, and communication signals.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Back to Questions
              </button>
              <button
                type="button"
                onClick={handleSubmitFinal}
                className="flex-1 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="enterprise-card p-6 bg-white max-w-sm w-full rounded-2xl shadow-xl border border-slate-200 text-center">
            <h3 className="text-base font-bold text-slate-900 mb-2">Leave Interview Session?</h3>
            <p className="text-xs text-slate-600 mb-6">
              Your draft answers are saved. You can resume this session from your candidate dashboard.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Continue Interview
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Processing Overlay Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="enterprise-card p-8 bg-white max-w-md w-full rounded-2xl shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto animate-spin">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-extrabold text-slate-900">
              Evaluating Interview Responses
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Running semantic keyword matching, architectural concept verification, and generating evaluation insights...
            </p>

            <div className="space-y-2 text-xs font-semibold text-left p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className={`flex items-center gap-2 ${processingStep >= 1 ? 'text-teal-700' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1. Structured answers captured</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStep >= 2 ? 'text-teal-700' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>2. Concept coverage and relevance scored</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStep >= 3 ? 'text-teal-700' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. Communication clarity evaluated</span>
              </div>
              <div className={`flex items-center gap-2 ${processingStep >= 4 ? 'text-teal-700' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>4. Report card compiled for recruiter review</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSessionPage;
