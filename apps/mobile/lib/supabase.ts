import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://etmlikguxhfznxmfjplx.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0bWxpa2d1eGhmem54bWZqcGx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDExMTUsImV4cCI6MjA3NzU3NzExNX0.XuFFuNI-aI80YJknUCCPiy1SI6J-fjS28pBgH-BGj1g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  role: 'trainer' | 'learner';
  avatar_url?: string;
  bio?: string;
  phone_number?: string;
  mobile_money_provider?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  trainer_id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  price: number;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  lessons?: Lesson[];
  enrollments?: Enrollment[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  video_url?: string;
  bunny_video_id?: string;
  bunny_library_id?: string;
  video_status?: string;
  thumbnail_url?: string;
  duration_minutes?: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  learner_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  course?: Course;
  lesson_progress?: LessonProgress[];
}

export interface LessonProgress {
  id: string;
  enrollment_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
}
