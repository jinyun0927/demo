
import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
  isEnglishMode: boolean;
  onToggleLanguage: () => void;
  compact?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  selectedId, 
  onSelect, 
  disabled,
  isEnglishMode,
  onToggleLanguage,
  compact = false
}) => {
  const currentOptions = isEnglishMode && question.text_en 
    ? question.options.map(o => ({ id: o.id, text: o.text_en || o.text })) 
    : question.options;
  const currentText = isEnglishMode && question.text_en ? question.text_en : question.text;

  return (
    <div className="flex flex-col h-full justify-start">
      <div className="flex items-center justify-between mb-3 shrink-0">
         <div className="flex items-center gap-2">
           <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
           <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Case Log 0{question.id}</span>
         </div>
         <button 
          onClick={onToggleLanguage}
          className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase border border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-all"
        >
          {isEnglishMode ? "Switch to French" : "Switch to English"}
        </button>
      </div>

      <h2 className={`font-extrabold tracking-tight text-slate-900 leading-tight mb-6 ${compact ? 'text-lg lg:text-xl' : 'text-xl lg:text-2xl'}`}>
        {currentText}
      </h2>

      <div className="flex flex-col gap-2 shrink-0">
        {currentOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={`w-full group relative text-left p-3.5 rounded-2xl border-2 flex items-center transition-all duration-300
              ${selectedId === option.id 
                ? 'border-blue-600 bg-blue-50/30' 
                : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md'}
              ${disabled && selectedId !== option.id ? 'opacity-60 grayscale-[0.5]' : ''}
            `}
          >
            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center mr-4 shrink-0 transition-all
              ${selectedId === option.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-600'}
            `}>
              <span className="text-[10px] font-black font-mono">{option.id.toUpperCase()}</span>
            </div>
            <span className={`text-[13px] font-bold leading-snug tracking-tight ${selectedId === option.id ? 'text-blue-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
              {option.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
