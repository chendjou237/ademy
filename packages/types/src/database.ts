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

/**
 * Enrollment
 */
export interface Enrollment {
  id: string;
  learner_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  // Relations
  course?: Course;
  learner?: Profile;
  lesson_progress?: LessonProgress[];
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
 * Database Tables
 * Type-safe table names
 */
export const Tables = {
  PROFILES: 'profiles',
  COURSES: 'courses',
  LESSONS: 'lessons',
  ENROLLMENTS: 'enrollments',
  LESSON_PROGRESS: 'lesson_progress',
} as const;

export type TableName = typeof Tables[keyof typeof Tables];
