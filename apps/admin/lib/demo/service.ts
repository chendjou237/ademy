/**
 * Demo Service for Admin App
 * Provides mock data services when DEMO_MODE is enabled
 */

import type { Course, Enrollment, Lesson, Profile } from '@repo/types';
import type { DashboardStats } from '@repo/types/api';
import {
    ALL_DEMO_USERS,
    DEMO_ADMIN_STATS,
    DEMO_COURSES,
    DEMO_ENROLLMENTS,
    DEMO_MODE,
    DEMO_TRAINER_STATS,
    DEMO_USERS,
    getDemoVideoUrl,
} from './data';

// Demo Authentication Service
export const demoAuthService = {
  signIn: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = Object.values(DEMO_USERS).find(u => u.email === email);
    if (user && password === 'demo123') {
      return { user: { id: user.id, email }, error: null };
    }
    return { user: null, error: { message: 'Invalid credentials' } };
  },

  getProfile: async (userId: string): Promise<Profile | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = Object.values(DEMO_USERS).find(u => u.id === userId);
    if (user) return user;

    return ALL_DEMO_USERS.find(u => u.id === userId) || null;
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    // In demo mode, just return success
    return { error: null };
  },

  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { error: null };
  },
};

// Demo Course Service
export const demoCourseService = {
  getCourses: async (): Promise<Course[]> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...DEMO_COURSES];
  },

  getCourseById: async (courseId: string): Promise<Course | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return DEMO_COURSES.find(course => course.id === courseId) || null;
  },

  getTrainerCourses: async (trainerId: string): Promise<Course[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return DEMO_COURSES.filter(course => course.trainer_id === trainerId);
  },

  createCourse: async (courseData: Partial<Course>) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: courseData.title || 'New Course',
      description: courseData.description,
      price: courseData.price || 0,
      category: courseData.category,
      level: courseData.level || 'beginner',
      is_published: false,
      is_free: courseData.is_free || false,
      certificate_enabled: courseData.certificate_enabled || false,
      certificate_signature_name: courseData.certificate_signature_name || null,
      certificate_signature_title: courseData.certificate_signature_title || null,
      trainer_id: courseData.trainer_id || 'demo-trainer-1',
      thumbnail_url: courseData.thumbnail_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lessons: [],
    };

    DEMO_COURSES.push(newCourse);
    return { data: newCourse, error: null };
  },

  updateCourse: async (courseId: string, updates: Partial<Course>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const courseIndex = DEMO_COURSES.findIndex(course => course.id === courseId);
    if (courseIndex !== -1) {
      DEMO_COURSES[courseIndex] = { ...DEMO_COURSES[courseIndex], ...updates };
      return { data: DEMO_COURSES[courseIndex], error: null };
    }
    return { data: null, error: { message: 'Course not found' } };
  },

  deleteCourse: async (courseId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const courseIndex = DEMO_COURSES.findIndex(course => course.id === courseId);
    if (courseIndex !== -1) {
      DEMO_COURSES.splice(courseIndex, 1);
      return { error: null };
    }
    return { error: { message: 'Course not found' } };
  },
};

// Demo Lesson Service
export const demoLessonService = {
  getLessonById: async (lessonId: string): Promise<Lesson | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    for (const course of DEMO_COURSES) {
      const lesson = course.lessons?.find(l => l.id === lessonId);
      if (lesson) {
        return {
          ...lesson,
          course: {
            ...course,
            profiles: course.profiles,
          },
        } as any;
      }
    }
    return null;
  },

  getCourseLessons: async (courseId: string): Promise<Lesson[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const course = DEMO_COURSES.find(c => c.id === courseId);
    return course?.lessons || [];
  },

  createLesson: async (courseId: string, lessonData: Partial<Lesson>) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const course = DEMO_COURSES.find(c => c.id === courseId);
    if (course) {
      const newLesson: Lesson = {
        id: `lesson-${Date.now()}`,
        title: lessonData.title || 'New Lesson',
        description: lessonData.description,
        video_url: lessonData.video_url,
        bunny_video_id: lessonData.bunny_video_id,
        bunny_library_id: lessonData.bunny_library_id,
        video_status: lessonData.video_status || 'queued',
        thumbnail_url: lessonData.thumbnail_url,
        duration_minutes: lessonData.duration_minutes,
        order_index: (course.lessons?.length || 0) + 1,
        is_free: lessonData.is_free || false,
        course_id: courseId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (!course.lessons) course.lessons = [];
      course.lessons.push(newLesson);

      return { data: newLesson, error: null };
    }
    return { data: null, error: { message: 'Course not found' } };
  },

  updateLesson: async (lessonId: string, updates: Partial<Lesson>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    for (const course of DEMO_COURSES) {
      const lessonIndex = course.lessons?.findIndex(l => l.id === lessonId);
      if (lessonIndex !== undefined && lessonIndex !== -1 && course.lessons) {
        course.lessons[lessonIndex] = { ...course.lessons[lessonIndex], ...updates };
        return { data: course.lessons[lessonIndex], error: null };
      }
    }
    return { data: null, error: { message: 'Lesson not found' } };
  },

  deleteLesson: async (lessonId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    for (const course of DEMO_COURSES) {
      const lessonIndex = course.lessons?.findIndex(l => l.id === lessonId);
      if (lessonIndex !== undefined && lessonIndex !== -1 && course.lessons) {
        course.lessons.splice(lessonIndex, 1);
        return { error: null };
      }
    }
    return { error: { message: 'Lesson not found' } };
  },
};

// Demo Enrollment Service
export const demoEnrollmentService = {
  getAllEnrollments: async (): Promise<Enrollment[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return [...DEMO_ENROLLMENTS];
  },

  getEnrollments: async (learnerId: string): Promise<Enrollment[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return DEMO_ENROLLMENTS.filter(enrollment => enrollment.learner_id === learnerId);
  },

  getEnrollment: async (learnerId: string, courseId: string): Promise<Enrollment | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return DEMO_ENROLLMENTS.find(
      enrollment => enrollment.learner_id === learnerId && enrollment.course_id === courseId
    ) || null;
  },

  enrollInCourse: async (learnerId: string, courseId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const course = DEMO_COURSES.find(c => c.id === courseId);
    const learner = ALL_DEMO_USERS.find(u => u.id === learnerId);

    if (course && learner) {
      const newEnrollment: Enrollment = {
        id: `enrollment-${Date.now()}`,
        learner_id: learnerId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        progress: 0,
        course,
        learner,
        lesson_progress: [],
      };

      DEMO_ENROLLMENTS.push(newEnrollment);
      return { data: newEnrollment, error: null };
    }
    return { data: null, error: { message: 'Course or learner not found' } };
  },

  updateProgress: async (enrollmentId: string, lessonId: string, completed: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const enrollment = DEMO_ENROLLMENTS.find(e => e.id === enrollmentId);
    if (enrollment) {
      // Update lesson progress
      const existingProgress = enrollment.lesson_progress?.find(p => p.lesson_id === lessonId);
      if (existingProgress) {
        existingProgress.completed = completed;
        existingProgress.completed_at = completed ? new Date().toISOString() : undefined;
      } else if (completed) {
        if (!enrollment.lesson_progress) enrollment.lesson_progress = [];
        enrollment.lesson_progress.push({
          id: `progress-${Date.now()}`,
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }

      // Update overall progress
      const course = DEMO_COURSES.find(c => c.id === enrollment.course_id);
      if (course && course.lessons) {
        const completedLessons = enrollment.lesson_progress?.filter(p => p.completed).length || 0;
        enrollment.progress = Math.round((completedLessons / course.lessons.length) * 100);
      }

      return { error: null };
    }
    return { error: { message: 'Enrollment not found' } };
  },
};

// Demo User Service (Admin)
export const demoUserService = {
  getAllUsers: async (): Promise<Profile[]> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [...ALL_DEMO_USERS];
  },

  getUserById: async (userId: string): Promise<Profile | null> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return ALL_DEMO_USERS.find(u => u.id === userId) || null;
  },

  updateUser: async (userId: string, updates: Partial<Profile>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = ALL_DEMO_USERS.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      ALL_DEMO_USERS[userIndex] = { ...ALL_DEMO_USERS[userIndex], ...updates };
      return { data: ALL_DEMO_USERS[userIndex], error: null };
    }
    return { data: null, error: { message: 'User not found' } };
  },

  deleteUser: async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = ALL_DEMO_USERS.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      ALL_DEMO_USERS.splice(userIndex, 1);
      return { error: null };
    }
    return { error: { message: 'User not found' } };
  },
};

// Demo Stats Service
export const demoStatsService = {
  getTrainerStats: async (trainerId: string): Promise<DashboardStats> => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return DEMO_TRAINER_STATS;
  },

  getAdminStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return DEMO_ADMIN_STATS;
  },
};

// Demo Video Service
export const demoVideoService = {
  getVideoUrl: (videoId: string): string => {
    return getDemoVideoUrl(videoId || 'demo-video-1');
  },

  uploadVideo: async (file: File, title: string) => {
    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      videoId: `demo-video-${Date.now()}`,
      libraryId: '527238',
      status: 'finished' as const,
      error: null,
    };
  },

  getVideoStatus: async (videoId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      videoId,
      status: 'finished' as const,
      title: 'Demo Video',
      length: 300,
      thumbnailUrl: 'https://picsum.photos/seed/video-thumb/400/225',
    };
  },
};

// Main demo service checker
export const isDemoMode = () => DEMO_MODE;

// Export demo credentials
export { DEMO_CREDENTIALS } from './data';
