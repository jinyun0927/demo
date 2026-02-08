
import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedId, onSelect, disabled }) => {
  const [judgeModeEnabled, setJudgeModeEnabled] = useState(false);
  const [imageError, setImageError] = useState(false);

  const currentOptions = judgeModeEnabled && question.text_en ? question.options.map(o => ({ id: o.id, text: o.text_en || o.text })) : question.options;
  const currentText = judgeModeEnabled && question.text_en ? question.text_en : question.text;

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden transition-all hover:shadow-2xl">
      <div className="p-8 sm:p-10">
        <div className="flex items-center justify-between mb-8">
           <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
            {question.category}
          </span>
          <button 
            onClick={() => setJudgeModeEnabled(!judgeModeEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${judgeModeEnabled ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.19 15.378 3 18" /></svg>
            {judgeModeEnabled ? "FR Mode" : "Judge Mode (EN)"}
          </button>
        </div>

        {/* Improved Image Section */}
        <div className="mb-10 aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
          {question.imageUrl && !imageError ? (
            <img 
              src={question.imageUrl} 
              alt="Scenario Context" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-6 text-center">
              <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">
                {imageError ? "Asset Not Found" : "Visualizing Scenario..."}
              </p>
              <p className="text-[9px] mt-1 opacity-60 font-bold uppercase tracking-widest">
                Check /public/assets/images/scenarios/
              </p>
            </div>
          )}
          {/* Subtle overlay for tech look */}
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-2xl"></div>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-black mb-10 leading-tight tracking-tight text-slate-900 ${judgeModeEnabled ? 'italic' : ''}`}>
          {currentText}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {currentOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              disabled={disabled}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 flex items-center group
                ${selectedId === option.id 
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-100' 
                  : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center mr-5 flex-shrink-0 transition-all
                ${selectedId === option.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-300 group-hover:text-indigo-600'}
              `}>
                <span className="text-sm font-black">{option.id.toUpperCase()}</span>
              </div>
              <span className={`text-base sm:text-lg font-bold leading-tight ${selectedId === option.id ? 'text-indigo-900' : 'text-slate-600'}`}>
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
