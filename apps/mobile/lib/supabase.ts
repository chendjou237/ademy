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

// Re-export types from shared package
export type {
    Course, CourseLevel, Enrollment, Lesson, LessonProgress, Profile, UserRole, VideoStatus
} from '@repo/types';
