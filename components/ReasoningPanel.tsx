
import React, { useState, useEffect, useRef } from 'react';
import { AIReasoning, Question } from '../types';
import { speakReasoning, decodeAudioData } from '../services/geminiService';

interface ReasoningPanelProps {
  reasoning: AIReasoning | null;
  isLoading: boolean;
  currentQuestion: Question;
  sources?: any[];
}

const ReasoningPanel: React.FC<ReasoningPanelProps> = ({ reasoning, isLoading, currentQuestion, sources }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleVoiceAssist = async () => {
    if (isPlaying || !reasoning) return;
    setIsPlaying(true);
    try {
      const audioData = await speakReasoning(reasoning.explanation);
      if (audioData) {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const buffer = await decodeAudioData(audioData, audioCtxRef.current, 24000);
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtxRef.current.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      } else setIsPlaying(false);
    } catch { setIsPlaying(false); }
  };

  if (isLoading || !reasoning) {
    return (
      <div className="bg-[#0a0a0a] rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center min-h-[600px] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-indigo-600/5 animate-pulse"></div>
        <div className="w-24 h-24 relative mb-12">
          <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-4 bg-indigo-600/20 rounded-full flex items-center justify-center animate-pulse">
             <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
        <h3 className="text-white font-black text-xs uppercase tracking-[0.5em] mb-4">Logic Audit in Progress</h3>
        <p className="text-white/20 text-[10px] font-bold max-w-[200px] leading-relaxed">Gemini 3 is auditing institutional jurisprudence and common traps...</p>
      </div>
    );
  }

  // Ensure arrays exist to avoid .map errors
  const steps = reasoning.thinkingSteps || [];
  const grounding = sources || [];

  return (
    <div className="bg-[#0a0a0a] rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 flex flex-col max-h-[85vh] relative">
      <div className="px-10 py-8 flex items-center justify-between border-b border-white/5 bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h3 className="text-white font-black text-[11px] uppercase tracking-widest">Audit Result</h3>
            <p className="text-white/20 text-[8px] font-black uppercase tracking-widest">G3 Reasoning Engine</p>
          </div>
        </div>
        <button 
          onClick={handleVoiceAssist}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isPlaying ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 animate-pulse' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        </button>
      </div>
      
      <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
        <section>
          <div className="inline-block px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4">
             <span className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">Principle</span>
          </div>
          <h4 className="text-white text-2xl font-black leading-tight mb-4 tracking-tight">{reasoning.testedPrinciple || "Systemic Logic"}</h4>
          <p className="text-slate-400 text-[15px] font-medium leading-relaxed">{reasoning.explanation}</p>
        </section>

        {steps.length > 0 && (
          <section className="bg-white/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-[60px] rounded-full -mr-16 -mt-16"></div>
            <div className="flex items-center gap-3 mb-6 relative">
               <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Logical Derivation</h4>
            </div>
            <div className="space-y-6 relative">
              {steps.map((step, i) => (
                <div 
                  key={i} 
                  className="flex gap-4 animate-in fade-in slide-in-from-left-4 fill-mode-both"
                  style={{ animationDelay: `${(i + 1) * 200}ms` }}
                >
                  <div className="shrink-0 w-6 h-6 rounded-full bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center">
                    <span className="text-indigo-500 text-[10px] font-black">{i + 1}</span>
                  </div>
                  <p className="text-slate-300 text-[13px] font-bold leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {grounding.length > 0 && (
          <section className="space-y-4">
            <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Institutional References</h4>
            <div className="flex flex-wrap gap-2">
              {grounding.map((chunk: any, i: number) => (
                chunk.web && (
                  <a key={i} href={chunk.web.uri} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all text-[11px] font-bold text-slate-400 hover:text-white group">
                    <svg className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    {chunk.web.title || "Official Jurisprudence"}
                  </a>
                )
              ))}
            </div>
          </section>
        )}

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 blur-[40px] rounded-full -ml-12 -mb-12"></div>
          <h5 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Cognitive Trap Alert
          </h5>
          <p className="text-amber-200/70 text-[13px] font-bold leading-relaxed italic relative z-10">"{reasoning.conceptualTrap || "No traps identified."}"</p>
        </div>
      </div>
    </div>
  );
};

export default ReasoningPanel;
