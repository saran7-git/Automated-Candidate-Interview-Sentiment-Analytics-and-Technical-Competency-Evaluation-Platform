import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const MCQQuestionView = ({
  question,
  selectedAnswer = '',
  selectedOption = '',
  onSelectAnswer,
  onSelectOption,
  disabled = false
}) => {
  const chosen = selectedOption || selectedAnswer || '';
  const handleSelect = onSelectOption || onSelectAnswer || (() => {});
  const options = question?.options || [];

  return (
    <div className="space-y-4">
      {question?.question && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              {question.topic || question.category || 'Foundation Aptitude'}
            </span>
            {question.subtopic && (
              <span className="text-xs text-slate-400">
                • {question.subtopic}
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-white leading-relaxed whitespace-pre-wrap">
            {question.question}
          </h3>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          Select One Correct Option:
        </div>

        <div className="grid grid-cols-1 gap-3">
          {options.map((opt, idx) => {
            const letter = String.fromCharCode(65 + idx); // 'A', 'B', 'C', 'D'
            const isSelected =
              chosen === opt ||
              chosen === letter ||
              (typeof chosen === 'string' && chosen.startsWith(letter + ')') || chosen.startsWith(letter + ' '));

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(opt)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30 text-white font-bold shadow-lg shadow-indigo-600/10'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="text-sm leading-relaxed">{opt}</span>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MCQQuestionView;
