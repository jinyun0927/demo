
import React, { useState } from 'react';
import { QUESTIONS } from './data';
import { UserAttempt, AIReasoning, ViewMode, SessionAnalysis } from './types';
import QuestionCard from './components/QuestionCard';
import ReasoningPanel from './components/ReasoningPanel';
import SessionAnalysisPanel from './components/SessionAnalysisPanel';
import { analyzeQuestion, analyzeSession } from './services/geminiService';

const App: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [reasoning, setReasoning] = useState<AIReasoning | null>(null);
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LEARN);
  const [sessionAnalysis, setSessionAnalysis] = useState<SessionAnalysis | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isSelected = selectedOptionId !== null;
  const isCorrect = selectedOptionId === currentQuestion.correctOptionId;

  const handleOptionSelect = (id: string) => {
    if (isSelected) return; // Locked once selected
    setSelectedOptionId(id);
    
    // Track history
    const newAttempt: UserAttempt = {
      questionId: currentQuestion.id,
      selectedOptionId: id,
      isCorrect: id === currentQuestion.correctOptionId,
      timestamp: Date.now(),
    };
    setAttempts(prev => [...prev, newAttempt]);
  };

  const handleAnalyseQuestion = async () => {
    if (!selectedOptionId) return;
    setIsLoadingReasoning(true);
    setReasoning(null);
    try {
      const result = await analyzeQuestion(currentQuestion, selectedOptionId);
      setReasoning(result);
    } catch (error) {
      console.error("Individual analysis failed:", error);
      alert(`Oops! We couldn't analyze this question logic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingReasoning(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setReasoning(null);
    }
  };

  const handleFinalAnalysis = async () => {
    if (attempts.length === 0) {
      alert("Please complete at least one question first.");
      return;
    }
    
    setIsLoadingSession(true);
    try {
      // Small timeout to ensure the UI updates before the heavy AI call
      await new Promise(r => setTimeout(r, 100));
      const result = await analyzeSession(QUESTIONS, attempts);
      setSessionAnalysis(result);
      setViewMode(ViewMode.ANALYSIS);
    } catch (error) {
      console.error("Full session report failed:", error);
      alert(`Failed to generate the performance blueprint: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const resetProgress = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setAttempts([]);
    setReasoning(null);
    setSessionAnalysis(null);
    setViewMode(ViewMode.LEARN);
  };

  const isLastQuestion = currentQuestionIndex === QUESTIONS.length - 1;

  // Render a full-screen loader for the session analysis
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
        <div className="w-20 h-20 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-8"></div>
        <h2 className="text-3xl font-bold mb-4 animate-pulse">Synthesizing Performance Blueprint</h2>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          Gemini is analyzing your institutional logic gaps, identifying recurring distractor patterns, and generating targeted practice scenarios based on your reasoning history...
        </p>
        <div className="mt-12 flex gap-2">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none">CivicMind <span className="text-indigo-600">AI</span></h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reasoning Assistant</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="hidden sm:flex items-center px-3 py-1 bg-slate-100 rounded-full border border-slate-200">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mr-2">Session API</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 w-full flex-grow">
        {viewMode === ViewMode.LEARN ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Scenario {currentQuestionIndex + 1} of {QUESTIONS.length}</h3>
                  <div className="flex gap-1.5">
                    {QUESTIONS.map((_, idx) => (
                      <div key={idx} className={`h-2 w-8 rounded-full transition-all duration-500 ${idx === currentQuestionIndex ? 'bg-indigo-600 shadow-md shadow-indigo-100' : idx < currentQuestionIndex ? 'bg-green-500' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Type</p>
                   <p className="text-xs font-black text-indigo-700 uppercase tracking-tight">{currentQuestion.category}</p>
                </div>
              </div>

              <QuestionCard 
                question={currentQuestion}
                selectedId={selectedOptionId}
                onSelect={handleOptionSelect}
                disabled={isSelected}
              />

              {isSelected && (
                <div className={`p-5 rounded-2xl border-2 flex items-center justify-between animate-in slide-in-from-top-4 fade-in duration-500 ${isCorrect ? 'bg-green-50 border-green-200 text-green-900 shadow-lg shadow-green-50' : 'bg-red-50 border-red-200 text-red-900 shadow-lg shadow-red-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-inner ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {isCorrect ? '✓' : '✕'}
                    </div>
                    <div>
                      <p className="font-black text-lg">{isCorrect ? 'Excellent Logic' : 'Reasoning Gap'}</p>
                      <p className="text-sm opacity-80 font-medium">
                        {isCorrect ? 'You matched the institutional requirement.' : `Correct choice: ${currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId)?.text}`}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleAnalyseQuestion}
                    disabled={isLoadingReasoning}
                    className="px-5 py-2.5 bg-white text-slate-900 text-sm font-black rounded-xl border-2 border-slate-100 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2 group active:scale-95"
                  >
                    {isLoadingReasoning ? (
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    )}
                    {isLoadingReasoning ? 'Thinking...' : 'Audit Reasoning'}
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                {!isLastQuestion ? (
                  <button
                    onClick={handleNext}
                    disabled={!isSelected}
                    className={`px-10 py-4 rounded-2xl font-black text-lg transition-all active:scale-95 ${isSelected ? 'bg-slate-900 text-white hover:bg-black shadow-xl' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                  >
                    Next Case
                  </button>
                ) : (
                  <button
                    onClick={handleFinalAnalysis}
                    disabled={!isSelected || isLoadingSession}
                    className={`px-10 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 active:scale-95 shadow-2xl ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                  >
                    Analyse Weaknesses
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </button>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-24">
                {reasoning || isLoadingReasoning ? (
                  <ReasoningPanel reasoning={reasoning!} isLoading={isLoadingReasoning} />
                ) : (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 rotate-3">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                    </div>
                    <h3 className="text-slate-900 font-black text-xl mb-3">Institutional Auditor</h3>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-[240px] font-medium">
                      Select a choice to unlock the AI audit. We reveal the hidden linguistic traps and legal logic designed by examiners.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          sessionAnalysis && <SessionAnalysisPanel analysis={sessionAnalysis} onReset={resetProgress} />
        )}
      </main>

      <footer className="mt-12 text-center text-slate-400 text-xs py-8 border-t border-slate-100">
        <p className="font-black tracking-tighter uppercase mb-1">CivicMind AI Training Platform</p>
        <p>Built for logic decoding • Powered by Gemini Flash 3 Reasoning Hub</p>
      </footer>
    </div>
  );
};

export default App;
