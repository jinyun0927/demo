
import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
  isEnglishMode: boolean;
  onToggleLanguage: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  selectedId, 
  onSelect, 
  disabled,
  isEnglishMode,
  onToggleLanguage
}) => {
  const currentOptions = isEnglishMode && question.text_en 
    ? question.options.map(o => ({ id: o.id, text: o.text_en || o.text })) 
    : question.options;
  const currentText = isEnglishMode && question.text_en ? question.text_en : question.text;

  return (
    <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden transition-all duration-500">
      <div className="p-8 sm:p-12">
        <div className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
             <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em]">
              Scenario Audit #{question.id}
             </span>
           </div>
          <button 
            onClick={onToggleLanguage}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${isEnglishMode ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.19 15.378 3 18" /></svg>
            {isEnglishMode ? "French Context" : "Legal Translation"}
          </button>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black mb-16 leading-tight tracking-tighter text-white">
          {currentText}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {currentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              disabled={disabled}
              className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 flex items-center group relative overflow-hidden
                ${selectedId === option.id 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {selectedId === option.id && (
                <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
              )}
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mr-6 flex-shrink-0 transition-all z-10
                ${selectedId === option.id ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-black/40 border-white/10 text-white/20 group-hover:border-white/30'}
              `}>
                <span className="text-xs font-black">{option.id.toUpperCase()}</span>
              </div>
              <span className={`text-lg font-bold leading-snug z-10 ${selectedId === option.id ? 'text-white' : 'text-white/60'}`}>
                {option.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
