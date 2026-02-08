
import React, { useState } from 'react';
import { SessionAnalysis, SessionTier } from '../types';

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

  const getTierColor = (tier: SessionTier) => {
    switch (tier) {
      case 'MASTERY': return 'text-emerald-600';
      case 'CRITICAL': return 'text-rose-600';
      default: return 'text-blue-600';
    }
  };

  const getTierLabel = (tier: SessionTier) => {
    switch (tier) {
      case 'MASTERY': return 'Jurisprudence Mastery';
      case 'CRITICAL': return 'Critical Logical Gap';
      default: return 'Civic Alignment';
    }
  };

  const circumference = 2 * Math.PI * 80;

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      <div className="bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-slate-200 card-shadow overflow-hidden relative">
        <div className={`absolute top-0 left-0 w-full h-1.5 sm:h-2 ${analysis.tier === 'MASTERY' ? 'bg-emerald-500' : analysis.tier === 'CRITICAL' ? 'bg-rose-500' : 'bg-blue-600'}`} />
        
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex flex-col items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 176 176">
              <circle cx="88" cy="88" r="80" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
              <circle 
                cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={circumference} 
                strokeDashoffset={circumference - (circumference * analysis.scorePercentage) / 100} 
                className={`${getTierColor(analysis.tier)} transition-all duration-1000 ease-out`} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">{Math.round(analysis.scorePercentage)}%</span>
              <span className="text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400">Alignment</span>
            </div>
          </div>

          <div className="flex-grow text-center md:text-left">
            <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-2 sm:mb-3 ${getTierColor(analysis.tier)}`}>
              Status: {getTierLabel(analysis.tier)}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight">Institutional Performance Audit</h2>
            <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-100">
              <p className="text-slate-600 text-base sm:text-lg font-medium italic leading-relaxed">"{analysis.overallAssessment}"</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <section className="bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 card-shadow">
          <h3 className="text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-6 sm:mb-8">Logic Node Analysis</h3>
          <div className="space-y-4">
            {analysis.weakAreas && analysis.weakAreas.length > 0 ? (
              analysis.weakAreas.map((wa, i) => (
                <div key={i} className="bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-100 group hover:border-blue-300 transition-colors">
                  <p className="text-blue-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-2">{wa.area}</p>
                  <p className="text-slate-700 text-sm font-bold leading-relaxed">{wa.description}</p>
                </div>
              ))
            ) : (
              <div className="py-10 sm:py-12 text-center bg-emerald-50 rounded-[2rem] border border-emerald-100">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-emerald-700 font-bold text-sm">Perfect Structural Logic</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200 card-shadow relative">
          {analysis.tier === 'MASTERY' && analysis.mastery ? (
            <div className="space-y-5 sm:space-y-6">
              <h3 className="text-[9px] sm:text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">Mastery Verification</h3>
              <p className="text-slate-600 text-xs sm:text-sm font-bold leading-relaxed">{analysis.mastery.why_full_score_is_not_the_end}</p>
              <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                 <p className="text-slate-900 font-black text-xs sm:text-sm mb-4 sm:mb-6">{analysis.mastery.advanced_check.scenario}</p>
                 <div className="space-y-2.5 sm:space-y-3">
                   {analysis.mastery.advanced_check.options.map(o => (
                     <button key={o.id} onClick={() => handlePracticeSelect(o.id)} disabled={!!selectedPracticeOptionId} className={`w-full p-3.5 sm:p-4 rounded-xl text-left text-[11px] sm:text-xs font-bold transition-all border ${selectedPracticeOptionId === o.id ? (o.id === analysis.mastery?.advanced_check.correct ? 'bg-emerald-600 border-emerald-500 text-white shadow-md' : 'bg-rose-600 border-rose-500 text-white shadow-md') : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}>
                        {o.text}
                     </button>
                   ))}
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40 grayscale min-h-[200px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">Advanced Logic Locked</p>
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center pt-8 pb-12">
        <button 
          onClick={handleTargetedAction}
          disabled={isGeneratingChallenge}
          className="px-10 sm:px-12 py-4 sm:py-5 bg-blue-600 text-white rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50"
        >
          {isGeneratingChallenge ? 'Initializing Remediator...' : 'Start Repair Session'}
        </button>
        <button onClick={onReset} className="px-10 sm:px-12 py-4 sm:py-5 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">New Baseline Audit</button>
      </div>
    </div>
  );
};

export default SessionAnalysisPanel;
