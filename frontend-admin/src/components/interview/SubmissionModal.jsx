import React from 'react';
import { UploadCloud, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

export const SubmissionModal = ({
  isOpen = false,
  uploadStep = 'idle', // 'stopping' | 'uploading_webcam' | 'uploading_screen' | 'uploading_audio' | 'evaluating' | 'completed' | 'error'
  uploadProgress = 0,
  errorMessage = '',
}) => {
  if (!isOpen) return null;

  const steps = [
    { id: 'stopping', label: 'Finalizing media streams & buffers' },
    { id: 'uploading_webcam', label: 'Uploading candidate webcam recording' },
    { id: 'uploading_screen', label: 'Uploading screen activity recording' },
    { id: 'uploading_audio', label: 'Uploading high-fidelity audio stream' },
    { id: 'evaluating', label: 'Running AI Technical Competency & Sentiment Analysis' },
  ];

  const getCurrentStepIndex = () => {
    switch (uploadStep) {
      case 'stopping': return 0;
      case 'uploading_webcam': return 1;
      case 'uploading_screen': return 2;
      case 'uploading_audio': return 3;
      case 'evaluating': return 4;
      case 'completed': return 5;
      default: return 0;
    }
  };

  const currentIdx = getCurrentStepIndex();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          {uploadStep === 'error' ? (
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>
          ) : uploadStep === 'completed' ? (
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          ) : (
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <UploadCloud className="w-7 h-7 animate-bounce" />
            </div>
          )}

          <h3 className="text-xl font-extrabold text-white">
            {uploadStep === 'completed'
              ? 'Evaluation Complete ✓'
              : uploadStep === 'evaluating'
              ? 'Processing Interview...'
              : uploadStep === 'error'
              ? 'Submission Interrupted'
              : `Uploading Interview Recording... ${uploadProgress}%`}
          </h3>
          <p className="text-xs text-slate-400">
            {uploadStep === 'completed'
              ? 'Redirecting to your comprehensive candidate evaluation dashboard...'
              : uploadStep === 'error'
              ? errorMessage || 'An error occurred during submission.'
              : 'Please keep this window open while recordings and answers are analyzed.'}
          </p>
        </div>

        {/* Global Progress Bar */}
        {uploadStep !== 'error' && (
          <div className="space-y-2">
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-teal-400 transition-all duration-300 rounded-full"
                style={{
                  width: uploadStep === 'completed' ? '100%' : `${Math.max(5, uploadProgress)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>Progress</span>
              <span>{uploadStep === 'completed' ? '100%' : `${uploadProgress}%`}</span>
            </div>
          </div>
        )}

        {/* Multi-step Status List */}
        <div className="space-y-3 bg-dark-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
          {steps.map((step, idx) => {
            const isFinished = currentIdx > idx || uploadStep === 'completed';
            const isCurrent = currentIdx === idx && uploadStep !== 'completed';

            return (
              <div key={step.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span className={isFinished ? 'text-slate-200' : isCurrent ? 'text-brand-300 font-semibold' : 'text-slate-500'}>
                    {step.label}
                  </span>
                </div>
                {isCurrent && (
                  <span className="text-[10px] text-brand-400 font-mono font-bold">In progress</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
