import React, { useEffect, useRef } from 'react';
import { Camera, Mic, Monitor, Circle } from 'lucide-react';
import { AudioVisualizer } from '../common/AudioVisualizer';
import { useAudioMeter } from '../../hooks/useAudioMeter';

export const WebcamCard = ({
  userStream,
  screenStream,
  isRecording = false,
  duration = 0,
  isScreenActive = true,
  audioBands = [],
  audioLevel = 0,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && userStream) {
      videoRef.current.srcObject = userStream;
    }
  }, [userStream]);

  // Format seconds to HH:MM:SS
  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const hasCamera = userStream && userStream.getVideoTracks().length > 0;
  const hasMic = userStream && userStream.getAudioTracks().length > 0;

  return (
    <div className="space-y-4">
      {/* Live Video Preview Box */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-xl">
        {hasCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100" // Mirrored for natural webcam feel
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
            <Camera className="w-10 h-10 stroke-1" />
            <span className="text-xs">No camera feed active</span>
          </div>
        )}

        {/* Recording pill overlay */}
        {isRecording && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-rose-600/90 text-white rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm shadow-md animate-pulse-subtle">
            <Circle className="w-2.5 h-2.5 fill-white animate-recording-blink" />
            <span>REC {formatTime(duration)}</span>
          </div>
        )}

        {/* Live Audio Level Meter inside camera feed */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-dark-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/60">
            <Mic className={`w-3.5 h-3.5 ${hasMic && audioLevel > 5 ? 'text-teal-400' : 'text-slate-400'}`} />
            <AudioVisualizer level={audioLevel} bands={audioBands} isWorking={hasMic} barCount={8} />
          </div>
          
          <div className="px-2 py-0.5 rounded-md bg-dark-950/80 backdrop-blur-md text-[10px] text-slate-300 font-mono border border-slate-700/60">
            HD 720p
          </div>
        </div>
      </div>

      {/* Hardware Status Indicators Panel */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
          <span>Hardware Channels</span>
          <span className="text-[10px] text-brand-400">Monitoring Active</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-dark-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Webcam</span>
            </div>
            {hasCamera ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ● Connected
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">✗ Not detected</span>
            )}
          </div>

          <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-dark-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Microphone</span>
            </div>
            {hasMic ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ● Active
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">✗ Inactive</span>
            )}
          </div>

          <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-dark-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">Screen Sharing</span>
            </div>
            {isScreenActive ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                ● Broadcasting
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">⚠ Disconnected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
