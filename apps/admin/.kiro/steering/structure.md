---
inclusion: always
---

# Project Structure

## Directory Organization

```
/app                    # Next.js App Router pages and API routes
  /admin               # Admin dashboard and management pages
  /api                 # API route handlers
    /videos            # Video upload and status endpoints
  /auth                # Authentication pages (login, signup)
  /courses             # Public course browsing
  /dashboard           # General dashboard
  /learner             # Learner-specific pages
  /trainer             # Trainer-specific pages

/components            # React components
  /admin               # Admin-specific components
  /auth                # Authentication forms
  /courses             # Course-related components
  /learner             # Learner-specific components (video player, nav)
  /trainer             # Trainer-specific components (course forms, video upload)
  /ui                  # shadcn/ui components (buttons, dialogs, etc.)

/lib                   # Utility libraries and helpers
  /bunny               # Bunny.net video integration utilities
  /supabase            # Supabase client configuration

/scripts               # Database migration scripts
/public                # Static assets (images, placeholders)
/styles                # Global CSS files
```

## Key Conventions

### File Naming
- **Pages**: `page.tsx` (Next.js App Router convention)
- **Loading states**: `loading.tsx`
- **Components**: kebab-case (e.g., `video-upload.tsx`)
- **API routes**: `route.ts`

### Component Structure
- Client components use `"use client"` directive
- Server components by default (no directive needed)
- UI components in `/components/ui` follow shadcn/ui patterns

### Path Aliases
- `@/*` maps to project root (configured in `tsconfig.json`)
- Example: `import { Button } from "@/components/ui/button"`

### Authentication & Authorization
- Middleware (`middleware.ts`) protects routes: `/dashboard`, `/trainer`, `/learner`, `/admin`
- Supabase RLS policies enforce database-level security
- User profiles stored in `public.profiles` table, linked to `auth.users`

### Database Schema
- **profiles**: User information and roles
- **courses**: Course metadata (title, description, price, trainer)
- **lessons**: Individual lessons with video URLs and ordering
- **enrollments**: Learner-course relationships
- **lesson_progress**: Per-lesson completion tracking

### Video URL Formats
- **Bunny Stream**: `bunny://LIBRARY_ID/VIDEO_ID`
- **External**: Standard URLs (YouTube, Vimeo, etc.)
- Parsed and rendered by `BunnyVideoPlayer` component

### API Route Patterns
- All video API routes in `/app/api/videos/`
- Use Next.js route handlers with `POST`, `GET` methods
- Server-side only (access to environment variables)
- Return JSON responses with proper error handling
