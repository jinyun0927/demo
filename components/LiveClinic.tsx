
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { encode, decode, decodeAudioData } from '../services/geminiService';

const SUGGESTED_PROMPTS = [
  "Explain the difference between neutrality and secularism in schools.",
  "Why is the principle of 'Fraternité' legally binding in France?",
  "Audit my logic: I think freedom of speech allows me to say anything.",
  "What is the legal boundary of a 'manifestation' in public spaces?"
];

const LiveClinic: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [status, setStatus] = useState("Initializing Native Audio...");
  const [permissionError, setPermissionError] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    setPermissionError(false);
    setStatus("Requesting Mic Access...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Crucial: Browsers require context resume after user gesture
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      
      audioCtxRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus("Live Audio Active");
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
              
              sessionPromise.then(s => {
                try {
                  s.sendRealtimeInput({ 
                    media: { 
                      data: encode(new Uint8Array(int16.buffer)), 
                      mimeType: 'audio/pcm;rate=16000' 
                    } 
                  });
                } catch (err) {
                  console.error("Failed to send audio input", err);
                }
              });
            };
            
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Transcriptions
            if (msg.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-3), `AI: ${msg.serverContent!.outputTranscription!.text}`]);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev.slice(-3), `You: ${msg.serverContent!.inputTranscription!.text}`]);
            }

            // Handle Audio Output
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const audio = decode(msg.serverContent.modelTurn.parts[0].inlineData.data);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              
              const buffer = await decodeAudioData(audio, outputCtx, 24000);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              
              source.onended = () => {
                sourcesRef.current.delete(source);
              };

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruptions
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live API Error", e);
            setStatus("Session Interrupted");
            setIsActive(false);
          },
          onclose: () => {
            setIsActive(false);
            setStatus("Session Closed");
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Zephyr' } 
            } 
          },
          systemInstruction: `
            You are the "CivicMind Live Auditor."
            Your role is to engage in a real-time voice conversation to audit the user's reasoning about French institutions and laws.
            BEHAVIOR:
            1. Listen to their explanation.
            2. Gently correct logical gaps (e.g., confusing 'rights' with 'duties').
            3. Use a professional, encouraging, and authoritative tone.
            4. If they are silent, provide a brief institutional scenario for them to analyze.
          `,
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Start Session Error:", e);
      setPermissionError(true);
      setStatus("Microphone Blocked");
    }
  };

  useEffect(() => { 
    startSession(); 
    return () => { 
      sessionRef.current?.close(); 
      sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    }; 
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-3xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95">
      <div className="max-w-3xl w-full bg-slate-900 rounded-[40px] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]">
        <div className="p-8 sm:p-12 text-center">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-rose-500 animate-pulse' : 'bg-slate-700'}`}></div>
               <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
                {isActive ? 'Auditor Listening' : 'System Boot'}
               </span>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {permissionError ? (
            <div className="py-12 px-8 bg-rose-500/5 border border-rose-500/20 rounded-[32px] mb-8">
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Microphone Blocked</h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">To audit your reasoning, we need to hear your voice. Please enable microphone access in your browser settings and try again.</p>
              <button 
                onClick={startSession} 
                className="px-12 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-all shadow-2xl shadow-rose-500/10"
              >
                Retry Logic Connection
              </button>
            </div>
          ) : (
            <>
              <div className="mb-12 flex justify-center">
                <div className="flex items-end gap-2 h-24">
                  {[...Array(24)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 bg-indigo-500 rounded-full transition-all duration-300 ${isActive ? 'animate-bounce' : 'opacity-20'}`} 
                      style={{ 
                        animationDelay: `${i * 0.05}s`, 
                        height: isActive ? `${20 + Math.random() * 80}%` : '10%',
                        opacity: isActive ? 0.3 + (i / 24) * 0.7 : 0.1
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Live Logic Clinic</h2>
              <p className="text-indigo-400 font-bold uppercase tracking-[0.4em] text-[10px] mb-12">{status}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="bg-black/40 rounded-[32px] p-8 border border-white/5 min-h-[200px] flex flex-col">
                  <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-6">Translation & Reasoning Stream</p>
                  <div className="space-y-4 flex-grow">
                    {transcript.length === 0 ? (
                      <p className="text-slate-600 text-sm italic font-medium">Explain your reasoning for a civic scenario out loud...</p>
                    ) : (
                      transcript.map((line, i) => (
                        <div key={i} className={`p-3 rounded-xl text-sm font-bold animate-in slide-in-from-left-2 ${line.startsWith('AI:') ? 'bg-indigo-500/10 text-indigo-300' : 'text-slate-300'}`}>
                          {line}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2 px-2">Try speaking these scenarios:</p>
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button 
                      key={i}
                      className="w-full text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all group"
                      onClick={() => { /* Could optionally send as text, but purpose is oral practice */ }}
                    >
                      <p className="text-slate-400 text-xs font-bold leading-relaxed group-hover:text-white transition-colors">"{prompt}"</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-12 pt-8 border-t border-white/5">
             <button 
               onClick={onClose} 
               className="w-full py-5 bg-transparent text-white/30 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.5em] hover:bg-rose-500/10 hover:text-rose-500 transition-all"
             >
              End Logic Audit
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClinic;
