export type Category = 'beginner' | 'intermediate' | 'advanced';

export interface Badge {
  key: string;
  label: string;
  earnedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  licenseClassGoal: string;
  streakCount: number;
  longestStreak: number;
  totalPoints: number;
  badges: Badge[];
  createdAt?: string;
}

export interface LessonSection {
  heading: string;
  body: string;
}

export interface LessonProgress {
  bestScorePercent: number;
  attemptsCount: number;
  completed: boolean;
  completedAt?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  slug: string;
  category: Category;
  order: number;
  summary: string;
  objective: string;
  durationMinutes: number;
  videoScript: string;
  sections: LessonSection[];
  keyPoints: string[];
  commonMistakes: string[];
  dvlaRelevance: string;
  published: boolean;
  progress?: LessonProgress | null;
  locked?: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: string[];
  difficulty?: string;
  category?: string;
}

export interface AnswerResult {
  questionId: string;
  correct: boolean;
  correctIndex: number;
  explanation: string;
}

export interface Certificate {
  _id: string;
  serialNumber: string;
  licenseClassGoal: string;
  scorePercent: number;
  issuedAt: string;
}
