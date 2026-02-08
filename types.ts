
export interface Option {
  id: string;
  text: string;
  text_en?: string;
}

export interface Question {
  id: number;
  category: string;
  text: string;
  text_en?: string;
  options: Option[];
  correctOptionId: string;
  context?: string;
  imageUrl?: string;
}

export interface UserAttempt {
  questionId: number;
  selectedOptionId: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface VocabularyTerm {
  term: string;
  simpleDefinition: string;
}

export interface AIReasoning {
  explanation: string;
  simplifiedExplanation?: string;
  vocabulary?: VocabularyTerm[];
  conceptualTrap: string;
  testedPrinciple: string;
  thinkingSteps: string[];
  misleadingLanguage?: string;
}

export interface WeakArea {
  area: string;
  description: string;
}

export interface MasteryValidation {
  overall_validation: string;
  avoided_traps: string[];
  why_full_score_is_not_the_end: string;
  advanced_check: {
    scenario: string;
    question: string;
    options: Option[];
    correct: string;
    explanation: string;
  };
}

export type SessionTier = 'CRITICAL' | 'ALIGNED' | 'MASTERY';

export interface SessionAnalysis {
  overallAssessment?: string;
  weakAreas?: WeakArea[];
  errorPatterns?: string;
  recommendedFocus?: string;
  mastery?: MasteryValidation;
  isPerfect: boolean;
  scorePercentage: number;
  tier: SessionTier;
}

export enum ViewMode {
  LEARN = 'LEARN',
  ANALYSIS = 'ANALYSIS',
  RETEST = 'RETEST'
}

export type SessionType = 'BASELINE' | 'TARGETED';
