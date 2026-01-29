/**
 * Demo/Mock Data Configuration for Admin App
 * Set DEMO_MODE to true to use mock data instead of real Supabase data
 */

import type { Course, Enrollment, Profile } from '@repo/types';

// Demo Mode Flag
export const DEMO_MODE = true; // Set to true to enable demo mode

// Mock User Data
export const DEMO_USERS = {
  admin: {
    id: 'demo-admin-1',
    email: 'admin@demo.com',
    full_name: 'Admin Système',
    role: 'admin' as const,
    bio: 'Administrateur de la plateforme Ademy',
    phone_number: '+237 6XX XXX XXX',
    mobile_money_provider: 'Orange Money',
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  trainer: {
    id: 'demo-trainer-1',
    email: 'trainer@demo.com',
    full_name: 'Jean-Claude Formateur',
    role: 'trainer' as const,
    bio: 'Formateur expérimenté en développement web et mobile avec plus de 10 ans d\'expérience.',
    phone_number: '+237 6XX XXX XXX',
    mobile_money_provider: 'Orange Money',
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  learner: {
    id: 'demo-learner-1',
    email: 'learner@demo.com',
    full_name: 'Marie Apprenante',
    role: 'learner' as const,
    bio: 'Étudiante passionnée par la technologie et le développement.',
    phone_number: '+237 6YY YYY YYY',
    mobile_money_provider: 'MTN MoMo',
    avatar_url: undefined,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
} satisfies Record<string, Profile>;

// Mock Courses Data
export const DEMO_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Développement Web avec React',
    description: 'Apprenez à créer des applications web modernes avec React, de zéro à expert.',
    price: 75000, // XAF
    category: 'Développement Web',
    level: 'intermediate',
    is_published: true,
    is_free: false,
    trainer_id: 'demo-trainer-1',
    thumbnail_url: 'https://picsum.photos/seed/react-course/800/450',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    profiles: DEMO_USERS.trainer,
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Introduction à React',
        description: 'Découvrez les bases de React et son écosystème.',
        video_url: 'bunny://527238/demo-video-1',
        bunny_video_id: 'demo-video-1',
        bunny_library_id: '527238',
        video_status: 'finished',
        duration_minutes: 25,
        order_index: 1,
        is_free: true,
        course_id: 'course-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'lesson-1-2',
        title: 'Composants et Props',
        description: 'Apprenez à créer et utiliser des composants React.',
        video_url: 'bunny://527238/demo-video-2',
        bunny_video_id: 'demo-video-2',
        bunny_library_id: '527238',
        video_status: 'finished',
        duration_minutes: 35,
        order_index: 2,
        is_free: false,
        course_id: 'course-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'lesson-1-3',
        title: 'State et Hooks',
        description: 'Maîtrisez la gestion d\'état avec les hooks React.',
        video_url: 'bunny://527238/demo-video-3',
        bunny_video_id: 'demo-video-3',
        bunny_library_id: '527238',
        video_status: 'finished',
        duration_minutes: 45,
        order_index: 3,
        is_free: false,
        course_id: 'course-1',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'course-2',
    title: 'React Native pour Débutants',
    description: 'Créez vos premières applications mobiles avec React Native.',
    price: 85000, // XAF
    category: 'Développement Mobile',
    level: 'beginner',
    is_published: true,
    is_free: false,
    trainer_id: 'demo-trainer-1',
    thumbnail_url: 'https://picsum.photos/seed/mobile-dev/800/450',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
    profiles: DEMO_USERS.trainer,
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Configuration de l\'environnement',
        description: 'Installez et configurez React Native sur votre machine.',
        video_url: 'bunny://527238/demo-video-4',
        bunny_video_id: 'demo-video-4',
        bunny_library_id: '527238',
        video_status: 'finished',
        duration_minutes: 20,
        order_index: 1,
        is_free: true,
        course_id: 'course-2',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
      {
        id: 'lesson-2-2',
        title: 'Première application',
        description: 'Créez votre première application React Native.',
        video_url: 'bunny://527238/demo-video-5',
        bunny_video_id: 'demo-video-5',
        bunny_library_id: '527238',
        video_status: 'finished',
        duration_minutes: 40,
        order_index: 2,
        is_free: false,
        course_id: 'course-2',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      },
    ],
  },
  {
    id: 'course-3',
    title: 'Design UI/UX avec Figma',
    description: 'Apprenez les principes du design et maîtrisez Figma.',
    price: 0, // Free course
    category: 'Design',
    level: 'beginner',
    is_published: true,
    is_free: true,
    trainer_id: 'demo-trainer-1',
    thumbnail_url: 'https://picsum.photos/seed/figma-design/800/450',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
    profiles: DEMO_USERS.trainer,
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Principes du design',
        description: 'Découvrez les bases du design UI/UX.',
        video_url: 'bunny://527238/demo-video-6',
        bunny_video_id: 'demo-video-6',
        bunny_library_id: '527238',
        video_status: 'finished',
        duration_minutes: 30,
        order_index: 1,
        is_free: true,
        course_id: 'course-3',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      },
    ],
  },
];

// Mock Enrollments Data
export const DEMO_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enrollment-1',
    learner_id: 'demo-learner-1',
    course_id: 'course-1',
    enrolled_at: '2024-01-05T00:00:00Z',
    progress: 33, // 1 out of 3 lessons completed
    course: DEMO_COURSES[0],
    learner: DEMO_USERS.learner,
    lesson_progress: [
      {
        id: 'progress-1',
        enrollment_id: 'enrollment-1',
        lesson_id: 'lesson-1-1',
        completed: true,
        completed_at: '2024-01-05T10:00:00Z',
      },
    ],
  },
  {
    id: 'enrollment-2',
    learner_id: 'demo-learner-1',
    course_id: 'course-3',
    enrolled_at: '2024-01-06T00:00:00Z',
    progress: 0,
    course: DEMO_COURSES[2],
    learner: DEMO_USERS.learner,
    lesson_progress: [],
  },
];

// Mock Stats for Trainer Dashboard
export const DEMO_TRAINER_STATS = {
  totalCourses: 3,
  publishedCourses: 3,
  totalStudents: 15,
  totalRevenue: 450000, // XAF
  accountBalance: 315000, // 70% of revenue
};

// Mock Stats for Admin Dashboard
export const DEMO_ADMIN_STATS = {
  totalUsers: 50,
  totalTrainers: 10,
  totalLearners: 40,
  totalCourses: 25,
  publishedCourses: 20,
  totalEnrollments: 150,
  totalRevenue: 2500000, // XAF
  platformFees: 750000, // 30% of revenue
};

// Demo Video URLs (using test videos)
export const DEMO_VIDEO_URLS: Record<string, string> = {
  'demo-video-1': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'demo-video-2': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'demo-video-3': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'demo-video-4': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'demo-video-5': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'demo-video-6': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
};

// Helper function to get demo video URL
export const getDemoVideoUrl = (videoId: string): string => {
  return DEMO_VIDEO_URLS[videoId] || DEMO_VIDEO_URLS['demo-video-1'];
};

// Demo credentials for easy testing
export const DEMO_CREDENTIALS = {
  admin: {
    email: 'admin@demo.com',
    password: 'demo123',
  },
  trainer: {
    email: 'trainer@demo.com',
    password: 'demo123',
  },
  learner: {
    email: 'learner@demo.com',
    password: 'demo123',
  },
};

// All demo users list (for admin user management)
export const ALL_DEMO_USERS: Profile[] = [
  DEMO_USERS.admin,
  DEMO_USERS.trainer,
  DEMO_USERS.learner,
  // Additional demo users
  {
    id: 'demo-learner-2',
    email: 'learner2@demo.com',
    full_name: 'Pierre Étudiant',
    role: 'learner',
    bio: 'Développeur junior en formation',
    phone_number: '+237 6ZZ ZZZ ZZZ',
    mobile_money_provider: 'MTN MoMo',
    avatar_url: undefined,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'demo-trainer-2',
    email: 'trainer2@demo.com',
    full_name: 'Sophie Enseignante',
    role: 'trainer',
    bio: 'Experte en design UI/UX',
    phone_number: '+237 6AA AAA AAA',
    mobile_money_provider: 'Orange Money',
    avatar_url: undefined,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];
