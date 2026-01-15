
import React, { useState } from 'react';
import { SessionAnalysis } from '../types';

interface SessionAnalysisPanelProps {
  analysis: SessionAnalysis;
  onReset: () => void;
}

const SessionAnalysisPanel: React.FC<SessionAnalysisPanelProps> = ({ analysis, onReset }) => {
  const [selectedPracticeOptionId, setSelectedPracticeOptionId] = useState<string | null>(null);

  const handlePracticeSelect = (id: string) => {
    if (selectedPracticeOptionId) return;
    setSelectedPracticeOptionId(id);
  };

  const isPracticeCorrect = selectedPracticeOptionId === analysis.nextPractice.correctOptionId;
  const practiceQuestion = analysis.nextPractice;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-slate-900 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
            <h2 className="text-3xl font-black tracking-tight">Logic Audit Blueprint</h2>
          </div>
          <p className="text-slate-400 font-medium">Deep analysis of your institutional reasoning patterns.</p>
        </div>

        <div className="p-8 space-y-10">
          {/* Executive Summary */}
          <section>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Overall Logic Assessment
            </h3>
            <div className="bg-slate-50 border-l-4 border-indigo-500 p-6 rounded-r-2xl">
              <p className="text-slate-700 leading-relaxed font-medium italic">
                "{analysis.overallAssessment}"
              </p>
            </div>
          </section>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Identified Growth Areas</h3>
              <div className="space-y-4">
                {analysis.weakAreas.map((wa, i) => (
                  <div key={i} className="p-5 border-2 border-slate-100 rounded-2xl hover:border-indigo-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{wa.area}</span>
                      <div className="flex gap-1">
                        {wa.evidenceQuestionIds.map(id => (
                          <span key={id} className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">CASE {id}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{wa.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Reasoning Error Patterns</h3>
              <div className="p-6 bg-amber-50/50 border-2 border-amber-100 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                   <svg className="w-16 h-16 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </div>
                <p className="text-amber-900 text-sm font-bold leading-relaxed mb-6">
                  {analysis.errorPatterns}
                </p>
                <div className="pt-4 border-t border-amber-200/50">
                  <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">Prescription</h4>
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">{analysis.recommendedFocus}</p>
                </div>
              </div>
            </section>
          </div>

          {/* Interactive Reinforcement Section */}
          <section className="border-t-2 border-slate-100 pt-10">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-black text-slate-900">Personalized Reinforcement Preview</h3>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-200">Interactive Example</span>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                This single, targeted case study is generated to bridge the reasoning gap identified in your audit. 
                <span className="text-indigo-600 ml-1">Focus on institutional requirements over intuition.</span>
              </p>
            </div>

            <div className={`rounded-3xl p-8 transition-all duration-500 ${selectedPracticeOptionId ? 'bg-slate-50 border-2 border-slate-200' : 'bg-white border-2 border-indigo-100 shadow-xl shadow-indigo-50'}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-black rounded uppercase tracking-tighter">Target Topic: {practiceQuestion.category}</span>
              </div>
              
              <h4 className="text-xl font-bold text-slate-800 mb-8 leading-snug">
                {practiceQuestion.text}
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {practiceQuestion.options.map(o => {
                  const isThisSelected = selectedPracticeOptionId === o.id;
                  const isThisCorrect = o.id === practiceQuestion.correctOptionId;
                  
                  let buttonStyle = "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-700";
                  if (selectedPracticeOptionId) {
                    if (isThisCorrect) buttonStyle = "border-green-500 bg-green-50 text-green-800 ring-2 ring-green-100";
                    else if (isThisSelected) buttonStyle = "border-red-500 bg-red-50 text-red-800 ring-2 ring-red-100";
                    else buttonStyle = "border-slate-100 text-slate-300 opacity-50";
                  }

                  return (
                    <button 
                      key={o.id}
                      onClick={() => handlePracticeSelect(o.id)}
                      disabled={!!selectedPracticeOptionId}
                      className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-all flex items-center group relative ${buttonStyle}`}
                    >
                      <span className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors text-xs
                        ${isThisSelected ? 'bg-current border-transparent' : 'bg-white border-slate-200'}
                      `}>
                        <span className={isThisSelected ? 'text-white' : 'text-slate-400'}>{o.id.toUpperCase()}</span>
                      </span>
                      <span className="flex-grow">{o.text}</span>
                      {selectedPracticeOptionId && isThisCorrect && (
                        <svg className="w-5 h-5 text-green-500 absolute right-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Block */}
              {selectedPracticeOptionId && (
                <div className="mt-8 animate-in zoom-in-95 fade-in duration-500">
                  <div className={`p-6 rounded-2xl border-2 mb-4 ${isPracticeCorrect ? 'bg-green-600 text-white border-green-700' : 'bg-red-600 text-white border-red-700 shadow-lg'}`}>
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl shrink-0">
                         {isPracticeCorrect ? '✓' : '✕'}
                       </div>
                       <div>
                         <p className="font-black text-lg mb-1">{isPracticeCorrect ? 'Correct Logic Applied' : 'Linguistic Trap Triggered'}</p>
                         <p className="text-sm text-white/90 font-medium leading-relaxed">
                            {isPracticeCorrect 
                              ? "Excellent. You identified the procedural priority over personal sentiment." 
                              : `The correct answer was "${practiceQuestion.options.find(op => op.id === practiceQuestion.correctOptionId)?.text}".`}
                         </p>
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-indigo-100 p-6 rounded-2xl shadow-sm">
                    <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Why this reinforcement?
                    </h5>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      This question was generated to address your tendency to confuse <span className="underline decoration-indigo-300 decoration-2 underline-offset-2">personal values</span> with <span className="underline decoration-indigo-300 decoration-2 underline-offset-2">institutional obligations</span>, as seen in your earlier answers. Strengthening this distinction is key for the final exam.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Footer Controls */}
          <div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
              Reasoning Hub v1.2 • Targeted Practice Module • End of Session
            </p>
            <button 
              onClick={onReset}
              className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
            >
              Start New Learning Session
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <p className="text-xs text-slate-400 italic">This demo concludes the practice. No data is stored between sessions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAnalysisPanel;
