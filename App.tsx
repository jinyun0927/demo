
import React, { useState, useEffect } from 'react';
import { QUESTIONS as STATIC_QUESTIONS } from './data';
import { UserAttempt, AIReasoning, ViewMode, SessionAnalysis, Question, SessionType } from './types';
import QuestionCard from './components/QuestionCard';
import ReasoningPanel from './components/ReasoningPanel';
import SessionAnalysisPanel from './components/SessionAnalysisPanel';
import LiveClinic from './components/LiveClinic';
import SideDrawer from './components/SideDrawer';
import { analyzeQuestion, analyzeSession, generateTargetedQuestions, getEngineStatus, setMockMode } from './services/geminiService';

const App: React.FC = () => {
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(STATIC_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionType, setSessionType] = useState<SessionType>('BASELINE');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [reasoning, setReasoning] = useState<AIReasoning | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [cumulativeSources, setCumulativeSources] = useState<any[]>([]);
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LEARN);
  const [sessionAnalysis, setSessionAnalysis] = useState<SessionAnalysis | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [showLiveClinic, setShowLiveClinic] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'JURISPRUDENCE' | 'HISTORY' | 'ENGINE' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState(getEngineStatus());
  // Set default to true for judges
  const [isEnglishMode, setIsEnglishMode] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setEngineStatus(getEngineStatus());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const isSelected = selectedOptionId !== null;
  const isCorrect = selectedOptionId === currentQuestion?.correctOptionId;

  const handleAnalyseQuestion = async () => {
    if (!selectedOptionId || !currentQuestion) return;
    setIsLoadingReasoning(true);
    setError(null);
    try {
      const { reasoning: result, sources: resultSources } = await analyzeQuestion(currentQuestion, selectedOptionId);
      setReasoning(result);
      if (resultSources) {
        setSources(resultSources);
        setCumulativeSources(prev => {
          const newSources = resultSources.filter(s => !prev.some(p => p.web?.uri === s.web?.uri));
          return [...prev, ...newSources];
        });
      }
    } catch (err: any) {
      console.error(err);
      setError("Institutional reasoning failed to ground.");
    } finally {
      setIsLoadingReasoning(false);
      setEngineStatus(getEngineStatus());
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setReasoning(null);
      setSources([]);
      setError(null);
    }
  };

  const resetToFirstQuestion = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setReasoning(null);
    setSources([]);
    setError(null);
  };

  // Helper to find question details for logs
  const getQuestionById = (id: number) => {
    return [...STATIC_QUESTIONS, ...activeQuestions].find(q => q.id === id);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 font-sans tracking-tight">
      {showLiveClinic && <LiveClinic onClose={() => setShowLiveClinic(false)} />}
      
      <SideDrawer 
        isOpen={activeDrawer === 'ENGINE'} 
        onClose={() => setActiveDrawer(null)}
        title="Institutional Engine Dashboard"
        subtitle="AI Hardware & Logic Control"
      >
        <div className="space-y-8">
          <div className={`p-6 rounded-3xl border ${engineStatus.isQuotaExhausted ? 'bg-rose-500/10 border-rose-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Live API Status</p>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${engineStatus.isQuotaExhausted ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
              <p className="font-bold text-sm">{engineStatus.isQuotaExhausted ? 'Rate Limit Reached (429)' : 'System Optimal'}</p>
            </div>
            {engineStatus.isQuotaExhausted && (
              <p className="text-[11px] text-white/40 mt-4 leading-relaxed font-medium">Multiple judges are currently auditing. The system has automatically activated the <span className="text-rose-400">Elastic Simulation Layer</span> to prevent service interruption.</p>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Manual Control</p>
            <button 
              onClick={() => {
                setMockMode(!engineStatus.useMockMode);
                setEngineStatus(getEngineStatus());
              }}
              className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all ${!engineStatus.useMockMode ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-white/5 border-white/5 text-white/40'}`}
            >
              <div className="text-left">
                <p className="font-black text-xs uppercase tracking-widest mb-1">Live Engine</p>
                <p className="text-[10px] opacity-60">Connect to Gemini 3 Pro</p>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-all ${!engineStatus.useMockMode ? 'bg-white/20' : 'bg-white/5'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${!engineStatus.useMockMode ? 'left-5' : 'left-1'}`}></div>
              </div>
            </button>
            <button 
              onClick={() => {
                setMockMode(true);
                setEngineStatus(getEngineStatus());
              }}
              className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all ${engineStatus.useMockMode ? 'bg-amber-600 border-amber-400 text-white' : 'bg-white/5 border-white/5 text-white/40'}`}
            >
              <div className="text-left">
                <p className="font-black text-xs uppercase tracking-widest mb-1">Logic Simulation</p>
                <p className="text-[10px] opacity-60">Local Latency-Free Audit</p>
              </div>
              {engineStatus.useMockMode && <span className="text-[10px] font-black uppercase">Active</span>}
            </button>
          </div>
        </div>
      </SideDrawer>

      <SideDrawer 
        isOpen={activeDrawer === 'JURISPRUDENCE'} 
        onClose={() => setActiveDrawer(null)}
        title="Institutional Jurisprudence"
        subtitle="Live search-grounded legal database"
      >
        <div className="space-y-6">
          {cumulativeSources.length === 0 ? (
            <div className="py-12 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No verified sources cached yet.</div>
          ) : (
            cumulativeSources.map((source, i) => (
              <a key={i} href={source.web?.uri} target="_blank" className="block p-5 bg-white/5 border border-white/5 rounded-2xl hover:border-indigo-500/50 transition-all group">
                <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-2">Grounding Node {i+1}</p>
                <h4 className="text-white font-bold text-sm mb-2 group-hover:text-indigo-300 transition-colors">{source.web?.title}</h4>
                <p className="text-white/30 text-[10px] truncate font-mono">{source.web?.uri}</p>
              </a>
            ))
          )}
        </div>
      </SideDrawer>

      <SideDrawer 
        isOpen={activeDrawer === 'HISTORY'} 
        onClose={() => setActiveDrawer(null)}
        title="Audit Logs"
        subtitle="Session Attempt History"
      >
        <div className="space-y-6">
          {attempts.length === 0 ? (
            <div className="py-12 text-center text-white/20 text-xs font-bold uppercase tracking-widest">No audit logs recorded in this session.</div>
          ) : (
            [...attempts].reverse().map((attempt, i) => {
              const q = getQuestionById(attempt.questionId);
              return (
                <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">{q?.category || 'General Audit'}</p>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${attempt.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {attempt.isCorrect ? 'Correct' : 'Variance'}
                    </span>
                  </div>
                  <h4 className="text-white/80 font-bold text-[13px] mb-4 leading-snug line-clamp-2">
                    {isEnglishMode ? q?.text_en : q?.text}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-white/20">Selected:</span>
                    <span className="text-[10px] font-bold text-white/60 truncate">{attempt.selectedOptionId.toUpperCase()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SideDrawer>

      <header className="border-b border-white/5 sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.312-2.841.872-4.084" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase">CivicMind <span className="text-white/20">Auditor</span></h1>
              <button 
                onClick={() => setActiveDrawer('ENGINE')}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${engineStatus.useMockMode ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span className="text-[8px] text-white/40 font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                  Engine: {engineStatus.useMockMode ? 'Simulation' : 'Live Pro'}
                </span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-8">
              <button onClick={() => setActiveDrawer('JURISPRUDENCE')} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Jurisprudence</button>
              <button onClick={() => setActiveDrawer('HISTORY')} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">Audit Logs</button>
            </nav>
            <button onClick={() => setShowLiveClinic(true)} className="px-5 py-2.5 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">Open Clinic</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {isLoadingSession && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Synthesizing Remediation Path</h3>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Identifying logic gaps from previous session...</p>
          </div>
        )}

        {viewMode === ViewMode.LEARN && currentQuestion ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className={`col-span-1 transition-all duration-700 ${reasoning || isLoadingReasoning || error ? 'lg:col-span-7' : 'lg:col-span-8 lg:col-start-3'}`}>
              <div className="space-y-12">
                <div className="flex justify-between items-end px-2">
                  <div className="space-y-2">
                    <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">
                      {sessionType === 'BASELINE' ? 'Diagnostic Session' : 'Repair Session'}
                    </p>
                    <h2 className="text-xl font-black">{currentQuestion.category}</h2>
                  </div>
                  <div className="flex gap-2">
                    {activeQuestions.map((_, i) => (
                      <div key={i} className={`h-1 w-8 rounded-full transition-all duration-700 ${i === currentQuestionIndex ? 'bg-white' : i < currentQuestionIndex ? 'bg-white/40' : 'bg-white/5'}`} />
                    ))}
                  </div>
                </div>

                <QuestionCard 
                  question={currentQuestion}
                  selectedId={selectedOptionId}
                  onSelect={(id) => {
                    if (isSelected) return;
                    setSelectedOptionId(id);
                    setAttempts(prev => [...prev, { questionId: currentQuestion.id, selectedOptionId: id, isCorrect: id === currentQuestion.correctOptionId, timestamp: Date.now() }]);
                  }}
                  disabled={isSelected}
                  isEnglishMode={isEnglishMode}
                  onToggleLanguage={() => setIsEnglishMode(!isEnglishMode)}
                />

                {isSelected && (
                  <div className="flex flex-col sm:flex-row gap-6 animate-in slide-in-from-bottom-8">
                    <div className={`flex-grow p-8 rounded-3xl border flex items-center gap-8 ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {isCorrect ? '✓' : '✕'}
                      </div>
                      <div>
                        <p className={`font-black uppercase tracking-widest text-[11px] mb-1 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isCorrect ? 'Logical Alignment' : 'Systemic Variance'}
                        </p>
                        <p className="text-white/40 text-[13px] font-bold">{isCorrect ? 'Valid reasoning path detected.' : 'The selected logic conflicts with institutional law.'}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {!reasoning && !isLoadingReasoning && (
                        <button onClick={handleAnalyseQuestion} className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all">Deep Audit</button>
                      )}
                      <button 
                        onClick={currentQuestionIndex === activeQuestions.length - 1 ? async () => {
                          setIsLoadingSession(true);
                          const res = await analyzeSession(activeQuestions, attempts);
                          setSessionAnalysis(res);
                          setViewMode(ViewMode.ANALYSIS);
                          setIsLoadingSession(false);
                        } : handleNext} 
                        className="px-10 py-5 bg-white/5 text-white/60 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all"
                      >
                        {currentQuestionIndex === activeQuestions.length - 1 ? 'Report Generation' : 'Next Scenario'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {(reasoning || isLoadingReasoning || error) && (
              <div className="col-span-1 lg:col-span-5 animate-in fade-in slide-in-from-right-12 sticky top-32">
                <ReasoningPanel reasoning={reasoning} isLoading={isLoadingReasoning} currentQuestion={currentQuestion} sources={sources} />
              </div>
            )}
          </div>
        ) : (
          <SessionAnalysisPanel 
            analysis={sessionAnalysis!} 
            onReset={() => { 
              setActiveQuestions(STATIC_QUESTIONS);
              setSessionType('BASELINE');
              setViewMode(ViewMode.LEARN); 
              setAttempts([]); 
              resetToFirstQuestion();
            }} 
            onStartTargetedChallenge={async () => {
              setIsLoadingSession(true);
              try {
                const tq = await generateTargetedQuestions(sessionAnalysis!);
                if (tq && tq.length > 0) {
                  setActiveQuestions(tq);
                  setSessionType('TARGETED');
                  setAttempts([]); 
                  resetToFirstQuestion();
                  setViewMode(ViewMode.LEARN);
                } else {
                  console.error("No targeted questions generated");
                }
              } catch (err) {
                console.error("Failed to generate targeted session", err);
              } finally {
                setIsLoadingSession(false);
              }
            }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
