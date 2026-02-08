
import React, { useState } from 'react';
import { SessionAnalysis } from '../types';

interface SessionAnalysisPanelProps {
  analysis: SessionAnalysis;
  onReset: () => void;
  onStartTargetedChallenge: () => Promise<void>;
}

const SessionAnalysisPanel: React.FC<SessionAnalysisPanelProps> = ({ analysis, onReset, onStartTargetedChallenge }) => {
  const [selectedPracticeOptionId, setSelectedPracticeOptionId] = useState<string | null>(null);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);

  const handlePracticeSelect = (id: string) => {
    if (selectedPracticeOptionId) return;
    setSelectedPracticeOptionId(id);
  };

  const handleTargetedAction = async () => {
    setIsGeneratingChallenge(true);
    await onStartTargetedChallenge();
    setIsGeneratingChallenge(false);
  };

  // Logic for Perfect Score (Mastery)
  if (analysis.isPerfect && analysis.mastery) {
    const m = analysis.mastery;

    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-8 bg-indigo-950 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-emerald-500 rounded-full"></div>
              <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">Institutional Mastery Validation</h2>
            </div>
            <p className="text-slate-400 font-medium text-xs sm:text-base">Validation of logic depth and systemic nuance for professional candidacy.</p>
          </div>

          <div className="p-5 sm:p-8 space-y-10 sm:space-y-12">
            <section>
              <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Reasoning Validation</h3>
              <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 sm:p-6 rounded-r-2xl shadow-sm">
                <p className="text-slate-800 leading-relaxed font-bold italic text-sm sm:text-base">"{m.overall_validation || "Systemic logic confirmed."}"</p>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <section>
                <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Logic Safety: Avoided Traps</h3>
                <div className="space-y-3">
                  {(m.avoided_traps || []).map((trap, i) => (
                    <div key={i} className="flex gap-3 sm:gap-4 p-3.5 sm:p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl items-center">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-emerald-900 font-black uppercase tracking-tight leading-tight">{trap}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">The Depth Factor</h3>
                <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl h-full">
                  <h4 className="text-[8px] sm:text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-3">Institutional Context</h4>
                  <p className="text-xs sm:text-sm text-slate-600 font-bold leading-relaxed">{m.why_full_score_is_not_the_end}</p>
                </div>
              </section>
            </div>

            {m.advanced_check && (
              <section className="border-t-2 border-slate-100 pt-10 sm:pt-12">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">The Nuance Challenge</h3>
                  </div>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">A specialized scenario requiring the highest level of systemic reasoning.</p>
                </div>

                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-inner">
                  <div className="mb-6 sm:mb-8 p-5 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-3">Final Mastery Scenario</h4>
                    <p className="text-slate-900 font-black text-base sm:text-lg leading-relaxed">{m.advanced_check.scenario}</p>
                    <div className="h-px bg-slate-100 w-full my-5 sm:my-6"></div>
                    <p className="text-slate-700 font-bold text-sm sm:text-base">{m.advanced_check.question}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {m.advanced_check.options.map(o => {
                      const isSelected = selectedPracticeOptionId === o.id;
                      const isCorrect = o.id === m.advanced_check.correct;
                      
                      let style = "border-slate-200 bg-white hover:border-indigo-400 hover:shadow-md text-slate-700";
                      if (selectedPracticeOptionId) {
                        if (isCorrect) style = "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm shadow-emerald-100";
                        else if (isSelected) style = "border-rose-500 bg-rose-50 text-rose-900 shadow-sm shadow-rose-100";
                        else style = "border-slate-100 bg-slate-50/50 text-slate-300 opacity-60";
                      }

                      return (
                        <button 
                          key={o.id}
                          onClick={() => handlePracticeSelect(o.id)}
                          disabled={!!selectedPracticeOptionId}
                          className={`w-full text-left p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 font-black transition-all flex items-center gap-4 sm:gap-5 active:scale-[0.99] ${style}`}
                        >
                          <span className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center shrink-0 text-xs sm:text-sm tracking-tighter transition-colors
                            ${selectedPracticeOptionId ? (isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : (isSelected ? 'bg-rose-500 border-rose-600 text-white' : 'bg-slate-100 border-slate-200 text-slate-300')) : 'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-400'}
                          `}>
                            {o.id}
                          </span>
                          <span className="leading-snug text-sm sm:text-base">{o.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedPracticeOptionId && (
                    <div className="mt-8 sm:mt-10 p-6 sm:p-8 bg-slate-900 text-white rounded-2xl sm:rounded-3xl animate-in zoom-in-95 duration-500 border-t-4 border-indigo-500 shadow-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs sm:text-sm ${selectedPracticeOptionId === m.advanced_check.correct ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                          {selectedPracticeOptionId === m.advanced_check.correct ? '✓' : '!'}
                        </div>
                        <h5 className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest">Institutional Jurisprudence</h5>
                      </div>
                      <p className="text-sm sm:text-[15px] font-bold leading-relaxed text-slate-200">{m.advanced_check.explanation}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className="pt-10 sm:pt-12 border-t border-slate-100 flex flex-col items-center gap-4">
              <button 
                onClick={onReset} 
                className="w-full sm:w-auto px-10 py-4 sm:px-12 sm:py-5 bg-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
              >
                Complete Validation Session
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 bg-slate-900 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-indigo-500 rounded-full"></div>
            <h2 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">Logic Audit Blueprint</h2>
          </div>
          <p className="text-slate-400 font-medium text-xs sm:text-base">Analysis of systemic reasoning gaps and targeted institutional fixes.</p>
        </div>

        <div className="p-5 sm:p-8 space-y-10 sm:space-y-12">
          <section>
            <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Systemic Assessment</h3>
            <div className="bg-slate-50 border-l-4 border-indigo-500 p-5 sm:p-6 rounded-r-2xl shadow-sm">
              <p className="text-slate-700 leading-relaxed font-bold italic text-sm sm:text-base">
                "{analysis.overallAssessment || "Audit complete. Analyzing institutional reasoning patterns."}"
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <section>
              <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Focus Gaps</h3>
              <div className="space-y-4">
                {(analysis.weakAreas && analysis.weakAreas.length > 0) ? analysis.weakAreas.map((wa, i) => (
                  <div key={i} className="p-4 sm:p-5 bg-white border-2 border-slate-100 rounded-xl sm:rounded-2xl hover:border-indigo-200 transition-colors">
                    <span className="font-black text-indigo-700 text-[9px] sm:text-[10px] uppercase tracking-wider block mb-2">{wa.area}</span>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-bold">{wa.description}</p>
                  </div>
                )) : (
                  <div className="p-4 sm:p-5 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl sm:rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase">No specific gaps identified.</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Error Pattern Audit</h3>
              <div className="p-5 sm:p-6 bg-rose-50/50 border-2 border-rose-100 rounded-xl sm:rounded-2xl h-full">
                <p className="text-rose-900 text-sm font-black leading-relaxed mb-6">{analysis.errorPatterns || "No repeated error patterns detected in current session."}</p>
                <div className="pt-4 border-t border-rose-100">
                  <h4 className="text-[8px] sm:text-[9px] font-black text-rose-400 uppercase mb-1">Strategic Fix</h4>
                  <p className="text-[10px] sm:text-xs text-rose-800 font-bold italic">{analysis.recommendedFocus || "Continue varied scenario practice."}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="pt-10 sm:pt-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleTargetedAction}
              disabled={isGeneratingChallenge}
              className="w-full sm:w-auto px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 flex items-center justify-center gap-3"
            >
              {isGeneratingChallenge ? (
                <>
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Synthesizing...
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Generate Targeted Challenge
                </>
              )}
            </button>
            <button 
              onClick={onReset} 
              className="w-full sm:w-auto px-12 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all active:scale-95"
            >
              Start New Diagnostic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionAnalysisPanel;
