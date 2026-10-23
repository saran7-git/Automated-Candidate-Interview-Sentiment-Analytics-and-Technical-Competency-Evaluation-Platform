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
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Question Timestamp Timeline</span>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Playback: <span className="text-teal-700 font-bold">{formatTime(currentTime)}</span> / {formatTime(totalDuration)}
        </span>
      </div>

      {/* Interactive visual timeline bar */}
      <div className="relative w-full h-9 bg-slate-100 rounded-lg border border-slate-200 flex items-center px-3 overflow-hidden">
        {/* Playback progress fill */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-teal-500/15 border-r-2 border-teal-600 pointer-events-none transition-all duration-150"
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
                className={`group relative flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  isPassed
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>Q{idx + 1}</span>
                <span className="text-[10px] font-mono opacity-80">({formatTime(offset)})</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        💡 Click on any question pill (e.g. <b>Q2 (02:15)</b>) to synchronize and seek media players directly to that response.
      </p>
    </div>
  );
};

export default QuestionTimelineBar;
