
import React, { useState } from 'react';
import { QUESTIONS as STATIC_QUESTIONS } from './data';
import { UserAttempt, AIReasoning, ViewMode, SessionAnalysis, Question } from './types';
import QuestionCard from './components/QuestionCard';
import ReasoningPanel from './components/ReasoningPanel';
import SessionAnalysisPanel from './components/SessionAnalysisPanel';
import { analyzeQuestion, analyzeSession, generateTargetedQuestions } from './services/geminiService';

const App: React.FC = () => {
  const [activeQuestions, setActiveQuestions] = useState<Question[]>(STATIC_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [reasoning, setReasoning] = useState<AIReasoning | null>(null);
  const [isLoadingReasoning, setIsLoadingReasoning] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LEARN);
  const [sessionAnalysis, setSessionAnalysis] = useState<SessionAnalysis | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isRetestMode, setIsRetestMode] = useState(false);

  const currentQuestion = activeQuestions[currentQuestionIndex];
  const isSelected = selectedOptionId !== null;
  const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
  const isLastQuestion = currentQuestionIndex === activeQuestions.length - 1;

  const handleOptionSelect = (id: string) => {
    if (isSelected) return;
    setSelectedOptionId(id);
    setAttempts(prev => [...prev, {
      questionId: currentQuestion.id,
      selectedOptionId: id,
      isCorrect: id === currentQuestion.correctOptionId,
      timestamp: Date.now(),
    }]);
  };

  const handleAnalyseQuestion = async () => {
    if (!selectedOptionId) return;
    setIsLoadingReasoning(true);
    setReasoning(null);
    try {
      const result = await analyzeQuestion(currentQuestion, selectedOptionId);
      setReasoning(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingReasoning(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setReasoning(null);
    }
  };

  const handleFinalAnalysis = async () => {
    setIsLoadingSession(true);
    try {
      const result = await analyzeSession(activeQuestions, attempts);
      setSessionAnalysis(result);
      setViewMode(ViewMode.ANALYSIS);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleStartTargetedChallenge = async () => {
    if (!sessionAnalysis) return;
    setIsLoadingSession(true);
    try {
      const targetedQuestions = await generateTargetedQuestions(sessionAnalysis);
      setActiveQuestions(targetedQuestions);
      setCurrentQuestionIndex(0);
      setSelectedOptionId(null);
      setReasoning(null);
      setAttempts([]);
      setIsRetestMode(true);
      setViewMode(ViewMode.LEARN);
    } catch (error) {
      console.error("Failed to generate targeted questions:", error);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleReset = () => {
    setActiveQuestions(STATIC_QUESTIONS);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setAttempts([]);
    setReasoning(null);
    setIsLoadingReasoning(false);
    setViewMode(ViewMode.LEARN);
    setSessionAnalysis(null);
    setIsLoadingSession(false);
    setIsRetestMode(false);
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-24 h-24 border-8 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-10"></div>
        <h2 className="text-4xl font-black mb-4 tracking-tighter uppercase">
          {viewMode === ViewMode.ANALYSIS && !isRetestMode ? "Generating Audit Report" : "Synthesizing Targeted Scenarios"}
        </h2>
        <p className="text-slate-500 font-bold max-w-md tracking-tight uppercase text-xs">
          Gemini 3 Pro is mapping institutional logic patterns and synthesizing personalized training...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl rotate-3 transition-colors ${isRetestMode ? 'bg-indigo-600' : 'bg-slate-900'}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <div onClick={handleReset} style={{cursor: 'pointer'}}>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none flex items-center gap-2">
                CIVICMIND <span className="text-indigo-600">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">
                {isRetestMode ? "Targeted Logic Retest" : "Institutional Reasoning Auditor"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden sm:inline-flex px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border transition-colors ${isRetestMode ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>
              {isRetestMode ? "Targeted Retest Active" : "Diagnostic Mode"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-12 w-full">
        {viewMode === ViewMode.LEARN ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center gap-2 mb-2">
                {activeQuestions.map((_, i) => (
                  <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-700 ${i === currentQuestionIndex ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : i < currentQuestionIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                ))}
              </div>

              <QuestionCard 
                question={currentQuestion}
                selectedId={selectedOptionId}
                onSelect={handleOptionSelect}
                disabled={isSelected}
              />

              {isSelected && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className={`flex-grow p-6 rounded-3xl border-2 flex items-center gap-6 ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-inner ${isCorrect ? 'bg-white text-emerald-600' : 'bg-white text-rose-600'}`}>
                      {isCorrect ? '✓' : '✕'}
                    </div>
                    <div>
                      <p className={`font-black text-xl ${isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>{isCorrect ? 'Logic Validated' : 'Reasoning Fault'}</p>
                      <p className="text-sm opacity-60 font-bold uppercase tracking-widest">Case Study Analysis Required</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleAnalyseQuestion}
                    disabled={isLoadingReasoning}
                    className="px-8 py-6 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-3 active:scale-95 shadow-2xl shadow-slate-200"
                  >
                    {isLoadingReasoning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                    Decode Logic
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-12 border-t border-slate-100">
                {!isLastQuestion ? (
                  <button onClick={handleNext} disabled={!isSelected} className={`px-12 py-5 rounded-3xl font-black text-lg transition-all ${isSelected ? 'bg-slate-900 text-white shadow-2xl hover:scale-105' : 'bg-slate-100 text-slate-300'}`}>Next Scenario</button>
                ) : (
                  <button onClick={handleFinalAnalysis} disabled={!isSelected} className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Submit Case Log</button>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              {reasoning || isLoadingReasoning ? (
                <ReasoningPanel 
                  reasoning={reasoning!} 
                  isLoading={isLoadingReasoning} 
                  currentQuestion={currentQuestion} 
                />
              ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center h-[500px] flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-8">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-4 tracking-tight">Audit Standby</h3>
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest leading-relaxed max-w-xs">Awaiting user response to initialize systemic logic audit...</p>
                </div>
              )}
            </div>
          </div>
        ) : sessionAnalysis ? (
          <SessionAnalysisPanel 
            analysis={sessionAnalysis} 
            onReset={handleReset} 
            onStartTargetedChallenge={handleStartTargetedChallenge}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
             <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
             <p className="text-slate-500 font-bold uppercase tracking-widest">Re-initializing Reasoning Engine...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
