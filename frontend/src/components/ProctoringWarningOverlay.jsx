import React from 'react';
import { AlertTriangle, EyeOff, UserX, ShieldAlert } from 'lucide-react';

const ProctoringWarningOverlay = ({
  activeViolation,
  countdownSeconds,
  isTerminated
}) => {
  if (!activeViolation && !isTerminated) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-start pt-8 px-4 animate-in fade-in duration-150">
      {/* Flashing Red Screen Border */}
      <div className="fixed inset-0 border-8 border-rose-600/90 pointer-events-none animate-pulse" />

      {/* Warning HUD Card */}
      <div className="relative pointer-events-auto max-w-lg w-full bg-rose-950/95 text-white p-5 rounded-2xl border-2 border-rose-500 shadow-2xl backdrop-blur-md space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-rose-800">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-rose-200">
              Zero-Tolerance Proctoring Alert
            </span>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white animate-pulse">
            TERMINATING IN {countdownSeconds}s
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-900/60 border border-rose-700/60 text-rose-300 shrink-0">
            {activeViolation?.violationType === 'OUT_OF_FRAME' ? (
              <UserX className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </div>

          <div>
            <h4 className="text-sm font-bold text-white">
              {activeViolation?.violationType === 'OUT_OF_FRAME'
                ? 'Candidate Out of Frame!'
                : 'Eye Gaze Averted / Looking Away!'}
            </h4>
            <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">
              {activeViolation?.reason}
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-rose-900/40 border border-rose-800 text-[11px] text-rose-300 font-semibold flex items-center justify-between">
          <span>Look directly back at the assessment screen immediately.</span>
          <span className="font-mono text-white text-xs">{countdownSeconds}s remaining</span>
        </div>
      </div>
    </div>
  );
};

export default ProctoringWarningOverlay;
