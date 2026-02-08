
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
    setStatus("Establishing Secure Link...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      
      audioCtxRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus("Auditor Online");
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
              sessionPromise.then(s => {
                s.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-3), `Auditor: ${msg.serverContent!.outputTranscription!.text}`]);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev.slice(-3), `You: ${msg.serverContent!.inputTranscription!.text}`]);
            }
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const audio = decode(msg.serverContent.modelTurn.parts[0].inlineData.data);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(audio, outputCtx, 24000);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => { setStatus("Error: Link Terminated"); setIsActive(false); },
          onclose: () => { setIsActive(false); setStatus("Session Closed"); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are the Civic Auditor. Engage in real-time oral legal review. Be firm, professional, and helpful.`,
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      setPermissionError(true);
      setStatus("Microphone Access Required");
    }
  };

  useEffect(() => { startSession(); return () => { sessionRef.current?.close(); }; }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in-95">
      <div className="max-w-4xl w-full bg-white rounded-[2.5rem] sm:rounded-[3rem] border border-slate-200 card-shadow overflow-hidden max-h-[95vh] flex flex-col">
        <div className="p-8 sm:p-14 text-center overflow-y-auto custom-scrollbar flex-grow">
          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-slate-200'}`}></div>
               <span className="text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest">{isActive ? 'SECURE AUDIO ACTIVE' : 'SYSTEM OFFLINE'}</span>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="mb-8 sm:mb-12 flex justify-center h-16 sm:h-20 items-end gap-1 sm:gap-1.5 px-4 sm:px-12">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className={`w-1 sm:w-1.5 bg-blue-600 rounded-full transition-all duration-300 ${isActive ? 'opacity-80' : 'opacity-10'}`} 
                style={{ height: isActive ? `${15 + Math.random() * 85}%` : '10%' }}
              ></div>
            ))}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight">Institutional Oral Clinic</h2>
          <p className="text-blue-600 font-mono font-bold uppercase tracking-[0.3em] text-[10px] mb-8 sm:mb-12">{status}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-left">
            <div className="bg-slate-50 rounded-[2rem] p-6 sm:p-8 border border-slate-100 min-h-[200px] flex flex-col">
              <p className="text-slate-400 text-[9px] font-mono font-bold uppercase tracking-widest mb-6">Translation Stream</p>
              <div className="space-y-4 flex-grow">
                {transcript.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">Awaiting oral input for institutional review...</p>
                ) : (
                  transcript.map((line, i) => (
                    <div key={i} className={`p-4 rounded-xl text-xs font-bold ${line.startsWith('Auditor:') ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700'}`}>
                      {line}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-slate-400 text-[9px] font-mono font-bold uppercase tracking-widest mb-2 px-1">Case Scenarios:</p>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button key={i} className="w-full text-left p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-400 hover:bg-white transition-all group">
                  <p className="text-slate-600 text-xs font-bold leading-relaxed group-hover:text-blue-700">"{prompt}"</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 sm:mt-12 pt-8 border-t border-slate-50">
             <button onClick={onClose} className="w-full py-5 bg-white text-slate-400 border border-slate-200 rounded-2xl font-bold text-[10px] uppercase tracking-[0.4em] hover:text-rose-600 hover:border-rose-200 transition-all">Disconnect Logic Link</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveClinic;
