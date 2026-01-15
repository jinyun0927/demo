
import React from 'react';
import { Question, Option } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedId, onSelect, disabled }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] sm:text-xs font-semibold rounded-full uppercase tracking-wider">
          {question.category}
        </span>
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-slate-800 mb-6 leading-snug">
        {question.text}
      </h2>
      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            disabled={disabled}
            className={`w-full text-left p-3.5 sm:p-4 rounded-lg border transition-all duration-200 flex items-center group
              ${selectedId === option.id 
                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100 shadow-sm shadow-indigo-50' 
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}
              ${disabled ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}
            `}
          >
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 transition-colors
              ${selectedId === option.id ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}
            `}>
              {selectedId === option.id && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full" />}
            </div>
            <span className={`text-sm sm:text-base font-medium leading-tight ${selectedId === option.id ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>
              {option.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
