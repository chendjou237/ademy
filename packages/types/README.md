# @repo/types

Shared TypeScript type definitions for the Ademy platform.

## Overview

This package contains all shared type definitions used across the admin and mobile applications, ensuring type consistency and reducing duplication.

## Installation

This package is part of the monorepo workspace and is automatically available to all apps.

```json
{
  "dependencies": {
    "@repo/types": "workspace:*"
  }
}
```

## Usage

### Database Types

```typescript
import { Course, Lesson, Profile, Enrollment } from '@repo/types';

const course: Course = {
  id: '123',
  title: 'My Course',
  // ...
};
```

### API Types

```typescript
import { VideoUploadResponse, DashboardStats } from '@repo/types/api';

const stats: DashboardStats = {
  totalCourses: 10,
  publishedCourses: 8,
  // ...
};
```

### Type-safe Table Names

```typescript
import { Tables } from '@repo/types';

const tableName = Tables.COURSES; // 'courses'
```

## Available Types

### Database Types (`@repo/types`)

- `Profile` - User profile
- `Course` - Course entity
- `Lesson` - Lesson entity
- `Enrollment` - Course enrollment
- `LessonProgress` - Lesson completion tracking
- `UserRole` - User role enum
- `CourseLevel` - Course difficulty level
- `VideoStatus` - Video processing status
- `Tables` - Type-safe table names

### API Types (`@repo/types/api`)

- `VideoUploadResponse` - Video upload response
- `VideoStatusResponse` - Video status response
- `VideoCreateRequest` - Video creation request
- `LessonUpdateRequest` - Lesson update request
- `CourseCreateRequest` - Course creation request
- `CourseUpdateRequest` - Course update request
- `EnrollmentCreateRequest` - Enrollment creation request
- `ApiErrorResponse` - API error response
- `ApiSuccessResponse<T>` - API success response
- `PaginatedResponse<T>` - Paginated response
- `DashboardStats` - Dashboard statistics
- `CourseWithStats` - Course with statistics
- `TrainerProfileWithStats` - Trainer profile with statistics

## Development

### Type Checking

```bash
pnpm check-types
```

### Linting

```bash
pnpm lint
```

## Best Practices

1. **Always use shared types** - Never duplicate type definitions
2. **Keep types pure** - No business logic in type files
3. **Document complex types** - Add JSDoc comments for clarity
4. **Use strict types** - Avoid `any` and `unknown` when possible
5. **Version carefully** - Breaking changes affect all apps

## Migration Guide

### From Mobile App

**Before:**
```typescript
import { Course } from '../lib/supabase';
```

**After:**
```typescript
import { Course } from '@repo/types';
```

### From Admin App

**Before:**
```typescript
// Define types inline or in local files
interface Course {
  // ...
}
```

**After:**
```typescript
import { Course } from '@repo/types';
```

## Contributing

When adding new types:

1. Add to appropriate file (`database.ts` or `api.ts`)
2. Export from `index.ts`
3. Add JSDoc comments
4. Update this README
5. Run type checking: `pnpm check-types`
