
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
      case 'MASTERY': return 'text-emerald-500';
      case 'CRITICAL': return 'text-rose-500';
      default: return 'text-indigo-400';
    }
  };

  const getTierLabel = (tier: SessionTier) => {
    switch (tier) {
      case 'MASTERY': return 'Exceptional Mastery';
      case 'CRITICAL': return 'Critical Divergence';
      default: return 'Aligned Potential';
    }
  };

  const getActionButtonText = () => {
    if (analysis.tier === 'MASTERY') return 'Nuance Drill (Advanced)';
    if (analysis.tier === 'CRITICAL') return 'Emergency Remediation';
    return 'Targeted Repair Session';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
      {/* Header & Gauge */}
      <div className="bg-[#0a0a0a] rounded-[3rem] border border-white/10 overflow-hidden relative group">
        <div className={`absolute top-0 left-0 w-full h-2 ${analysis.tier === 'MASTERY' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : analysis.tier === 'CRITICAL' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
        
        <div className="p-12 sm:p-16 flex flex-col md:flex-row items-center gap-12">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {analysis.tier === 'MASTERY' && (
              <div className="absolute inset-[-20px] bg-emerald-500/10 blur-[40px] rounded-full animate-pulse"></div>
            )}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={552} strokeDashoffset={552 - (552 * analysis.scorePercentage) / 100} className={`${getTierColor(analysis.tier)} transition-all duration-1000 ease-out`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black tracking-tighter">{Math.round(analysis.scorePercentage)}%</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Audit Grade</span>
            </div>
          </div>

          <div className="flex-grow text-center md:text-left space-y-6">
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${getTierColor(analysis.tier)}`}>
                Session Result: {getTierLabel(analysis.tier)}
              </p>
              <h2 className="text-4xl font-black tracking-tight leading-tight">
                {analysis.tier === 'MASTERY' ? 'Institutional Logic Certified' : 'Institutional Logic Audit'}
              </h2>
            </div>
            <p className="text-white/40 text-lg font-medium leading-relaxed italic border-l-2 border-white/5 pl-6">
              "{analysis.overallAssessment}"
            </p>
          </div>
        </div>
      </div>

      {/* Logic Gaps & Mastery Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="bg-[#0a0a0a] p-12 rounded-[2.5rem] border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-8">
              {analysis.tier === 'MASTERY' ? 'Validation Profile' : 'Weakness Audit'}
            </h3>
            <div className="space-y-6">
              {analysis.weakAreas && analysis.weakAreas.length > 0 ? (
                analysis.weakAreas.map((wa, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">{wa.area}</p>
                    <p className="text-white/60 text-sm font-bold leading-relaxed">{wa.description}</p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center bg-emerald-500/5 rounded-[2rem] border border-emerald-500/20">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">Zero Logical Friction</p>
                  <p className="text-white/20 text-[11px] font-bold px-8">No reasoning gaps identified in basic diagnostic.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-white/5">
             <h4 className={`${analysis.tier === 'MASTERY' ? 'text-emerald-400' : 'text-rose-400'} text-[10px] font-black uppercase tracking-widest mb-2`}>
               {analysis.tier === 'MASTERY' ? 'Mastery Insight' : 'Error Pattern'}
             </h4>
             <p className="text-white/20 text-xs font-bold italic">"{analysis.errorPatterns}"</p>
          </div>
        </section>

        <section className="bg-[#0a0a0a] p-12 rounded-[2.5rem] border border-white/5 flex flex-col justify-between overflow-hidden relative">
          {analysis.tier === 'MASTERY' && analysis.mastery ? (
            <div className="space-y-8 animate-in slide-in-from-right-12">
              <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Mastery Validation</h3>
              <p className="text-white/60 text-sm font-bold leading-relaxed">{analysis.mastery.why_full_score_is_not_the_end}</p>
              <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
                <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-4">Nuance Challenge (One-Off)</p>
                <p className="text-white font-bold text-base mb-8">{analysis.mastery.advanced_check.scenario}</p>
                <div className="space-y-3">
                  {analysis.mastery.advanced_check.options.map(o => (
                    <button key={o.id} onClick={() => handlePracticeSelect(o.id)} disabled={!!selectedPracticeOptionId} className={`w-full p-4 rounded-xl text-left font-black text-xs transition-all border ${selectedPracticeOptionId === o.id ? (o.id === analysis.mastery?.advanced_check.correct ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white') : 'bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}>
                      {o.text}
                    </button>
                  ))}
                </div>
                {selectedPracticeOptionId && (
                  <div className="mt-6 p-4 bg-white/5 rounded-xl text-[10px] text-emerald-400 font-bold italic animate-in zoom-in-95 leading-relaxed">
                    {analysis.mastery.advanced_check.explanation}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full space-y-8">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">Advanced Nuance Locked</h3>
                <p className="text-white/20 text-xs font-bold leading-relaxed px-8">Achieve 100% logic alignment in a session to unlock institutional gray-zone audits.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
        <button 
          onClick={handleTargetedAction}
          disabled={isGeneratingChallenge}
          className={`px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center gap-4 ${analysis.tier === 'MASTERY' ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500' : 'bg-white text-black hover:bg-indigo-600 hover:text-white shadow-white/10'}`}
        >
          {isGeneratingChallenge ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {getActionButtonText()}
            </>
          )}
        </button>
        <button onClick={onReset} className="px-12 py-5 bg-white/5 text-white/40 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:text-white transition-all">New Baseline Audit</button>
      </div>
    </div>
  );
};

export default SessionAnalysisPanel;
