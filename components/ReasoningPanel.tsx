
import React from 'react';
import { AIReasoning } from '../types';

interface ReasoningPanelProps {
  reasoning: AIReasoning;
  isLoading: boolean;
}

const ReasoningPanel: React.FC<ReasoningPanelProps> = ({ reasoning, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Decoding institutional logic...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
        <div className="bg-indigo-600 px-6 py-3">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Reasoning Assistant
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          <section>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Institutional Logic</h4>
            <p className="text-slate-700 leading-relaxed">{reasoning.explanation}</p>
          </section>

          <section className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <h4 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              The Distractor Trap
            </h4>
            <p className="text-slate-700">{reasoning.conceptualTrap}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Tested Principle</h4>
              <p className="text-slate-700 font-medium">{reasoning.testedPrinciple}</p>
            </section>
            {reasoning.misleadingLanguage && (
              <section className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Language Nuance</h4>
                <p className="text-slate-700">{reasoning.misleadingLanguage}</p>
              </section>
            )}
          </div>

          {reasoning.learnerPerspective && (
            <section className="border-t border-slate-100 pt-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Learner Perspective</h4>
              <p className="text-slate-600 italic">"{reasoning.learnerPerspective}"</p>
            </section>
          )}

          {reasoning.patternAnalysis && (
            <section className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-2">Pattern Analysis</h4>
              <p className="text-indigo-800 text-sm">{reasoning.patternAnalysis}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReasoningPanel;
