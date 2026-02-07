# Demo Mode - Admin App

## Overview

The admin app now includes a comprehensive demo mode that allows you to test all features without connecting to a real Supabase backend.

## Enabling Demo Mode

Edit `apps/admin/lib/demo/data.ts`:

```typescript
export const DEMO_MODE = true; // Set to true to enable demo mode
```

## Demo Credentials

### Admin Account
- **Email**: `admin@demo.com`
- **Password**: `demo123`
- **Access**: Full platform access, user management, all courses

### Trainer Account
- **Email**: `trainer@demo.com`
- **Password**: `demo123`
- **Access**: Course creation, lesson management, analytics

### Learner Account
- **Email**: `learner@demo.com`
- **Password**: `demo123`
- **Access**: Course browsing, enrollment, progress tracking

## Available Demo Data

### Users
- 1 Admin user
- 2 Trainer users
- 2 Learner users

### Courses
- 3 published courses
- Various difficulty levels (beginner, intermediate)
- Mix of free and paid courses

### Lessons
- 6 total lessons across all courses
- Demo video URLs (public test videos)
- Realistic metadata (duration, descriptions)

### Enrollments
- 2 sample enrollments
- Progress tracking data
- Lesson completion records

### Statistics
- Trainer dashboard stats
- Admin dashboard stats
- Revenue and enrollment metrics

## Demo Services

All demo services simulate realistic API delays and return properly typed data:

### Authentication (`demoAuthService`)
```typescript
import { demoAuthService } from '@/lib/demo';

const { user, error } = await demoAuthService.signIn('admin@demo.com', 'demo123');
const profile = await demoAuthService.getProfile(userId);
```

### Courses (`demoCourseService`)
```typescript
import { demoCourseService } from '@/lib/demo';

const courses = await demoCourseService.getCourses();
const course = await demoCourseService.getCourseById(courseId);
await demoCourseService.createCourse(courseData);
await demoCourseService.updateCourse(courseId, updates);
```

### Lessons (`demoLessonService`)
```typescript
import { demoLessonService } from '@/lib/demo';

const lessons = await demoLessonService.getCourseLessons(courseId);
await demoLessonService.createLesson(courseId, lessonData);
await demoLessonService.updateLesson(lessonId, updates);
```

### Enrollments (`demoEnrollmentService`)
```typescript
import { demoEnrollmentService } from '@/lib/demo';

const enrollments = await demoEnrollmentService.getAllEnrollments();
await demoEnrollmentService.enrollInCourse(learnerId, courseId);
await demoEnrollmentService.updateProgress(enrollmentId, lessonId, true);
```

### Users (`demoUserService`)
```typescript
import { demoUserService } from '@/lib/demo';

const users = await demoUserService.getAllUsers();
await demoUserService.updateUser(userId, updates);
```

### Statistics (`demoStatsService`)
```typescript
import { demoStatsService } from '@/lib/demo';

const trainerStats = await demoStatsService.getTrainerStats(trainerId);
const adminStats = await demoStatsService.getAdminStats();
```

### Videos (`demoVideoService`)
```typescript
import { demoVideoService } from '@/lib/demo';

const videoUrl = demoVideoService.getVideoUrl(videoId);
const result = await demoVideoService.uploadVideo(file, title);
```

## Usage in Components

### Check if Demo Mode is Active

```typescript
import { isDemoMode } from '@/lib/demo';

if (isDemoMode()) {
  // Use demo service
  const courses = await demoCourseService.getCourses();
} else {
  // Use Supabase
  const { data: courses } = await supabase.from('courses').select('*');
}
```

### Example: Course List Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { isDemoMode, demoCourseService } from '@/lib/demo';
import { createClient } from '@/lib/supabase/client';
import type { Course } from '@repo/types';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    async function loadCourses() {
      if (isDemoMode()) {
        const data = await demoCourseService.getCourses();
        setCourses(data);
      } else {
        const supabase = createClient();
        const { data } = await supabase.from('courses').select('*');
        setCourses(data || []);
      }
    }
    loadCourses();
  }, []);

  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.title}</div>
      ))}
    </div>
  );
}
```

## Features

### ✅ Realistic Delays
All demo services include simulated network delays to mimic real API behavior.

### ✅ Type Safety
All demo data and services use the shared `@repo/types` package for full type safety.

### ✅ CRUD Operations
Full Create, Read, Update, Delete support for all entities.

### ✅ State Persistence
Demo data persists in memory during the session (resets on page reload).

### ✅ Error Handling
Proper error responses for invalid operations.

### ✅ Relationships
Courses include lessons, enrollments include progress tracking.

## Demo Video URLs

Demo mode uses public test videos from Google's test video repository:
- High-quality MP4 videos
- Various lengths and content
- No authentication required
- Reliable CDN delivery

## Limitations

1. **Session Only**: Data resets on page reload
2. **No Persistence**: Changes are not saved to a database
3. **Limited Users**: Only 5 demo users available
4. **No Real Uploads**: File uploads are simulated
5. **No Email**: Email notifications are not sent

## Migration to Production

When ready to use real data:

1. Set `DEMO_MODE = false` in `lib/demo/data.ts`
2. Configure Supabase credentials in `.env`
3. Run database migrations
4. Update components to use Supabase instead of demo services
5. Test thoroughly with real data

## Best Practices

1. **Always check demo mode** before choosing service
2. **Use TypeScript types** from `@repo/types`
3. **Handle errors** from both demo and real services
4. **Test with demo mode** before deploying
5. **Document demo usage** in component comments

## Troubleshooting

### Demo mode not working
- Check that `DEMO_MODE = true` in `lib/demo/data.ts`
- Verify imports are correct
- Clear browser cache and reload

### Type errors
- Ensure `@repo/types` is installed
- Run `pnpm install` at root
- Check TypeScript version compatibility

### Data not persisting
- This is expected behavior in demo mode
- Use Supabase for persistent data

## Related Files

- `lib/demo/data.ts` - Demo data configuration
- `lib/demo/service.ts` - Demo service implementations
- `lib/demo/index.ts` - Central export point

---

**Demo mode is perfect for:**
- 🎨 UI/UX development
- 🧪 Testing components
- 📸 Screenshots and demos
- 🎓 Training and onboarding
- 🚀 Rapid prototyping
