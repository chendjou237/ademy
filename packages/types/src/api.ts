/**
 * API Types
 * Shared type definitions for API requests and responses
 */

import type { Course, Profile, VideoStatus } from './database';

/**
 * Video Upload Response
 */
export interface VideoUploadResponse {
  videoId: string;
  libraryId: string;
  uploadUrl: string;
}

/**
 * Video Status Response
 */
export interface VideoStatusResponse {
  videoId: string;
  status: VideoStatus;
  title: string;
  length?: number;
  thumbnailUrl?: string;
}

/**
 * Video Creation Request
 */
export interface VideoCreateRequest {
  title: string;
  collectionId?: string;
}

/**
 * Lesson Update Request
 */
export interface LessonUpdateRequest {
  title?: string;
  description?: string;
  video_url?: string;
  bunny_video_id?: string;
  bunny_library_id?: string;
  video_status?: VideoStatus;
  thumbnail_url?: string;
  duration_minutes?: number;
  order_index?: number;
  is_free?: boolean;
}

/**
 * Course Create Request
 */
export interface CourseCreateRequest {
  title: string;
  description?: string;
  thumbnail_url?: string;
  price: number;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  is_free?: boolean;
}

/**
 * Course Update Request
 */
export interface CourseUpdateRequest extends Partial<CourseCreateRequest> {
  is_published?: boolean;
}

/**
 * Enrollment Create Request
 */
export interface EnrollmentCreateRequest {
  course_id: string;
  learner_id: string;
}

/**
 * API Error Response
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * API Success Response
 */
export interface ApiSuccessResponse<T = any> {
  data: T;
  message?: string;
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Dashboard Stats
 */
export interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  accountBalance: number;
}

/**
 * Course with Stats
 */
export interface CourseWithStats extends Course {
  totalLessons: number;
  totalEnrollments: number;
  completionRate: number;
}

/**
 * Trainer Profile with Stats
 */
export interface TrainerProfileWithStats extends Profile {
  totalCourses: number;
  totalStudents: number;
  averageRating?: number;
}
