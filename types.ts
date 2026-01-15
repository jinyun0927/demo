
export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: number;
  category: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  context?: string;
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
}

export interface WeakArea {
  area: string;
  evidenceQuestionIds: number[];
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
  nextPractice?: Question;
  mastery?: MasteryValidation; // New field for perfect scores
  isPerfect: boolean;
}

export enum ViewMode {
  LEARN = 'LEARN',
  ANALYSIS = 'ANALYSIS',
}
