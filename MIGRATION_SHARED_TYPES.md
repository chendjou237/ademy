# Migration Guide: Shared Types Package

## Overview

This guide helps you migrate from local type definitions to the shared `@repo/types` package.

## What Changed

We've created a new shared package `@repo/types` that contains all database and API type definitions used across the platform. This ensures type consistency between the admin and mobile apps.

## Package Structure

```
packages/types/
├── src/
│   ├── database.ts    # Database entity types
│   ├── api.ts         # API request/response types
│   └── index.ts       # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

## For Mobile App

### ✅ Already Migrated

The mobile app has been updated to use `@repo/types`:

**Before:**
```typescript
// apps/mobile/lib/supabase.ts
export interface Course {
  id: string;
  // ...
}
```

**After:**
```typescript
// apps/mobile/lib/supabase.ts
export type { Course, Lesson, Profile } from '@repo/types';
```

### Usage in Components

No changes needed! The types are re-exported from `lib/supabase.ts`:

```typescript
import { Course } from '../lib/supabase';
// This now uses @repo/types under the hood
```

## For Admin App

### Migration Steps

1. **Install the package** (already done via workspace)
   ```json
   {
     "dependencies": {
       "@repo/types": "workspace:*"
     }
   }
   ```

2. **Update imports** in your files:

   **Before:**
   ```typescript
   // Local type definitions
   interface Course {
     id: string;
     title: string;
     // ...
   }
   ```

   **After:**
   ```typescript
   import { Course } from '@repo/types';
   ```

3. **For API types:**
   ```typescript
   import { VideoUploadResponse, DashboardStats } from '@repo/types/api';
   ```

### Files to Update

Search for these patterns in the admin app:

```bash
# Find local type definitions
grep -r "interface Course" apps/admin
grep -r "interface Lesson" apps/admin
grep -r "interface Profile" apps/admin
grep -r "type Course" apps/admin
```

Common files that may need updates:
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- Component files with inline types
- API route handlers

## Benefits

✅ **Type Consistency** - Same types across all apps
✅ **Single Source of Truth** - Update once, use everywhere
✅ **Better IntelliSense** - Shared documentation
✅ **Reduced Duplication** - DRY principle
✅ **Easier Refactoring** - Change types in one place

## Available Types

### Database Types (`@repo/types`)
- `Profile` - User profiles
- `Course` - Courses
- `Lesson` - Lessons
- `Enrollment` - Course enrollments
- `LessonProgress` - Lesson completion tracking
- `UserRole` - 'admin' | 'trainer' | 'learner'
- `CourseLevel` - 'beginner' | 'intermediate' | 'advanced'
- `VideoStatus` - Video processing status
- `Tables` - Type-safe table names

### API Types (`@repo/types/api`)
- `VideoUploadResponse`
- `VideoStatusResponse`
- `VideoCreateRequest`
- `LessonUpdateRequest`
- `CourseCreateRequest`
- `CourseUpdateRequest`
- `EnrollmentCreateRequest`
- `ApiErrorResponse`
- `ApiSuccessResponse<T>`
- `PaginatedResponse<T>`
- `DashboardStats`
- `CourseWithStats`
- `TrainerProfileWithStats`

## Next Steps

1. Run `pnpm install` to install the new package
2. Update admin app files to use shared types
3. Remove local type definitions
4. Test type checking: `pnpm check-types`
5. Update STEERING.md with new package info

## Troubleshooting

### Type not found
Make sure you're importing from the correct path:
```typescript
import { Course } from '@repo/types';           // Database types
import { DashboardStats } from '@repo/types/api'; // API types
```

### Workspace not resolving
Run `pnpm install` at the root to update workspace links.

### Type mismatch
The shared types include `is_free` field on `Course` which may not exist in older definitions. Update your database schema if needed.

## Questions?

See `packages/types/README.md` for detailed documentation.
