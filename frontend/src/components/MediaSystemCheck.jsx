import React, { useEffect, useRef, useState } from 'react';
import { useMediaStream } from '../hooks/useMediaStream';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Video,
  Volume2,
  Sparkles
} from 'lucide-react';

const MediaSystemCheck = ({ onVerified, isVerified }) => {
  const videoRef = useRef(null);
  const {
    stream,
    isCameraActive,
    isMicActive,
    hasPermission,
    permissionError,
    audioLevel,
    isInitializing,
    startStream,
    stopStream
  } = useMediaStream({ video: true, audio: true, autoStart: true });

  const [hasTestedAudio, setHasTestedAudio] = useState(false);
  const [allowSimulated, setAllowSimulated] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // If candidate speaks and audio level is above 15%, mark audio as tested!
  useEffect(() => {
    if (audioLevel > 15) {
      setHasTestedAudio(true);
    }
  }, [audioLevel]);

  // Notify parent component when diagnostics are ready
  useEffect(() => {
    if ((hasPermission && isCameraActive && isMicActive) || allowSimulated) {
      onVerified?.(true);
    } else {
      onVerified?.(false);
    }
  }, [hasPermission, isCameraActive, isMicActive, allowSimulated, onVerified]);

  const handleRetry = () => {
    stopStream();
    startStream().catch(() => {});
  };

  const handleSimulatePass = () => {
    setAllowSimulated(true);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Pre-Assessment Hardware & Proctoring Verification
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            This assessment requires an active camera and microphone for automated sentiment evaluation and proctoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission || allowSimulated ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Diagnostics Passed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertCircle className="w-3.5 h-3.5" />
              Hardware Check In Progress
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Video Preview on Left, Diagnostics on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Webcam Viewfinder */}
        <div className="md:col-span-7 space-y-3">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group shadow-inner">
            {stream && isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Face Framing Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-44 h-56 border-2 border-dashed border-indigo-400/40 rounded-[45%] opacity-60 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider bg-slate-950/70 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Center Face Here
                    </span>
                  </div>
                </div>

                {/* Live REC indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>WEBCAM LIVE</span>
                </div>

                {/* Mic Activity Meter in Viewfinder */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 shrink-0">
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] font-medium">Mic Input:</span>
                  </div>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-75"
                      style={{ width: `${Math.max(4, audioLevel)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                    {audioLevel}%
                  </span>
                </div>
              </>
            ) : allowSimulated ? (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
                  <Video className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Simulated Device Mode Active</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Hardware bypass enabled for evaluation testing without a physical webcam.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                  <CameraOff className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-300">
                    {isInitializing ? 'Connecting to camera...' : 'Webcam Offline'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    {permissionError || 'Click below to allow camera & microphone access.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md shadow-indigo-600/30"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Grant / Test Access</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Diagnostics Checklist on Right */}
        <div className="md:col-span-5 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Diagnostic Verification
          </h4>

          <div className="space-y-2.5">
            {/* Camera Check Item */}
            <div className={`p-3 rounded-2xl border transition-all ${
              isCameraActive || allowSimulated
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold">Webcam Feed</span>
                </div>
                {isCameraActive || allowSimulated ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400">Needs Access</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 pl-6.5">
                {isCameraActive ? 'Candidate presence and facial sentiment stream verified.' : 'Required for automated proctoring.'}
              </p>
            </div>

            {/* Microphone Check Item */}
            <div className={`p-3 rounded-2xl border transition-all ${
              isMicActive || allowSimulated
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold">Microphone Input</span>
                </div>
                {isMicActive || allowSimulated ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-400">Needs Access</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 pl-6.5">
                {hasTestedAudio
                  ? 'Speech level detected & verified!'
                  : 'Say a few words out loud to test audio pickup.'}
              </p>
            </div>

            {/* AI Speech Dictation Capability */}
            <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold">AI Voice-to-Text Support</span>
                </div>
                <span className="text-[11px] font-bold text-indigo-300">Supported</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 pl-6.5">
                You can dictate your answers using voice speech or type directly during the interview.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col gap-2">
            {!hasPermission && !allowSimulated && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Grant Permissions</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulatePass}
                  title="Proceed in test environment without physical camera"
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
                >
                  Bypass (Simulate)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaSystemCheck;
