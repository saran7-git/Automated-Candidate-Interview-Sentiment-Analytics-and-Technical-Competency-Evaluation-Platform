import React from 'react';
import { Monitor, AlertTriangle, Play } from 'lucide-react';

export const ScreenShareWarningModal = ({ isOpen = false, onResume }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/85 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-amber-500/40 shadow-2xl space-y-5 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-extrabold text-white">
            Screen Sharing Stopped
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Screen recording is required for automated technical competency evaluation.
            Please resume screen sharing to continue your interview.
          </p>
        </div>

        <div className="p-3 bg-dark-900/80 rounded-xl border border-slate-800 text-left text-xs text-slate-400">
          💡 Select either your entire screen or the current application window.
        </div>

        <button
          onClick={onResume}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-dark-950 font-extrabold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <Monitor className="w-4 h-4" />
          <span>Resume Screen Sharing</span>
        </button>
      </div>
    </div>
  );
};
