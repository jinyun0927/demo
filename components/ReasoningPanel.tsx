
import React, { useState, useEffect } from 'react';
import { AIReasoning } from '../types';

interface ReasoningPanelProps {
  reasoning: AIReasoning;
  isLoading: boolean;
}

const ReasoningPanel: React.FC<ReasoningPanelProps> = ({ reasoning, isLoading }) => {
  const [showSimplified, setShowSimplified] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const steps = [
    "Decoding institutional logic...",
    "Scanning for linguistic traps...",
    "Reviewing civic principles...",
    "Generating logic audit..."
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % steps.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-slate-100 p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px] sm:min-h-[500px]">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-8">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-2xl rotate-45"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-2xl animate-spin rotate-45"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" /></svg>
          </div>
        </div>
        <p className="text-slate-900 font-black text-lg sm:text-xl mb-2">Institutional Audit</p>
        <div className="flex flex-col items-center">
          <p className="text-indigo-600 text-[10px] sm:text-xs font-black uppercase tracking-widest animate-pulse h-5">
            {steps[loadingStep]}
          </p>
          <div className="mt-4 flex gap-1">
             {steps.map((_, i) => (
               <div key={i} className={`h-1 w-3 sm:w-4 rounded-full transition-all duration-300 ${i === loadingStep ? 'bg-indigo-600 w-6 sm:w-8' : 'bg-slate-200'}`} />
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-xl shadow-indigo-50/50 overflow-hidden">
        {/* Panel Header */}
        <div className="bg-indigo-600 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-white font-black uppercase tracking-tight text-[10px] sm:text-xs">Logic Audit Console</h3>
          </div>
          
          <button 
            onClick={() => setShowSimplified(!showSimplified)}
            className={`flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${showSimplified ? 'bg-white text-indigo-600 shadow-lg' : 'bg-indigo-700 text-indigo-200 hover:bg-indigo-500'}`}
          >
            {showSimplified ? 'Professional' : 'Plain English'}
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Vocabulary Section */}
          {reasoning.vocabulary && reasoning.vocabulary.length > 0 && (
            <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Key Terms</h4>
              <div className="flex flex-wrap gap-2">
                {reasoning.vocabulary.map((v, i) => (
                  <div key={i} className="group relative">
                    <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white border-2 border-slate-100 rounded-xl text-[10px] sm:text-[11px] font-black text-slate-700 hover:border-indigo-300 transition-colors cursor-help">
                      {v.term}
                    </span>
                    <div className="absolute bottom-full left-0 mb-2 w-40 sm:w-48 p-3 bg-slate-900 text-white text-[9px] sm:text-[10px] font-medium rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                      {v.simpleDefinition}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Institutional Reasoning</h4>
            <p className={`text-slate-800 leading-relaxed font-bold text-sm sm:text-base ${showSimplified ? 'text-base sm:text-lg text-indigo-900 border-l-4 border-indigo-500 pl-4 py-1' : ''}`}>
              {showSimplified ? (reasoning.simplifiedExplanation || reasoning.explanation) : reasoning.explanation}
            </p>
          </section>

          <section className="bg-amber-50/50 rounded-2xl p-4 sm:p-5 border-2 border-amber-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            </div>
            <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2">The Distractor Trap</h4>
            <p className="text-slate-700 text-xs sm:text-sm font-bold leading-relaxed">{reasoning.conceptualTrap}</p>
          </section>

          <div className="grid grid-cols-1 gap-5 border-t border-slate-100 pt-6">
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Tested Principle</h4>
              <p className="text-indigo-600 font-black tracking-tight text-sm sm:text-base">{reasoning.testedPrinciple}</p>
            </section>
            
            {reasoning.misleadingLanguage && (
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Language Nuance</h4>
                <p className="text-slate-600 text-xs sm:text-sm font-medium italic">"{reasoning.misleadingLanguage}"</p>
              </section>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-2 bg-slate-100 rounded-xl flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">AI Reasoning assistant active</p>
      </div>
    </div>
  );
};

export default ReasoningPanel;
