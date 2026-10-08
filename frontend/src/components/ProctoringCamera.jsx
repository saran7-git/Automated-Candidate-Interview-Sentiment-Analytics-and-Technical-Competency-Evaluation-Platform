import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  ShieldCheck,
  AlertTriangle,
  Volume2
} from 'lucide-react';

const ProctoringCamera = ({
  stream,
  isCameraActive,
  isMicActive,
  audioLevel = 0,
  onToggleCamera,
  onToggleMic,
  warningCount = 0
}) => {
  const videoRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ease-in-out ${
        isMinimized ? 'w-48' : 'w-72 sm:w-80'
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
        {/* Top Control Bar */}
        <div className="px-3.5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-200">
              Proctoring Active
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {warningCount > 0 && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                <AlertTriangle className="w-2.5 h-2.5" />
                {warningCount}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isMinimized ? 'Expand Camera View' : 'Minimize Camera View'}
            >
              {isMinimized ? (
                <Maximize2 className="w-3.5 h-3.5" />
              ) : (
                <Minimize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Video Viewport */}
        {!isMinimized && (
          <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
            {stream && isCameraActive ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Subtle facial guide ring */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                  <div className="w-28 h-36 border border-emerald-400/40 rounded-full" />
                </div>

                {/* Status chip */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-sm text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Face In Frame</span>
                </div>
              </>
            ) : (
              <div className="p-4 text-center space-y-1">
                <CameraOff className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-[11px] text-slate-400 font-medium">Camera Feed Paused</p>
              </div>
            )}

            {/* Bottom Audio Level Waveform inside camera preview */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-[10px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Volume2 className="w-3 h-3 text-indigo-400" />
                <span>Audio:</span>
              </div>

              {/* Dynamic Sound Equalizer Bars */}
              <div className="flex items-center gap-1 h-3">
                {[20, 45, 80, 50, 30].map((baseHeight, idx) => {
                  const scale = Math.max(0.2, (audioLevel / 100));
                  const heightPercent = Math.min(100, Math.round(baseHeight * scale * 2));
                  return (
                    <div
                      key={idx}
                      className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(3, heightPercent)}%` }}
                    />
                  );
                })}
              </div>

              <span className="font-mono text-slate-400 text-[10px]">
                {audioLevel > 5 ? `${audioLevel}%` : 'Silent'}
              </span>
            </div>
          </div>
        )}

        {/* Minimized Compact Bar */}
        {isMinimized && (
          <div className="p-2.5 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-semibold">Webcam Active</span>
            </div>
            <div className="flex items-center gap-1 h-3">
              {[20, 50, 80].map((baseHeight, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(3, Math.round(baseHeight * (audioLevel / 100) * 2))}%` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctoringCamera;
