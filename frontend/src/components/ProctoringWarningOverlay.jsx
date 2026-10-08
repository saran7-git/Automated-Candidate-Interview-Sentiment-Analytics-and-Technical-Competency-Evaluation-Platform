import React from 'react';
import {
  AlertTriangle,
  EyeOff,
  UserX,
  ShieldAlert,
  Maximize2,
  AlertOctagon,
  Eye,
  CheckCircle2,
  ShieldX
} from 'lucide-react';

const ProctoringWarningOverlay = ({
  activeViolation,
  isLookingAway = false,
  eyeAwayDuration = 0,
  eyeAwayThresholdSeconds = 10,
  isOutOfFrame = false,
  outOfFrameDuration = 0,
  showFullscreenWarning = false,
  tabSwitchCount = 0,
  maxTabSwitches = 10,
  malpracticeAttempts = 0,
  maxAttempts = 10,
  onAcknowledgeFullscreen,
  isTerminated = false
}) => {
  const showEyeWarning = isLookingAway && eyeAwayDuration > 1;
  const showFrameWarning = isOutOfFrame && outOfFrameDuration > 1;
  const isCritical = malpracticeAttempts >= 8 || tabSwitchCount >= 8;

  // 1. Tab Switch & Fullscreen Exit Modal (Up to 10 allowed)
  if (showFullscreenWarning && !isTerminated) {
    const remainingTabs = Math.max(0, maxTabSwitches - tabSwitchCount);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-500/90 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-amber-500/10 space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span>Fullscreen & Tab Switch Warning ({tabSwitchCount} / {maxTabSwitches})</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Assessment Window Focus Lost
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto">
              You navigated away from the assessment or exited fullscreen mode. All tab switches are logged for security auditing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Tab Switch Violations:</span>
              <span className="font-mono font-bold text-amber-400">{tabSwitchCount} of {maxTabSwitches} Maximum</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (tabSwitchCount / maxTabSwitches) * 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Remaining Attempts Before Stop:</span>
              <span className="font-bold text-white">{remainingTabs} warnings left</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={onAcknowledgeFullscreen}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition shadow-lg shadow-indigo-600/30"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Return to Fullscreen & Resume Test</span>
            </button>
            <p className="text-center text-[10px] text-slate-400">
              Reaching 10 tab switches will automatically terminate and disqualify this session.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Eye Gaze Averted Warning Overlay (10 Seconds Rule)
  if (showEyeWarning && !isTerminated) {
    const eyePercent = Math.min(100, Math.round((eyeAwayDuration / eyeAwayThresholdSeconds) * 100));
    const secondsRemaining = Math.max(0, Math.round((eyeAwayThresholdSeconds - eyeAwayDuration) * 10) / 10);

    return (
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-6 px-4 animate-in fade-in duration-150">
        {/* Amber Flashing Screen Border */}
        <div className="fixed inset-0 border-8 border-amber-500/80 pointer-events-none animate-pulse" />

        <div className="relative pointer-events-auto max-w-md w-full bg-slate-900/95 text-white p-5 rounded-3xl border-2 border-amber-500 shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-amber-400 animate-bounce" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                Eye Gaze Averted Warning
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
              STRIKE IN {secondsRemaining}s
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Please Look Directly at the Screen</span>
            </h4>
            <p className="text-xs text-slate-300">
              Eyes away for 10 continuous seconds will trigger a malpractice strike ({malpracticeAttempts}/{maxAttempts} strikes recorded).
            </p>
          </div>

          {/* Eye away timer bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Continuous Away Time:</span>
              <span className="font-mono font-bold text-amber-400">{eyeAwayDuration.toFixed(1)}s / {eyeAwayThresholdSeconds}s</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full rounded-full transition-all duration-150"
                style={{ width: `${eyePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Out of Frame Warning (10 Seconds Rule)
  if (showFrameWarning && !isTerminated) {
    const framePercent = Math.min(100, Math.round((outOfFrameDuration / eyeAwayThresholdSeconds) * 100));
    const secondsRemaining = Math.max(0, Math.round((eyeAwayThresholdSeconds - outOfFrameDuration) * 10) / 10);

    return (
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-6 px-4 animate-in fade-in duration-150">
        <div className="fixed inset-0 border-8 border-rose-500/80 pointer-events-none animate-pulse" />

        <div className="relative pointer-events-auto max-w-md w-full bg-slate-900/95 text-white p-5 rounded-3xl border-2 border-rose-500 shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-rose-400 animate-bounce" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                Face Out of Frame
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
              STRIKE IN {secondsRemaining}s
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              Candidate Not Detected in Camera
            </h4>
            <p className="text-xs text-slate-300">
              Please align your face inside the viewfinder circle. Strike added if absent for 10s.
            </p>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
              <span>Time Out of View:</span>
              <span className="font-mono font-bold text-rose-400">{outOfFrameDuration.toFixed(1)}s / {eyeAwayThresholdSeconds}s</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${framePercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Critical Malpractice Strike Notification (Exceeded or Near Exceeding 10 Attempts)
  if (activeViolation && !showFullscreenWarning && !isTerminated) {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-6 px-4 animate-in fade-in duration-150">
        <div className={`fixed inset-0 border-8 ${isCritical ? 'border-rose-600 animate-pulse' : 'border-amber-500/70'} pointer-events-none`} />

        <div className="relative pointer-events-auto max-w-md w-full bg-slate-900/95 text-white p-5 rounded-3xl border-2 border-rose-500 shadow-2xl backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                Malpractice Strike Recorded
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-600 text-white">
              STRIKE {malpracticeAttempts} / {maxAttempts}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">
              {activeViolation.reason}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Warning strike added to session audit log. Exceeding {maxAttempts} strikes will stop the test immediately.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProctoringWarningOverlay;
