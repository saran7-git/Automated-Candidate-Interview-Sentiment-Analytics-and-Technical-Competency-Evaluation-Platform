import React from 'react';
import { Clock, HelpCircle } from 'lucide-react';

export const QuestionTimelineBar = ({
  questions = [],
  answers = [],
  currentTime = 0,
  totalDuration = 0,
  onSeekTo,
}) => {
  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const durationSafe = Math.max(totalDuration || 1, 1);

  return (
    <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-brand-400" />
          <span>Question Timestamp Timeline</span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Playback: <span className="text-brand-300 font-bold">{formatTime(currentTime)}</span> / {formatTime(totalDuration)}
        </span>
      </div>

      {/* Interactive visual timeline bar */}
      <div className="relative w-full h-8 bg-dark-900 rounded-xl border border-slate-700/80 flex items-center px-3 overflow-hidden">
        {/* Playback progress fill */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-brand-500/20 border-r-2 border-brand-400 pointer-events-none transition-all duration-150"
          style={{ width: `${Math.min(100, (currentTime / durationSafe) * 100)}%` }}
        />

        {/* Question Timestamp Markers */}
        <div className="relative z-10 w-full flex items-center justify-between">
          {questions.map((q, idx) => {
            const ans = answers.find(
              (a) => (a.questionId?._id || a.questionId)?.toString() === (q.questionId || q._id)?.toString()
            ) || answers[idx];

            const offset = ans?.timestampOffset ?? (idx * 60);
            const isPassed = currentTime >= offset;

            return (
              <button
                key={idx}
                onClick={() => onSeekTo && onSeekTo(offset)}
                title={`Question ${idx + 1}: ${q.questionText || q.question} (${formatTime(offset)})`}
                className={`group relative flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isPassed
                    ? 'bg-brand-500 text-dark-950 shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span>Q{idx + 1}</span>
                <span className="text-[10px] font-mono opacity-80">({formatTime(offset)})</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        💡 Click on any question pill (e.g. <b>Q2 (02:15)</b>) to seek the video, audio, and screen players directly to that question.
      </p>
    </div>
  );
};
