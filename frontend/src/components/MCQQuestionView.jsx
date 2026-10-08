import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const MCQQuestionView = ({
  question,
  selectedAnswer = '',
  onSelectAnswer
}) => {
  const options = question?.options || [];

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        Select One Correct Option:
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((opt, idx) => {
          // Check if opt starts with letter like 'A' or matches selected
          const letter = String.fromCharCode(65 + idx); // 'A', 'B', 'C', 'D'
          const isSelected =
            selectedAnswer === opt ||
            selectedAnswer === letter ||
            selectedAnswer.startsWith(letter);

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectAnswer?.(opt)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group active:scale-[0.99] ${
                isSelected
                  ? 'bg-indigo-50/90 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-bold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span
                  className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700'
                  }`}
                >
                  {letter}
                </span>
                <span className="text-sm leading-relaxed">{opt}</span>
              </div>

              {isSelected ? (
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MCQQuestionView;
