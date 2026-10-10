export type Category = 'beginner' | 'intermediate' | 'advanced';

export interface Badge {
  key: string;
  label: string;
  earnedAt?: string;
}

export interface SubscriptionStatus {
  active: boolean;
  expiresAt: string | null;
  daysRemaining: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  authProvider?: 'local' | 'google';
  licenseClassGoal: string;
  streakCount: number;
  longestStreak: number;
  totalPoints: number;
  badges: Badge[];
  subscription?: SubscriptionStatus;
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
  lockReason?: 'prerequisite' | 'subscription' | null;
  isFree?: boolean;
}

export interface SubscriptionConfig {
  priceGHS: number;
  periodDays: number;
  currency: string;
}

export interface PaymentHistoryItem {
  _id: string;
  amountGHS: number;
  currency: string;
  method: 'paystack' | 'manual';
  status: 'pending' | 'success' | 'failed';
  periodStart?: string;
  periodEnd?: string;
  note?: string;
  createdAt: string;
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
