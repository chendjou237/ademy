/**
 * Database Types
 * Shared type definitions for database entities across admin and mobile apps
 */

/**
 * User role types
 */
export type UserRole = 'admin' | 'trainer' | 'learner';

/**
 * Course difficulty levels
 */
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Video processing status
 */
export type VideoStatus = 'queued' | 'processing' | 'encoding' | 'finished' | 'failed';

export type QuizQuestionType = 'single' | 'multiple' | 'true_false';

/**
 * Payment status types
 */
export type PaymentStatus = 'FREE' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

/**
 * Payment transaction status
 */
export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

/**
 * Cashout request status
 */
export type CashoutStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';

/**
 * User Profile
 */
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  phone_number?: string;
  mobile_money_provider?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Course
 */
export interface Course {
  id: string;
  trainer_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  price: number;
  category?: string;
  level?: CourseLevel;
  is_published: boolean;
  is_free: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  profiles?: Profile;
  lessons?: Lesson[];
  enrollments?: Enrollment[];
}

/**
 * Lesson
 */
export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  bunny_video_id?: string;
  bunny_library_id?: string;
  video_status?: VideoStatus;
  thumbnail_url?: string;
  duration_minutes?: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  course?: Course;
}

export interface Quiz {
  id: string;
  course_id: string;
  lesson_id?: string | null;
  title: string;
  instructions?: string;
  pass_percent: number;
  time_limit_minutes?: number | null;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  type: QuizQuestionType;
  prompt: string;
  options?: any;
  correct_answer?: any;
  points: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  learner_id: string;
  score: number;
  total_points: number;
  passed: boolean;
  submitted_at: string;
}

export interface QuizAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer?: any;
  is_correct: boolean;
}

/**
 * Enrollment
 */
export interface Enrollment {
  id: string;
  learner_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  payment_transaction_id?: string;
  payment_status: PaymentStatus;
  // Relations
  course?: Course;
  learner?: Profile;
  lesson_progress?: LessonProgress[];
  payment_transaction?: PaymentTransaction;
}

/**
 * Lesson Progress
 */
export interface LessonProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  // Relations
  enrollment?: Enrollment;
  lesson?: Lesson;
}

/**
 * Payment Transaction
 */
export interface PaymentTransaction {
  id: string;
  enrollment_id?: string;
  course_id: string;
  learner_id: string;
  trainer_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  payment_method?: string;
  payunit_transaction_url?: string;
  payunit_response?: any;
  created_at: string;
  updated_at: string;
  // Relations
  course?: Course;
  learner?: Profile;
  trainer?: Profile;
  enrollment?: Enrollment;
}

/**
 * Cashout Request
 */
export interface CashoutRequest {
  id: string;
  trainer_id: string;
  amount: number;
  currency: string;
  status: CashoutStatus;
  provider?: string;
  phone_number?: string;
  note?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  processed_by?: string;
  // Relations
  trainer?: Profile;
  processed_by_profile?: Profile;
}

/**
 * Database Tables
 * Type-safe table names
 */
export const Tables = {
  PROFILES: 'profiles',
  COURSES: 'courses',
  LESSONS: 'lessons',
  QUIZZES: 'quizzes',
  QUIZ_QUESTIONS: 'quiz_questions',
  QUIZ_ATTEMPTS: 'quiz_attempts',
  QUIZ_ANSWERS: 'quiz_answers',
  ENROLLMENTS: 'enrollments',
  LESSON_PROGRESS: 'lesson_progress',
  PAYMENT_TRANSACTIONS: 'payment_transactions',
  CASHOUT_REQUESTS: 'cashout_requests',
} as const;

export type TableName = typeof Tables[keyof typeof Tables];
