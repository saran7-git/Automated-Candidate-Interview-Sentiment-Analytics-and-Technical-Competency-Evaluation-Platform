import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = (msg, dur) => addToast(msg, 'success', dur);
  const error = (msg, dur) => addToast(msg, 'error', dur);
  const info = (msg, dur) => addToast(msg, 'info', dur);
  const warning = (msg, dur) => addToast(msg, 'warning', dur);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 text-white';
          let Icon = Info;
          let iconColor = 'text-blue-400';

          if (toast.type === 'success') {
            bg = 'bg-emerald-950/90 text-emerald-100 border border-emerald-800 shadow-emerald-950/20';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-400';
          } else if (toast.type === 'error') {
            bg = 'bg-rose-950/90 text-rose-100 border border-rose-800 shadow-rose-950/20';
            Icon = XCircle;
            iconColor = 'text-rose-400';
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-950/90 text-amber-100 border border-amber-800 shadow-amber-950/20';
            Icon = AlertCircle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${bg}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm font-medium leading-relaxed">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
