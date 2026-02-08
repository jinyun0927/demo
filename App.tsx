
import React, { useState } from 'react';
import { QUESTIONS as STATIC_QUESTIONS } from './data';
import { UserAttempt, AIReasoning, ViewMode, Question, SessionAnalysis } from './types';
import QuestionCard from './components/QuestionCard';
import ReasoningPanel from './components/ReasoningPanel';
import SessionAnalysisPanel from './components/SessionAnalysisPanel';
import LiveClinic from './components/LiveClinic';
import { analyzeQuestion, analyzeSession, generateTargetedQuestions } from './services/geminiService';

const App: React.FC = () => {
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(STATIC_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [reasoning, setReasoning] = useState<AIReasoning | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LEARN);
  const [sessionAnalysis, setSessionAnalysis] = useState<SessionAnalysis | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [showLiveClinic, setShowLiveClinic] = useState(false);
  const [isEnglishMode, setIsEnglishMode] = useState(true);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const isSelected = selectedOptionId !== null;
  const isCorrect = selectedOptionId === currentQuestion?.correctOptionId;
  const isLastQuestion = currentQuestionIndex === activeQuestions.length - 1;

  const handleAnalyseQuestion = async () => {
    if (!selectedOptionId || !currentQuestion) return;
    setIsLoadingReasoning(true);
    try {
      const { reasoning: result, sources: resultSources } = await analyzeQuestion(currentQuestion, selectedOptionId);
      setReasoning(result);
      if (resultSources) setSources(resultSources);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReasoning(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setReasoning(null);
      setSources([]);
    }
  };

  const handleFinishSession = async () => {
    setIsLoadingSession(true);
    try {
      await new Promise(r => setTimeout(r, 1200)); 
      const result = await analyzeSession(activeQuestions, attempts);
      setSessionAnalysis(result);
      setViewMode(ViewMode.ANALYSIS);
    } catch (err) {
      setViewMode(ViewMode.ANALYSIS);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const resetSession = () => {
    setActiveQuestions(STATIC_QUESTIONS);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setReasoning(null);
    setSources([]);
    setAttempts([]);
    setSessionAnalysis(null);
    setViewMode(ViewMode.LEARN);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f8fafc]">
      {showLiveClinic && <LiveClinic onClose={() => setShowLiveClinic(false)} />}
      
      <header className="z-[55] glass-effect px-4 sm:px-6 shrink-0 border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" /></svg>
              </div>
              <h1 className="hidden sm:block text-[14px] font-black uppercase tracking-tighter text-slate-900">CivicMind <span className="text-blue-600">Auditor</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Logic: Active</span>
             </div>
             <button onClick={() => setShowLiveClinic(true)} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95">Live Clinic</button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 lg:p-8 overflow-hidden relative">
        {isLoadingSession && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white animate-in fade-in duration-500">
             <div className="relative mb-8">
                <div className="w-20 h-20 border-8 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 w-20 h-20 border-t-8 border-blue-600 rounded-full animate-spin"></div>
             </div>
             <p className="text-[12px] font-black text-slate-900 uppercase tracking-[0.5em] mb-2">Compiling Case Audit...</p>
          </div>
        )}

        {!isLoadingSession && viewMode === ViewMode.LEARN && currentQuestion && (
          <div className="max-w-[1550px] w-full mx-auto flex flex-col lg:flex-row gap-6 lg:gap-8 h-full max-h-[850px] overflow-hidden">
            <div className={`flex flex-col h-full dashboard-card overflow-hidden transition-all duration-700 ease-in-out border-slate-200/60 ${reasoning || isLoadingReasoning ? 'w-full lg:w-[50%]' : 'w-full max-w-2xl mx-auto shadow-2xl shadow-slate-200'}`}>
              <div className="flex-grow overflow-y-auto custom-scrollbar p-6 sm:p-10 lg:p-14">
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
                  compact={!!reasoning || isLoadingReasoning}
                />
              </div>

              {isSelected && (
                <div className="shrink-0 p-5 sm:p-6 lg:p-8 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-lg shadow-lg ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                      {isCorrect ? '✓' : '✕'}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`font-black uppercase text-[10px] sm:text-[11px] tracking-widest ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>{isCorrect ? 'Audit Validated' : 'Audit Variance'}</p>
                      <p className="text-slate-400 text-[9px] font-bold font-mono">HASH: CIV-0{currentQuestion.id}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-4">
                    {!reasoning && !isLoadingReasoning && (
                      <button onClick={handleAnalyseQuestion} className="px-4 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all active:scale-95">Audit Reason</button>
                    )}
                    <button 
                      onClick={isLastQuestion ? handleFinishSession : handleNext} 
                      className="px-4 sm:px-8 py-3 sm:py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                    >
                      {isLastQuestion ? 'Final Report' : 'Next Case'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {(reasoning || isLoadingReasoning) && (
              <div className="flex-grow animate-in slide-in-from-right-10 duration-700 h-full overflow-hidden">
                <ReasoningPanel reasoning={reasoning} isLoading={isLoadingReasoning} currentQuestion={currentQuestion} sources={sources} />
              </div>
            )}
          </div>
        )}

        {!isLoadingSession && viewMode === ViewMode.ANALYSIS && sessionAnalysis && (
          <div className="w-full h-full overflow-y-auto custom-scrollbar px-4 pt-4 pb-20">
            <SessionAnalysisPanel analysis={sessionAnalysis} onReset={resetSession} onStartTargetedChallenge={async () => {
                setIsLoadingSession(true);
                try {
                  const tq = await generateTargetedQuestions(sessionAnalysis);
                  if (tq && tq.length > 0) {
                    setActiveQuestions(tq);
                    setCurrentQuestionIndex(0);
                    setSelectedOptionId(null);
                    setReasoning(null);
                    setSources([]);
                    setAttempts([]);
                    setViewMode(ViewMode.LEARN);
                  }
                } finally { setIsLoadingSession(false); }
              }}
            />
          </div>
        )}
      </main>

      {viewMode === ViewMode.LEARN && !isLoadingSession && (
        <footer className="px-6 py-4 shrink-0 flex justify-center bg-transparent">
          <div className="flex gap-2.5">
              {activeQuestions.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${i === currentQuestionIndex ? 'w-10 bg-blue-600 shadow-lg' : i < currentQuestionIndex ? 'w-4 bg-blue-200' : 'w-4 bg-slate-200'}`}></div>
              ))}
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
