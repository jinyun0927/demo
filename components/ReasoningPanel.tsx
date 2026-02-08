
import React, { useState, useRef } from 'react';
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
      <div className="dashboard-card h-full flex flex-col items-center justify-center text-center p-12 bg-blue-50/10 border-blue-100 shadow-2xl animate-in fade-in duration-500">
        <div className="relative mb-8">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 border-t-4 border-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-600 animate-pulse">Generating Audit Logs...</p>
        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Cross-referencing Jurisprudence</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card h-full flex flex-col overflow-hidden bg-white shadow-2xl border-slate-200/60 animate-in slide-in-from-right-8 duration-500">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/40">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" /></svg>
          </div>
          <div>
            <h3 className="text-slate-900 font-black text-[12px] uppercase tracking-widest leading-none mb-1.5">Audit Record</h3>
            <p className="text-blue-600 text-[9px] font-black uppercase tracking-widest leading-none font-mono">Status: Verified</p>
          </div>
        </div>
        <button 
          onClick={handleVoiceAssist}
          className={`w-11 h-11 flex items-center justify-center rounded-2xl shadow-sm transition-all ${isPlaying ? 'bg-blue-600 text-white animate-pulse shadow-lg shadow-blue-600/30' : 'bg-white text-slate-400 border border-slate-200 hover:text-blue-600 hover:border-blue-400'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
        </button>
      </div>
      
      <div className="flex-grow overflow-y-auto custom-scrollbar p-8 space-y-12">
        {/* Institutional Principle */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full"></div>
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Institutional Principle</h4>
          </div>
          <div className="p-6 rounded-3xl bg-blue-50/20 border border-blue-100/30 shadow-sm">
            <h5 className="text-[14px] font-black text-slate-900 mb-3 uppercase tracking-tight leading-tight">{reasoning.testedPrinciple}</h5>
            <p className="text-[13px] text-slate-600 font-bold leading-relaxed">
              {reasoning.explanation}
            </p>
          </div>
        </section>

        {/* Audit Logs - Fixed Alignment */}
        {reasoning.thinkingSteps && reasoning.thinkingSteps.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-slate-900 rounded-full"></div>
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Audit Logs</h4>
            </div>
            
            <div className="relative space-y-0 ml-1">
              <div className="absolute left-[14px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
              
              {reasoning.thinkingSteps.map((step, i) => (
                <div key={i} className="relative pl-12 pb-6 group last:pb-0">
                  {/* Fixed dot alignment using absolute top with careful pixel offset to align with text line height */}
                  <div className="absolute left-[7px] top-[22px] w-4 h-4 rounded-full bg-white border-2 border-slate-200 group-hover:border-blue-600 transition-all z-10 shadow-sm flex items-center justify-center ring-4 ring-white">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-600 transition-colors"></div>
                  </div>
                  
                  <div className="bg-slate-50/40 p-5 rounded-2xl border border-transparent group-hover:border-slate-200 group-hover:bg-white transition-all duration-300">
                    <p className="text-slate-700 text-[12px] font-bold leading-relaxed">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Jurisprudence Section - Refined for robustness with real API output */}
        {sources && sources.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
              <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Jurisprudence</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {sources.map((source, i) => {
                // Handling both standard mock format and official Gemini groundingChunks format
                const uri = source.web?.uri || source.maps?.uri || source.uri;
                if (!uri) return null;

                const rawTitle = source.web?.title || source.maps?.title || source.title;
                const title = rawTitle || new URL(uri).hostname || "Reference Source";

                return (
                  <a 
                    key={i} 
                    href={uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-500/30 hover:bg-emerald-50/50 transition-all group shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                         <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      </div>
                      <span className="text-[12px] font-black text-slate-700 group-hover:text-emerald-800 truncate">{title}</span>
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-emerald-300">
                      <svg className="w-3 h-3 text-slate-400 group-hover:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* Cognitive Trap */}
        <div className="bg-rose-50/40 rounded-[2.5rem] p-8 border border-rose-100/50 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 opacity-5 scale-150 rotate-12">
              <svg className="w-24 h-24 text-rose-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          </div>
          <p className="text-[10px] font-black text-rose-700 uppercase mb-3 tracking-widest">Cognitive Trap Warning</p>
          <p className="text-rose-900/80 text-[13px] font-bold leading-relaxed italic">
            {reasoning.conceptualTrap}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReasoningPanel;
