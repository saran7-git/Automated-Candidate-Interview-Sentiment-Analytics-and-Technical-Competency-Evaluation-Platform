import React from 'react';
import { Loader2, BrainCircuit } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading details...', submessage, isAi = false }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-4">
        {isAi ? (
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-200 flex items-center justify-center text-indigo-600 animate-pulse">
              <BrainCircuit className="w-8 h-8" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white animate-ping"></div>
          </div>
        ) : (
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        )}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{message}</h3>
      {submessage && (
        <p className="mt-1 text-xs text-slate-500 max-w-sm">{submessage}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
