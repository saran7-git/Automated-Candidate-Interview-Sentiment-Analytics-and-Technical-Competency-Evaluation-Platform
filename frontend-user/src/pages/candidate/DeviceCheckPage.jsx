import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Mic,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { AudioVisualizer } from '../../components/common/AudioVisualizer';
import { useAudioMeter } from '../../hooks/useAudioMeter';

export const DeviceCheckPage = () => {
  const navigate = useNavigate();

  // Local device check streams
  const [userStream, setUserStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  const [cameraStatus, setCameraStatus] = useState('checking'); // 'checking' | 'connected' | 'error'
  const [micStatus, setMicStatus] = useState('checking'); // 'checking' | 'working' | 'error'
  const [screenStatus, setScreenStatus] = useState('untested'); // 'untested' | 'ready' | 'error'

  const [consentGiven, setConsentGiven] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const videoRef = useRef(null);
  const screenPreviewRef = useRef(null);

  // Live microphone visualizer hook
  const { audioLevel, frequencyData } = useAudioMeter(userStream, micStatus === 'working');

  // 1. Request Webcam & Mic on Mount
  useEffect(() => {
    initHardwareCheck();

    return () => {
      // Clean up streams when navigating away from device check
      if (userStream) userStream.getTracks().forEach((t) => t.stop());
      if (screenStream) screenStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const initHardwareCheck = async () => {
    setErrorMessage(null);
    setCameraStatus('checking');
    setMicStatus('checking');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API is not supported in your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true,
      });

      setUserStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const hasVideo = stream.getVideoTracks().length > 0;
      const hasAudio = stream.getAudioTracks().length > 0;

      setCameraStatus(hasVideo ? 'connected' : 'error');
      setMicStatus(hasAudio ? 'working' : 'error');
    } catch (err) {
      console.error('Device Check Error:', err);
      setCameraStatus('error');
      setMicStatus('error');
      setErrorMessage(
        'Camera and Microphone access was denied or not found. Please click the lock/camera icon in your browser address bar to grant permissions, then click Retry.'
      );
    }
  };

  // 2. Test Screen Sharing
  const testScreenSharing = async () => {
    setErrorMessage(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Handle user stopping screen share via native browser bar
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setScreenStatus('untested');
          setScreenStream(null);
        };
      }

      setScreenStream(stream);
      setScreenStatus('ready');

      if (screenPreviewRef.current) {
        screenPreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Screen share test error:', err);
      setScreenStatus('error');
      setErrorMessage('Screen sharing was cancelled or denied. Please test again.');
    }
  };

  const isReadyToProceed =
    cameraStatus === 'connected' &&
    micStatus === 'working' &&
    screenStatus === 'ready' &&
    consentGiven;

  const handleStartInterview = () => {
    if (!isReadyToProceed) return;
    // Keep configuration in sessionStorage and navigate to active interview
    navigate('/candidate/interview');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Step Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 2 of 3: Hardware Diagnostics & Recording Consent</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          System & Device Readiness Check
        </h1>
        <p className="text-sm text-slate-400">
          Verify that your webcam, microphone, and screen-sharing pipelines are operational
          before beginning the automated technical interview.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
          <button
            onClick={initHardwareCheck}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg font-bold flex items-center gap-1 shrink-0 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 3 Main Device Diagnostics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Camera Card */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Camera className="w-4 h-4 text-brand-400" />
                <span>Camera</span>
              </div>
              {cameraStatus === 'connected' ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected ✓
                </span>
              ) : cameraStatus === 'checking' ? (
                <span className="text-xs text-slate-400">Detecting...</span>
              ) : (
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Not detected ✗
                </span>
              )}
            </div>

            {/* Video Preview Box */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center">
              {cameraStatus === 'connected' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="text-center p-4 text-slate-500 space-y-2">
                  <Camera className="w-8 h-8 mx-auto stroke-1" />
                  <p className="text-xs">Camera feed unavailable</p>
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Position yourself in good lighting facing the camera with your face clearly visible.
          </p>
        </div>

        {/* 2. Microphone Card */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Mic className="w-4 h-4 text-teal-400" />
                <span>Microphone</span>
              </div>
              {micStatus === 'working' ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Working ✓
                </span>
              ) : micStatus === 'checking' ? (
                <span className="text-xs text-slate-400">Detecting...</span>
              ) : (
                <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Inactive ✗
                </span>
              )}
            </div>

            {/* Audio Level Visualizer Box */}
            <div className="aspect-video w-full rounded-2xl bg-dark-900 border border-slate-700 flex flex-col items-center justify-center p-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Mic className={`w-6 h-6 ${audioLevel > 10 ? 'animate-bounce' : ''}`} />
              </div>
              <AudioVisualizer level={audioLevel} bands={frequencyData} isWorking={micStatus === 'working'} barCount={14} />
              <span className="text-[11px] font-mono text-slate-400">
                {audioLevel > 5 ? `Signal Level: ${audioLevel}%` : 'Speak into mic to test signal'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Speak a test sentence to verify the audio input level meter moves dynamically.
          </p>
        </div>

        {/* 3. Screen Sharing Card */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Monitor className="w-4 h-4 text-purple-400" />
                <span>Screen Sharing</span>
              </div>
              {screenStatus === 'ready' ? (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready ✓
                </span>
              ) : (
                <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Required
                </span>
              )}
            </div>

            {/* Screen Test Action Box */}
            <div className="aspect-video w-full rounded-2xl bg-dark-900 border border-slate-700 flex flex-col items-center justify-center p-4 space-y-3">
              {screenStatus === 'ready' ? (
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
                  <video
                    ref={screenPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-900/20 pointer-events-none flex items-center justify-center">
                    <span className="bg-dark-950/80 px-2.5 py-1 rounded-lg text-[10px] text-emerald-300 font-bold border border-emerald-500/30">
                      Screen Broadcast Active
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <Monitor className="w-8 h-8 text-purple-400/80" />
                  <button
                    type="button"
                    onClick={testScreenSharing}
                    className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                  >
                    Test Screen Sharing
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            Share your entire screen or application window as required for the interview.
          </p>
        </div>
      </div>

      {/* Recording Consent Box */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-sm font-bold text-white">
          <ShieldCheck className="w-5 h-5 text-brand-400" />
          <span>Recording Consent & Privacy Notice</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          This technical interview will capture your webcam video, microphone audio, and selected
          screen content solely for automated competency evaluation and reviewer grading. Recording will
          begin automatically once you enter the interview room.
        </p>

        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-dark-900/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
          <input
            type="checkbox"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-brand-500 rounded border-slate-700 focus:ring-brand-500 bg-dark-950"
          />
          <span className="text-xs text-slate-300 select-none">
            I understand and give explicit consent for my camera, microphone, and screen activity
            to be recorded during this interview session.
          </span>
        </label>
      </div>

      {/* Continue CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="text-xs text-slate-400">
          {!isReadyToProceed && (
            <span className="text-amber-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Complete camera, mic, screen share tests and accept consent to continue.
            </span>
          )}
        </div>

        <button
          onClick={handleStartInterview}
          disabled={!isReadyToProceed}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-600 to-teal-500 hover:from-brand-500 hover:to-teal-400 text-white font-extrabold rounded-2xl text-base transition-all shadow-xl shadow-brand-500/20 disabled:opacity-40 disabled:pointer-events-none hover:scale-[1.02] flex items-center justify-center gap-3"
        >
          <span>Continue to Interview</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DeviceCheckPage;
