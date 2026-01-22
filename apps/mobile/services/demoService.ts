import { DEMO_COURSES, DEMO_ENROLLMENTS, DEMO_MODE, DEMO_TRAINER_STATS, DEMO_USERS, getDemoVideoUrl } from '../config/demo';
import { Course, Enrollment, Lesson, Profile } from '../lib/supabase';

// Demo Authentication Service
export const demoAuthService = {
  signIn: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'trainer@demo.com' && password === 'demo123') {
      return { user: { id: DEMO_USERS.trainer.id, email }, error: null };
    } else if (email === 'learner@demo.com' && password === 'demo123') {
      return { user: { id: DEMO_USERS.learner.id, email }, error: null };
    } else {
      return { user: null, error: { message: 'Invalid credentials' } };
    }
  },

  getProfile: async (userId: string): Promise<Profile | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (userId === DEMO_USERS.trainer.id) {
      return DEMO_USERS.trainer;
    } else if (userId === DEMO_USERS.learner.id) {
      return DEMO_USERS.learner;
    }
    return null;
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
    return DEMO_COURSES;
  },

  getCourseById: async (courseId: string): Promise<Course | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return DEMO_COURSES.find(course => course.id === courseId) || null;
  },

  getTrainerCourses: async (trainerId: string): Promise<Course[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return DEMO_COURSES.filter(course => course.trainer_id === trainerId);
  },

  createCourse: async (courseData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newCourse = {
      id: `course-${Date.now()}`,
      ...courseData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lessons: [],
    };

    DEMO_COURSES.push(newCourse);
    return { data: newCourse, error: null };
  },

  updateCourse: async (courseId: string, updates: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const courseIndex = DEMO_COURSES.findIndex(course => course.id === courseId);
    if (courseIndex !== -1) {
      DEMO_COURSES[courseIndex] = { ...DEMO_COURSES[courseIndex], ...updates };
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

  addLesson: async (courseId: string, lessonData: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const course = DEMO_COURSES.find(c => c.id === courseId);
    if (course) {
      const newLesson = {
        id: `lesson-${Date.now()}`,
        ...lessonData,
        course_id: courseId,
        order_index: (course.lessons?.length || 0) + 1,
      };

      if (!course.lessons) course.lessons = [];
      course.lessons.push(newLesson);

      return { data: newLesson, error: null };
    }
    return { error: { message: 'Course not found' } };
  },
};

// Demo Enrollment Service
export const demoEnrollmentService = {
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
    if (course) {
      const newEnrollment = {
        id: `enrollment-${Date.now()}`,
        learner_id: learnerId,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        progress: 0,
        course,
        lesson_progress: [],
      };

      DEMO_ENROLLMENTS.push(newEnrollment);
      return { data: newEnrollment, error: null };
    }
    return { error: { message: 'Course not found' } };
  },

  updateProgress: async (enrollmentId: string, lessonId: string, completed: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const enrollment = DEMO_ENROLLMENTS.find(e => e.id === enrollmentId);
    if (enrollment) {
      // Update lesson progress
      const existingProgress = enrollment.lesson_progress.find(p => p.lesson_id === lessonId);
      if (existingProgress) {
        existingProgress.completed = completed;
        existingProgress.completed_at = completed ? new Date().toISOString() : '';
      } else if (completed) {
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
        const completedLessons = enrollment.lesson_progress.filter(p => p.completed).length;
        enrollment.progress = Math.round((completedLessons / course.lessons.length) * 100);
      }

      return { error: null };
    }
    return { error: { message: 'Enrollment not found' } };
  },
};

// Demo Stats Service
export const demoStatsService = {
  getTrainerStats: async (trainerId: string) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    return DEMO_TRAINER_STATS;
  },
};

// Demo Video Service
export const demoVideoService = {
  getVideoUrl: (videoId: string): string => {
    return getDemoVideoUrl(videoId || 'demo-video-1');
  },

  uploadVideo: async (file: any, lessonData: any) => {
    // Simulate upload progress
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      videoId: `demo-video-${Date.now()}`,
      libraryId: '527238',
      videoStatus: 'ready',
      error: null,
    };
  },
};

// Main demo service checker
export const isDemoMode = () => DEMO_MODE;

// Export demo credentials
export { DEMO_CREDENTIALS } from '../config/demo';
