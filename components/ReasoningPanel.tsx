
import React, { useState, useEffect, useRef } from 'react';
import { AIReasoning, Question } from '../types';
import { speakReasoning, generateScenarioImage } from '../services/geminiService';

interface ReasoningPanelProps {
  reasoning: AIReasoning;
  isLoading: boolean;
  currentQuestion: Question;
}

const ReasoningPanel: React.FC<ReasoningPanelProps> = ({ reasoning, isLoading, currentQuestion }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [visualAid, setVisualAid] = useState<string | null>(null);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [imageError, setImageError] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sync state when question changes
  useEffect(() => {
    // Priority: Static imageUrl -> Local cache -> Null
    const cachedImage = localStorage.getItem(`CIVICMIND_IMG_CACHE_${currentQuestion.id}`);
    setVisualAid(currentQuestion.imageUrl || cachedImage || null);
    setImageError(false);
  }, [currentQuestion]);

  const handleVoiceAssist = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audioData = await speakReasoning(reasoning.explanation);
      if (audioData) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const dataInt16 = new Int16Array(audioData.buffer);
        const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < dataInt16.length; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        source.start();
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      setIsPlaying(false);
    }
  };

  const handleGenerateVisual = async () => {
    if (isGeneratingVisual) return;
    setIsGeneratingVisual(true);
    setImageError(false);
    try {
      const url = await generateScenarioImage(currentQuestion.text);
      if (url) {
        setVisualAid(url);
        // Special case: for targeted questions without IDs, we rely on prompt-based hashing in geminiService
      }
    } catch (e) {
      console.error(e);
      setImageError(true);
    } finally {
      setIsGeneratingVisual(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center text-center shadow-2xl min-h-[600px]">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest animate-pulse">Running Institutional Audit</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase mt-4 tracking-widest">Mapping legal jurisprudence...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-12 duration-700">
      <div className="bg-slate-900 rounded-3xl shadow-3xl overflow-hidden border border-slate-800">
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Institutional Auditor</h3>
              <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest">Logic Decryption Protocol</p>
            </div>
          </div>
          <button 
            onClick={handleVoiceAssist}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isPlaying ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isPlaying ? "Voice Active" : "Voice Assist"}
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" /></svg>
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Visual Aid Section */}
          <section className="relative group">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                 <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                   {currentQuestion.imageUrl ? 'Local Asset Verified' : 'AI Context Visual'}
                 </h4>
               </div>
               {visualAid && !imageError && (
                 <button 
                   onClick={handleGenerateVisual}
                   className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors"
                 >
                   Regenerate with AI
                 </button>
               )}
            </div>
            
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center relative shadow-inner">
               {visualAid && !imageError ? (
                 <img 
                   src={visualAid} 
                   alt="Scenario Context" 
                   className="w-full h-full object-cover animate-in fade-in duration-1000" 
                   onError={() => {
                     console.warn("Local image not found at: ", visualAid);
                     setImageError(true);
                   }}
                 />
               ) : (
                 <div className="text-center p-8">
                    {isGeneratingVisual ? (
                      <div className="space-y-4">
                        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Generating mnemonic aid...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {imageError && (
                          <p className="text-[10px] text-rose-400 font-black uppercase tracking-widest mb-2 px-4 py-2 bg-rose-500/10 rounded-lg">
                            Local Asset missing at /public/...
                          </p>
                        )}
                        <button 
                          onClick={handleGenerateVisual}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                        >
                          {imageError ? "Fix with AI Visual" : "Generate Visual Mnemonic"}
                        </button>
                      </div>
                    )}
                 </div>
               )}
               {/* Aesthetic overlay for a tech feel */}
               <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl"></div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
               <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
               <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Principle Analysis</h4>
            </div>
            <p className="text-white text-lg font-black leading-tight mb-4">{reasoning.testedPrinciple}</p>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">{reasoning.explanation}</p>
          </section>

          <div className="grid grid-cols-1 gap-6 pt-8 border-t border-white/5">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
              <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2">The Civic Trap</h5>
              <p className="text-amber-200/80 text-xs font-bold leading-relaxed">{reasoning.conceptualTrap}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReasoningPanel;
