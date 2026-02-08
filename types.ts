
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
  imageUrl?: string; // Pre-stored or generated image URL
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
  learnerPerspective?: string;
  misleadingLanguage?: string;
  patternAnalysis?: string;
  visualAid?: string; // Generated image specifically for reasoning
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

export interface SessionAnalysis {
  overallAssessment?: string;
  weakAreas?: WeakArea[];
  errorPatterns?: string;
  recommendedFocus?: string;
  mastery?: MasteryValidation;
  isPerfect: boolean;
  targetedQuestions?: Question[];
}

export enum ViewMode {
  LEARN = 'LEARN',
  ANALYSIS = 'ANALYSIS',
  RETEST = 'RETEST'
}
