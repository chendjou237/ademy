# Ademy Project Context

## Project Overview

**Ademy** is an African-focused online learning platform (LMS) designed to connect trainers with learners. It enables trainers to create and monetize courses (in XAF currency) and learners to access educational content via video lessons.

## Architecture & Tech Stack

This project is a **monorepo** managed by **Turborepo** and **pnpm**.

### 1. Applications (`apps/`)

#### **`admin`**: Main Web Application

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS, Radix UI (shadcn/ui patterns)
- **Key Libraries**:
  - `supabase-js` - Database and auth client
  - `next-intl` - Internationalization
  - `zod` - Schema validation
  - `react-hook-form` - Form handling
  - `tus-js-client` - Video uploads (legacy, being migrated)
- **Features**:
  - Course management (CRUD operations)
  - Video uploading to Bunny.net
  - Authentication (trainer/learner roles)
  - Learner/trainer dashboards
  - Course thumbnail uploads to Supabase Storage
  - Lesson completion tracking

#### **`mobile`**: Mobile Application (React Native)

- **Framework**: React Native with Expo (SDK 54)
- **Navigation**: Expo Router v6
- **Key Libraries**:
  - `expo-av` - Video playback
  - `expo-image-picker` - Media selection (videos, images)
  - `expo-file-system` - File operations (NEW API in SDK 54)
  - `expo/fetch` - Enhanced fetch with File support
  - `react-native-elements` - UI components
- **Features**:
  - Offline course viewing
  - Progress tracking with lesson completion
  - Mobile-optimized video player
  - Video upload for trainers
  - Course creation and management
- **Important**: Uses Expo SDK 54 which has breaking changes in FileSystem API

#### **`docs`**: Documentation Site

- **Framework**: Next.js
- **Purpose**: Project documentation and guides

### 2. Shared Packages (`packages/`)

- **`@repo/ui`**: Shared React UI component library
- **`@repo/types`**: Shared TypeScript type definitions
  - **Critical**: Single source of truth for DB types
  - Syncs types between web, mobile, and database
- **`@repo/eslint-config`**: Shared ESLint configurations
- **`@repo/typescript-config`**: Shared TSConfig bases

### 3. Backend & Infrastructure

#### Database (Supabase PostgreSQL)

**Core Tables**:

- `profiles` - User profiles (linked to auth.users)
- `courses` - Course information
- `lessons` - Individual lesson data
- `enrollments` - User course enrollments
- `lesson_progress` - Tracks lesson completion

**Important Constraints**:

- `lesson_progress`: Unique constraint on (`enrollment_id`, `lesson_id`)
- `profiles`: Primary key on `id` (matches auth.users.id)

#### Authentication (Supabase Auth)

- **Method**: Email/Password
- **Roles**: `trainer`, `learner`
- **User Metadata**: Stored in `raw_user_meta_data` (full_name, role)
- **Profile Creation**: Automatic via database trigger (with fallback)

#### Video Hosting (Bunny.net Stream)

- **Purpose**: Adaptive streaming and video storage
- **API Base**: `https://video.bunnycdn.com`
- **Upload Method**: PUT request with binary data
- **Video IDs**: UUIDs (GUIDs)
- **Playback**: HLS streaming (`.m3u8`) or direct MP4

#### File Storage

- **Course Thumbnails**: Supabase Storage (`course-thumbnails` bucket)
- **Videos**: Bunny.net CDN

---

## Critical Implementation Details

### 1. Authentication & Profile Creation

#### Database Trigger (Primary Method)

Located in `apps/admin/scripts/03-setup-profile-trigger.sql`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'learner')
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**How it works**:

1. User signs up via Supabase Auth
2. Auth creates user in `auth.users` with metadata
3. Trigger fires automatically
4. Profile created in `profiles` table

#### Fallback Mechanism (Mobile App)

Located in `apps/mobile/contexts/AuthContext.tsx`:

- Waits 500ms for trigger to fire
- Checks if profile exists
- Creates profile using `upsert` if missing
- **Prevents**: Duplicate key errors
- **Ensures**: Profiles always created

#### Login Flow with Auto-Profile Creation

In `fetchProfile` function:

- If profile doesn't exist (PGRST116 error)
- Automatically creates profile from auth metadata
- Handles legacy users without profiles
- Navigates to appropriate dashboard based on role

### 2. Video Upload (Bunny.net) - Expo SDK 54

**CRITICAL**: Expo SDK 54 introduced breaking changes in FileSystem API.

#### File Selection (Mobile)

**Current Approach** (apps/mobile/app/(trainer)/course/[courseId]/add-lesson.tsx):

```typescript
import * as ImagePicker from 'expo-image-picker';

// Request permissions
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

// Pick video
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
  allowsEditing: false,
  quality: 1,
});
```

**Why ImagePicker over DocumentPicker**:

- Better UX with native media picker
- Proper permission handling
- Access to video metadata (duration, dimensions)
- Type-safe (videos only)

#### Video Upload (Bunny.net API)

Located in `apps/mobile/lib/bunny.ts`:

**Step 1: Create Video Entry**

```typescript
const response = await fetch(`${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos`, {
  method: 'POST',
  headers: {
    'AccessKey': BUNNY_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ title: videoTitle }),
});
```

**Step 2: Upload Binary Data (SDK 54 Method)**

```typescript
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

const file = new File(videoUri);
const videoData = await file.arrayBuffer();

const response = await expoFetch(uploadUrl, {
  method: 'PUT',
  headers: {
    'AccessKey': BUNNY_API_KEY,
    'Accept': 'application/json',
  },
  body: videoData,
});
```

**Migration Notes**:

- ❌ OLD: `FileSystem.uploadAsync()` (deprecated in SDK 54)
- ❌ OLD: `FileSystem.File(Paths, uri)` (deprecated)
- ✅ NEW: `File(uri)` with `file.arrayBuffer()`
- ✅ NEW: `expo/fetch` with binary body

### 3. Lesson Completion Tracking

**Challenge**: Unique constraint on (`enrollment_id`, `lesson_id`) requires careful handling.

#### Mobile App Implementation

Located in `apps/mobile/app/(learner)/lesson/[id].tsx`:

```typescript
const { error } = await supabase
  .from('lesson_progress')
  .upsert({
    enrollment_id: enrollmentId,
    lesson_id: lessonId,
    completed: true,
    completed_at: new Date().toISOString(),
  }, {
    onConflict: 'enrollment_id,lesson_id'
  });
```

#### Web App Implementation

Located in `apps/admin/components/learner/lesson-player.tsx`:

```typescript
const { error } = await supabase
  .from('lesson_progress')
  .upsert({
    enrollment_id: enrollment.id,
    lesson_id: lesson.id,
    completed: checked,
    completed_at: checked ? new Date().toISOString() : null,
  }, {
    onConflict: 'enrollment_id,lesson_id'
  });
```

**Why upsert**:

- Handles both insert and update in one call
- Prevents duplicate key errors
- Atomic operation
- Works with unique constraint

### 4. Course Thumbnail Upload

#### Component (Web App)

Located in `apps/admin/components/ui/image-upload.tsx`:

**Features**:

- Drag & drop or click to upload
- Image preview
- File validation (type, size)
- Upload to Supabase Storage
- Remove functionality

#### Storage Setup

SQL migration in `apps/admin/scripts/02-create-storage-bucket.sql`:

```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true);

-- RLS Policies
-- 1. Allow trainers to upload/update/delete
-- 2. Allow public read access
```

#### Usage in Forms

```typescript
const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

<ImageUpload
  value={thumbnailUrl}
  onChange={setThumbnailUrl}
  bucket="course-thumbnails"
  folder="course-thumbnails"
/>

// On submit:
await supabase.from('courses').insert({
  ...courseData,
  thumbnail_url: thumbnailUrl,
});
```

---

## Development Workflow

### Prerequisites

- Node.js >= 18
- pnpm (`corepack enable`)
- Supabase CLI (optional but recommended)
- Expo CLI (for mobile development)

### Key Commands (Root)

```bash
# Start all apps in development
pnpm dev

# Build all apps
pnpm build

# Lint all code
pnpm lint

# Type check
pnpm check-types
```

### Mobile Development (apps/mobile)

```bash
# Start Expo dev server
pnpm dev

# Start on specific platform
pnpm ios
pnpm android

# Run in web browser
pnpm web
```

### Environment Variables

#### Mobile App (apps/mobile/.env)

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_BUNNY_LIBRARY_ID=your_library_id
EXPO_PUBLIC_BUNNY_API_KEY=your_api_key
```

#### Web App (apps/admin/.env)

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
BUNNY_LIBRARY_ID=your_library_id
BUNNY_API_KEY=your_api_key
```

---

## Key Conventions & Patterns

### Code Organization

```
apps/
├── admin/              # Next.js web app
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── lib/          # Utilities & clients
│   └── scripts/      # SQL migrations
├── mobile/            # Expo React Native app
│   ├── app/          # Expo Router pages
│   ├── components/   # React Native components
│   ├── contexts/     # React contexts (Auth, Theme, I18n)
│   ├── lib/         # Utilities (supabase, bunny)
│   └── services/    # Demo mode services
└── docs/             # Documentation

packages/
├── ui/               # Shared UI components
├── types/           # Shared TypeScript types
├── eslint-config/   # ESLint configs
└── typescript-config/ # TypeScript configs
```

### Styling

- **Web**: Tailwind CSS with utility-first approach
- **Mobile**: React Native StyleSheet API
- **Theme**: Centralized theme in contexts (mobile)

### State Management

- **Global State**: React Context (AuthContext, ThemeContext, I18nContext)
- **Local State**: useState, useReducer
- **Server State**: Direct Supabase queries (no React Query yet)

### Data Fetching

- **Pattern**: Direct Supabase client calls
- **Location**: Components or service layers
- **Error Handling**: Try-catch with user feedback

### Type Safety

- **Source of Truth**: `packages/types/src/database.ts`
- **Supabase Types**: Generated from DB schema
- **Import Pattern**:

  ```typescript
  import type { Course, Lesson, Profile } from '@repo/types';
  ```

---

## Common Issues & Solutions

### Issue 1: Module Not Found (@/...)

**Problem**: Path alias not configured
**Solution**: Add to tsconfig.json:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue 2: Profile Not Created on Signup

**Problem**: Database trigger not set up or not firing
**Solution**:

1. Run `apps/admin/scripts/03-setup-profile-trigger.sql`
2. Fallback in `AuthContext.tsx` will handle it
3. See `PROFILE_CREATION_SETUP.md` for details

### Issue 3: Video Upload Fails (Mobile)

**Problem**: Using deprecated FileSystem API
**Solution**: Use Expo SDK 54 File API:

```typescript
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

const file = new File(videoUri);
const videoData = await file.arrayBuffer();
// Upload with expoFetch
```

### Issue 4: Lesson Completion Duplicate Key Error

**Problem**: Trying to insert when record exists
**Solution**: Use upsert with onConflict:

```typescript
await supabase
  .from('lesson_progress')
  .upsert(data, { onConflict: 'enrollment_id,lesson_id' });
```

### Issue 5: PGRST116 Error (Profile Not Found)

**Problem**: User exists in auth but no profile record
**Solution**: Auto-create profile in fetchProfile:

```typescript
if (error.code === 'PGRST116') {
  // Create profile from auth metadata
  await supabase.from('profiles').insert({...});
}
```

---

## Important Documentation Files

### Core Documentation

- **`GEMINI.md`** (this file): Project architecture overview
- **`PROFILE_CREATION_SETUP.md`**: Profile creation setup guide
- **`VIDEO_UPLOAD_FIX.md`**: Video upload migration guide (SDK 54)
- **`LESSON_COMPLETION_FIX.md`**: Lesson completion implementation
- **`COURSE_THUMBNAIL_UPLOAD.md`**: Thumbnail upload feature guide

### App-Specific Documentation

- **`apps/mobile/MOBILE_APP_DOCUMENTATION.md`**: Comprehensive mobile app guide
- **`apps/admin/README_BUNNY.md`**: Video upload/playback integration
- **`apps/admin/BUNNY_INTEGRATION.md`**: Deep dive into video backend

### SQL Migration Scripts

- **`apps/admin/scripts/01-create-tables.sql`**: Database schema
- **`apps/admin/scripts/02-create-storage-bucket.sql`**: Storage bucket setup
- **`apps/admin/scripts/03-setup-profile-trigger.sql`**: Profile trigger setup

---

## Database Schema (Key Tables)

### profiles

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('trainer', 'learner')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### courses

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  level TEXT,
  price NUMERIC(10,2),
  currency TEXT DEFAULT 'XAF',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### lessons

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  bunny_video_id TEXT,
  bunny_library_id TEXT,
  video_status TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### enrollments

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  course_id UUID REFERENCES courses(id),
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
```

### lesson_progress

```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(enrollment_id, lesson_id)
);
```

---

## Recent Fixes & Migrations

### 1. Expo SDK 54 Migration (January 2026)

- **Changed**: FileSystem API completely rewritten
- **Impact**: Video upload functionality
- **Fix**: Migrated to new File class and expo/fetch
- **Status**: ✅ Complete

### 2. Profile Creation Reliability (January 2026)

- **Problem**: Profiles not created consistently
- **Solution**: Database trigger + fallback mechanism
- **Impact**: All signup flows
- **Status**: ✅ Complete

### 3. Lesson Completion Tracking (January 2026)

- **Problem**: Duplicate key errors
- **Solution**: Switched from insert/update to upsert
- **Impact**: Progress tracking (web & mobile)
- **Status**: ✅ Complete

### 4. ImagePicker for Videos (January 2026)

- **Changed**: DocumentPicker → ImagePicker
- **Reason**: Better UX, proper permissions, video metadata
- **Impact**: Video selection in mobile app
- **Status**: ✅ Complete

### 5. Course Thumbnail Upload (January 2026)

- **Added**: Supabase Storage integration
- **Features**: ImageUpload component, RLS policies
- **Impact**: Web app course creation/editing
- **Status**: ✅ Complete

---

## Testing Guidelines

### Unit Testing

- Not yet implemented
- TODO: Add Jest for shared packages

### Integration Testing

- Manual testing currently
- TODO: Add E2E tests with Playwright (web) and Detox (mobile)

### Manual Testing Checklist

#### Authentication

- [ ] Sign up new user (trainer)
- [ ] Sign up new user (learner)
- [ ] Verify profile created in database
- [ ] Log in with credentials
- [ ] Navigate to correct dashboard based on role
- [ ] Log out

#### Course Management (Trainer)

- [ ] Create new course
- [ ] Upload course thumbnail
- [ ] Add lessons to course
- [ ] Upload video for lesson
- [ ] Publish course
- [ ] Edit course details
- [ ] Delete course

#### Learning (Learner)

- [ ] Browse courses
- [ ] Enroll in course
- [ ] Watch lesson video
- [ ] Mark lesson as complete
- [ ] View progress
- [ ] Complete course

#### Video Upload (Mobile - Trainer)

- [ ] Grant media library permission
- [ ] Select video from gallery
- [ ] View video info (size, duration)
- [ ] Upload video to Bunny.net
- [ ] Verify video status changes to processing

---

## Performance Considerations

### Mobile App

- **Video Playback**: Use HLS streaming for adaptive quality
- **Offline Support**: TODO - implement caching
- **Image Loading**: Use optimized formats (WebP)
- **List Rendering**: Use FlatList for long lists

### Web App

- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component
- **API Routes**: Use for server-side operations
- **Caching**: Implement React Query (TODO)

---

## Security Considerations

### Row Level Security (RLS)

- **Enabled**: On all tables
- **Policies**: Based on user role and ownership
- **Example**: Trainers can only modify their own courses

### API Keys

- **Client-Side**: Only anon keys (limited permissions)
- **Server-Side**: Service role keys (full access)
- **Storage**: Environment variables only

### File Uploads

- **Validation**: File type and size checks
- **Limits**: 500MB for videos, 5MB for images
- **Scanning**: TODO - implement malware scanning

---

## Deployment

### Mobile App (Expo)

```bash
# Development build
eas build --platform ios --profile development
eas build --platform android --profile development

# Production build
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Web App (Vercel)

- **Auto-Deploy**: On push to main branch
- **Preview Deploys**: On pull requests
- **Environment**: Set variables in Vercel dashboard

---

## Future Enhancements (TODO)

### High Priority

- [ ] Implement React Query for better data management
- [ ] Add offline support for mobile app
- [ ] Implement video progress tracking (time-based)
- [ ] Add payment integration (MTN Mobile Money, Orange Money)
- [ ] Implement course reviews and ratings

### Medium Priority

- [ ] Add search functionality
- [ ] Implement course categories and filtering
- [ ] Add user notifications
- [ ] Implement course certificates
- [ ] Add analytics dashboard for trainers

### Low Priority

- [ ] Implement live classes
- [ ] Add discussion forums
- [ ] Implement quizzes and assessments
- [ ] Add social features (follow trainers)
- [ ] Implement referral system

---

## Troubleshooting Commands

### Clear Expo Cache (Mobile)

```bash
cd apps/mobile
npx expo start -c
```

### Reset Expo Dev Client

```bash
rm -rf node_modules
pnpm install
npx expo prebuild --clean
```

### Regenerate Types

```bash
cd packages/types
# Generate from Supabase schema
npx supabase gen types typescript --project-id <project-id> > src/database.ts
```

### Check Database Connection

```bash
# From admin app
cd apps/admin
npx supabase status
```

---

## Contact & Support

### Project Maintainer

- Check repository for current maintainer

### Resources

- **Supabase Docs**: <https://supabase.com/docs>
- **Expo Docs**: <https://docs.expo.dev>
- **Next.js Docs**: <https://nextjs.org/docs>
- **Bunny.net Docs**: <https://docs.bunny.net>

---

## Version History

### Current Version

- **Expo SDK**: 54
- **Next.js**: 16
- **React**: 19
- **React Native**: 0.81.5
- **Supabase**: Latest

### Breaking Changes Log

- **2026-01**: Expo SDK 54 FileSystem API changes
- **2026-01**: Profile creation flow updates
- **2026-01**: Lesson completion tracking improvements

---

## 🏗️ CRITICAL: Senior-Level Architecture & Best Practices

### Current Architecture Issues ⚠️

The codebase currently has several anti-patterns that violate senior-level best practices:

#### 1. **Mixed Concerns** (Business Logic + UI)

❌ **Bad Example**: `apps/mobile/app/(trainer)/course/[courseId]/add-lesson.tsx`

```typescript
// ❌ Component doing EVERYTHING: UI, validation, API calls, business logic
export default function AddLessonScreen() {
  const handleSubmit = async () => {
    // Validation in component
    if (!formData.title) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    // Direct database query in component
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('course_id', courseId);

    // Business logic in component
    const nextOrderIndex = existingLessons?.length > 0
      ? existingLessons[0].order_index + 1
      : 1;

    // Video upload logic in component
    const bunnyResult = await createBunnyVideo(formData.title);
    const uploadSuccess = await uploadVideoToBunny(...);

    // Another database query
    await supabase.from('lessons').insert({...});
  };

  return ( /* UI code */ );
}
```

**Problems**:

- Cannot unit test business logic separately
- Cannot reuse logic in other components
- Hard to maintain and debug
- No clear separation of responsibilities

#### 2. **Poor Monorepo Utilization**

❌ **Current**: Each app has duplicated logic

- Mobile app has its own validation
- Web app has its own validation
- No shared business logic
- No shared hooks
- No shared services

#### 3. **Direct API Calls in Components**

❌ **Bad Example**: Components directly calling Supabase/Bunny.net

```typescript
const { data } = await supabase.from('courses').select('*');
```

#### 4. **Navigation Mixed with Business Logic**

❌ **Bad Example**: `AuthContext.tsx`

```typescript
// Navigation logic inside authentication logic
if (newProfile?.role === 'trainer') {
  router.replace('/(trainer)/dashboard');
}
```

---

### ✅ Proper Senior-Level Architecture

#### Layered Architecture Pattern

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │  ← Components (UI only)
│         (React Components)              │
├─────────────────────────────────────────┤
│          Application Layer              │  ← Hooks (UI ↔ Business)
│        (Custom React Hooks)             │
├─────────────────────────────────────────┤
│          Business Logic Layer           │  ← Services (Pure logic)
│    (Services, Validators, Models)       │
├─────────────────────────────────────────┤
│          Data Access Layer              │  ← Repositories
│      (Repositories, API Clients)        │
├─────────────────────────────────────────┤
│          Infrastructure Layer           │  ← External APIs
│     (Supabase, Bunny.net, Storage)      │
└─────────────────────────────────────────┘
```

#### Recommended Monorepo Structure

```
packages/
  ├── @repo/core/                 # ✅ Business logic (framework-agnostic)
  │   ├── services/              # Business services
  │   │   ├── lesson.service.ts
  │   │   ├── course.service.ts
  │   │   └── auth.service.ts
  │   ├── models/                # Domain models, DTOs
  │   │   ├── lesson.model.ts
  │   │   ├── course.model.ts
  │   │   └── user.model.ts
  │   ├── validators/            # Validation schemas (Zod)
  │   │   ├── lesson.validator.ts
  │   │   └── course.validator.ts
  │   └── utils/                 # Pure utility functions
  │       ├── file.utils.ts
  │       └── date.utils.ts
  │
  ├── @repo/data/                 # ✅ Data access layer
  │   ├── repositories/          # Data access abstraction
  │   │   ├── lesson.repository.ts
  │   │   ├── course.repository.ts
  │   │   └── base.repository.ts
  │   ├── api/                   # API clients
  │   │   ├── supabase.client.ts
  │   │   └── bunny.client.ts
  │   └── queries/               # Query builders
  │       └── lesson.queries.ts
  │
  ├── @repo/shared/               # ✅ Shared React code
  │   ├── hooks/                 # Shared React hooks
  │   │   ├── useLesson.ts
  │   │   ├── useCourse.ts
  │   │   └── useAuth.ts
  │   ├── constants/             # Shared constants
  │   │   └── app.constants.ts
  │   └── contexts/              # Shared contexts
  │       └── theme.context.ts
  │
  └── @repo/types/                # ✅ Shared types (existing)
      └── database.ts

apps/
  ├── mobile/
  │   ├── app/                   # ✅ UI only - screens/pages
  │   ├── components/            # ✅ Presentational components
  │   └── hooks/                 # ✅ App-specific hooks
  │
  └── admin/
      ├── app/                   # ✅ UI only - pages
      ├── components/            # ✅ Presentational components
      └── hooks/                 # ✅ App-specific hooks
```

---

### 📋 Code Examples: Before & After

#### Example 1: Lesson Creation

##### ❌ BEFORE (Bad - Everything in component)

```typescript
// apps/mobile/app/(trainer)/course/[courseId]/add-lesson.tsx
export default function AddLessonScreen() {
  const handleSubmit = async () => {
    // Validation
    if (!formData.title) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    // Get order index
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingLessons?.length > 0
      ? existingLessons[0].order_index + 1
      : 1;

    // Video upload
    if (videoFile) {
      const bunnyResult = await createBunnyVideo(formData.title);
      const uploadSuccess = await uploadVideoToBunny(...);
    }

    // Create lesson
    await supabase.from('lessons').insert({...});
  };
}
```

##### ✅ AFTER (Good - Separation of concerns)

**1. Validation Schema** (`packages/core/validators/lesson.validator.ts`)

```typescript
import { z } from 'zod';

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  duration_minutes: z.number().optional(),
  is_free: z.boolean().default(false),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
```

**2. Service** (`packages/core/services/lesson.service.ts`)

```typescript
import type { CreateLessonInput } from '../validators/lesson.validator';
import type { LessonRepository } from '@repo/data/repositories/lesson.repository';
import type { VideoService } from './video.service';

export class LessonService {
  constructor(
    private lessonRepo: LessonRepository,
    private videoService: VideoService
  ) {}

  async createLesson(
    courseId: string,
    input: CreateLessonInput,
    videoUri?: string
  ) {
    // Business logic: Calculate order
    const nextOrder = await this.lessonRepo.getNextOrderIndex(courseId);

    // Business logic: Handle video if provided
    let videoData = null;
    if (videoUri) {
      videoData = await this.videoService.uploadVideo(input.title, videoUri);
    }

    // Business logic: Create lesson
    return this.lessonRepo.create({
      course_id: courseId,
      ...input,
      order_index: nextOrder,
      ...videoData,
    });
  }
}
```

**3. Repository** (`packages/data/repositories/lesson.repository.ts`)

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';

export class LessonRepository {
  constructor(private supabase: SupabaseClient) {}

  async getNextOrderIndex(courseId: string): Promise<number> {
    const { data } = await this.supabase
      .from('lessons')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1);

    return data?.[0]?.order_index ? data[0].order_index + 1 : 1;
  }

  async create(lesson: CreateLessonData) {
    const { data, error } = await this.supabase
      .from('lessons')
      .insert(lesson)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
```

**4. Hook** (`packages/shared/hooks/useCreateLesson.ts`)

```typescript
import { useMutation } from '@tanstack/react-query';
import { lessonService } from '@repo/core/services';
import type { CreateLessonInput } from '@repo/core/validators/lesson.validator';

export function useCreateLesson(courseId: string) {
  return useMutation({
    mutationFn: async ({
      input,
      videoUri
    }: {
      input: CreateLessonInput;
      videoUri?: string
    }) => {
      return lessonService.createLesson(courseId, input, videoUri);
    },
  });
}
```

**5. Component** (`apps/mobile/app/(trainer)/course/[courseId]/add-lesson.tsx`)

```typescript
import { useCreateLesson } from '@repo/shared/hooks/useCreateLesson';
import { createLessonSchema } from '@repo/core/validators/lesson.validator';

export default function AddLessonScreen() {
  const { courseId } = useLocalSearchParams();
  const createLesson = useCreateLesson(courseId);

  const handleSubmit = async () => {
    // Only validation (using Zod)
    const result = createLessonSchema.safeParse(formData);
    if (!result.success) {
      Alert.alert('Error', result.error.errors[0].message);
      return;
    }

    // Call the hook - all logic is abstracted
    try {
      await createLesson.mutateAsync({
        input: result.data,
        videoUri: videoFile?.uri,
      });
      router.back();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return ( /* UI only */ );
}
```

---

#### Example 2: Authentication

##### ❌ BEFORE (Bad - Navigation in auth logic)

```typescript
// AuthContext.tsx
const fetchProfile = async (userId: string) => {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();

  setProfile(data);

  // ❌ Navigation logic mixed with data fetching
  if (data?.role === 'trainer') {
    router.replace('/(trainer)/dashboard');
  } else {
    router.replace('/(learner)/courses');
  }
};
```

##### ✅ AFTER (Good - Separation of concerns)

**1. Service** (`packages/core/services/auth.service.ts`)

```typescript
export class AuthService {
  constructor(private profileRepo: ProfileRepository) {}

  async getOrCreateProfile(userId: string): Promise<Profile> {
    try {
      return await this.profileRepo.getById(userId);
    } catch (error) {
      if (error.code === 'PGRST116') {
        return await this.profileRepo.createFromAuth(userId);
      }
      throw error;
    }
  }
}
```

**2. Hook** (`packages/shared/hooks/useAuth.ts`)

```typescript
export function useAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async (userId: string) => {
    const profile = await authService.getOrCreateProfile(userId);
    setProfile(profile);
    return profile; // Return, don't navigate
  };

  return { profile, fetchProfile };
}
```

**3. Component** (`apps/mobile/app/_layout.tsx`)

```typescript
export default function RootLayout() {
  const { profile, fetchProfile } = useAuth();

  useEffect(() => {
    if (session?.user) {
      fetchProfile(session.user.id).then((profile) => {
        // ✅ Navigation logic in UI layer
        if (profile.role === 'trainer') {
          router.replace('/(trainer)/dashboard');
        } else {
          router.replace('/(learner)/courses');
        }
      });
    }
  }, [session]);
}
```

---

### 🎯 Key Principles for Senior-Level Code

#### 1. **Separation of Concerns (SoC)**

- **Components**: Only UI rendering and user interaction
- **Hooks**: Bridge between UI and business logic
- **Services**: Business logic, orchestration
- **Repositories**: Data access only
- **Validators**: Input validation

#### 2. **Dependency Inversion Principle (DIP)**

```typescript
// ❌ Bad: Component depends on concrete implementation
const data = await supabase.from('courses').select('*');

// ✅ Good: Component depends on abstraction (hook/service)
const { data } = useCourses();
```

#### 3. **Single Responsibility Principle (SRP)**

Each file/class should have ONE reason to change:

- `lesson.service.ts` - Lesson business logic
- `lesson.repository.ts` - Lesson data access
- `lesson.validator.ts` - Lesson validation
- `AddLessonScreen.tsx` - Lesson creation UI

#### 4. **Don't Repeat Yourself (DRY)**

```typescript
// ✅ Share logic between web and mobile via monorepo
import { useCreateLesson } from '@repo/shared/hooks/useCreateLesson';

// Used in both apps/mobile and apps/admin
```

#### 5. **Testability**

```typescript
// ✅ Can unit test without React
describe('LessonService', () => {
  it('should calculate next order index', async () => {
    const service = new LessonService(mockRepo, mockVideoService);
    const order = await service.getNextOrderIndex('course-1');
    expect(order).toBe(2);
  });
});
```

#### 6. **Type Safety**

```typescript
// ✅ Strong typing throughout
export interface CreateLessonInput {
  title: string;
  description?: string;
  duration_minutes?: number;
}

// Auto-complete and type checking everywhere
```

---

### 📊 Architecture Decision Records (ADRs)

#### ADR-001: Use Service Layer Pattern

**Status**: RECOMMENDED

**Context**: Components currently mix UI with business logic

**Decision**: Implement service layer in `packages/core/services/`

**Consequences**:

- ✅ Business logic is reusable
- ✅ Can unit test without UI
- ✅ Clear separation of concerns
- ⚠️ More files to manage

#### ADR-002: Use Repository Pattern

**Status**: RECOMMENDED

**Context**: Direct Supabase calls scattered everywhere

**Decision**: Implement repository layer in `packages/data/repositories/`

**Consequences**:

- ✅ Can swap data source without changing business logic
- ✅ Consistent error handling
- ✅ Type-safe data access
- ⚠️ Additional abstraction layer

#### ADR-003: Use React Query for Server State

**Status**: RECOMMENDED

**Context**: No caching, refetching, or loading state management

**Decision**: Use TanStack Query (React Query) for all server state

**Consequences**:

- ✅ Automatic caching and refetching
- ✅ Optimistic updates
- ✅ Better UX with loading/error states
- ⚠️ New dependency to learn

#### ADR-004: Zod for Runtime Validation

**Status**: RECOMMENDED

**Context**: Inline validation logic scattered in components

**Decision**: Use Zod schemas in `packages/core/validators/`

**Consequences**:

- ✅ Type-safe validation
- ✅ Reusable schemas
- ✅ Runtime type checking
- ✅ Better error messages

---

### 🚀 Migration Strategy

#### Phase 1: Set Up Infrastructure (Week 1)

1. Create new packages:

   ```bash
   mkdir -p packages/core/{services,models,validators,utils}
   mkdir -p packages/data/{repositories,api,queries}
   mkdir -p packages/shared/hooks
   ```

2. Install dependencies:

   ```bash
   pnpm add @tanstack/react-query zod
   ```

3. Set up base classes and utilities

#### Phase 2: Extract Business Logic (Week 2-3)

1. Start with one domain (e.g., Lessons)
2. Create service: `packages/core/services/lesson.service.ts`
3. Create repository: `packages/data/repositories/lesson.repository.ts`
4. Create validators: `packages/core/validators/lesson.validator.ts`
5. Create hook: `packages/shared/hooks/useLesson.ts`

#### Phase 3: Refactor Components (Week 4-5)

1. Update one component at a time
2. Use new hooks instead of direct API calls
3. Remove business logic from components
4. Add proper error handling

#### Phase 4: Add Tests (Week 6)

1. Unit tests for services
2. Integration tests for repositories
3. Component tests with mocked hooks

---

### ✅ Code Review Checklist

Before merging any code, ensure:

- [ ] **No business logic in components** - Only UI code
- [ ] **No direct API calls in components** - Use hooks
- [ ] **Validation uses Zod schemas** - No inline validation
- [ ] **Shared logic in packages/** - Not duplicated
- [ ] **Services are framework-agnostic** - Pure TypeScript
- [ ] **Types are exported from @repo/types** - Single source
- [ ] **Error handling is consistent** - Use error boundaries
- [ ] **No magic strings/numbers** - Use constants
- [ ] **Functions are pure when possible** - No side effects
- [ ] **Code is testable** - Can be unit tested

---

### 📚 Required Reading for Contributors

1. **Clean Architecture** by Robert C. Martin
2. **Domain-Driven Design** by Eric Evans
3. **Refactoring** by Martin Fowler
4. **TanStack Query Docs**: <https://tanstack.com/query/latest>
5. **Zod Documentation**: <https://zod.dev>

---

**Last Updated**: January 30, 2026
**Document Version**: 2.0
****
