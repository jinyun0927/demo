
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

export interface AIReasoning {
  explanation: string;
  conceptualTrap: string;
  testedPrinciple: string;
  learnerPerspective?: string;
  misleadingLanguage?: string;
  // Added patternAnalysis to fix "Property 'patternAnalysis' does not exist on type 'AIReasoning'" error
  patternAnalysis?: string;
}

export interface WeakArea {
  area: string;
  evidenceQuestionIds: number[];
  description: string;
}

export interface SessionAnalysis {
  overallAssessment: string;
  weakAreas: WeakArea[];
  errorPatterns: string;
  recommendedFocus: string;
  nextPractice: Question;
}

export enum ViewMode {
  LEARN = 'LEARN',
  ANALYSIS = 'ANALYSIS',
}