# Project Structure

## Monorepo Organization

```
ademy/
├── apps/                    # Application packages
│   ├── admin/              # Next.js admin web app
│   ├── mobile/             # Expo React Native app
│   └── docs/               # Documentation site
├── packages/               # Shared packages
│   ├── types/             # Shared TypeScript types
│   ├── ui/                # Shared React components
│   ├── eslint-config/     # ESLint configurations
│   └── typescript-config/ # TypeScript configurations
└── .kiro/                 # Kiro AI configuration
    └── steering/          # AI steering rules
```

## Admin App Structure (`apps/admin`)

```
admin/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── admin/             # Admin dashboard routes
│   ├── trainer/           # Trainer dashboard routes
│   ├── learner/           # Learner dashboard routes
│   ├── courses/           # Public course browsing
│   └── api/               # API routes
│       ├── videos/        # Video management endpoints
│       └── lessons/       # Lesson management endpoints
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── trainer/          # Trainer-specific components
│   ├── learner/          # Learner-specific components
│   ├── auth/             # Authentication components
│   ├── courses/          # Course components
│   └── ui/               # Reusable UI components (Radix)
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase client/server setup
│   ├── bunny/            # Bunny.net integration
│   ├── demo/             # Demo mode functionality
│   └── i18n/             # Internationalization
├── scripts/              # Database migration scripts
└── public/               # Static assets
```

## Mobile App Structure (`apps/mobile`)

```
mobile/
├── app/                   # Expo Router file-based routing
│   ├── (auth)/           # Auth screens (login, signup)
│   ├── (learner)/        # Learner screens
│   ├── (trainer)/        # Trainer screens
│   └── (tabs)/           # Tab navigation screens
├── components/           # React Native components
│   └── ui/              # Reusable UI components
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   ├── I18nContext.tsx  # Internationalization
│   └── ThemeContext.tsx # Theme management
├── services/            # API services
│   ├── demoService.ts   # Demo mode
│   └── payunitService.ts # Payment integration
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client
│   └── bunny.ts         # Bunny.net integration
├── locales/             # Translation files
│   ├── en.json
│   └── fr.json
├── theme/               # Theme configuration
└── assets/              # Images, fonts, icons
```

## Shared Types Package (`packages/types`)

```
types/src/
├── database.ts          # Database entity types
├── api.ts              # API request/response types
└── index.ts            # Exports
```

### Key Type Definitions
- **UserRole**: 'admin' | 'trainer' | 'learner'
- **CourseLevel**: 'beginner' | 'intermediate' | 'advanced'
- **VideoStatus**: 'queued' | 'processing' | 'encoding' | 'finished' | 'failed'
- **PaymentStatus**: 'FREE' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

### Database Entities
- Profile, Course, Lesson, Enrollment, LessonProgress, PaymentTransaction

## Routing Patterns

### Admin Web App (Next.js App Router)
- `/auth/login` - Login page
- `/auth/signup` - Signup page
- `/courses` - Public course listing
- `/courses/[id]` - Course detail page
- `/admin/*` - Admin dashboard routes
- `/trainer/*` - Trainer dashboard routes
- `/learner/*` - Learner dashboard routes
- `/api/*` - API endpoints

### Mobile App (Expo Router)
- `/(auth)/login` - Login screen
- `/(auth)/signup` - Signup screen
- `/(learner)/courses` - Browse courses
- `/(learner)/my-courses` - Enrolled courses
- `/(learner)/course/[id]` - Course detail
- `/(learner)/lesson/[id]` - Lesson player
- `/(trainer)/dashboard` - Trainer dashboard
- `/(trainer)/my-courses` - Created courses
- `/(trainer)/create-course` - Create course form

## Database Schema

### Core Tables
- **profiles**: User profiles with role-based access
- **courses**: Course metadata and settings
- **lessons**: Video lessons with Bunny.net references
- **enrollments**: Learner course enrollments
- **lesson_progress**: Individual lesson completion tracking
- **payment_transactions**: Payment records (mobile app)

### Relationships
- Profile → Courses (trainer_id)
- Course → Lessons (course_id)
- Profile → Enrollments (learner_id)
- Course → Enrollments (course_id)
- Enrollment → LessonProgress (enrollment_id)
- Lesson → LessonProgress (lesson_id)

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `CourseCard.tsx`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **Routes**: kebab-case folders (e.g., `my-courses/`)
- **Types**: PascalCase interfaces (e.g., `Course`, `Profile`)

### Code
- **React Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **Database tables**: snake_case

## Import Patterns

### Workspace Imports
```typescript
// Shared types
import { Course, Profile } from '@repo/types'

// Shared UI components
import { Button, Card } from '@repo/ui'
```

### Relative Imports
```typescript
// Prefer absolute imports from app root
import { supabase } from '@/lib/supabase/client'
import { CourseCard } from '@/components/courses/course-card'
```

## Configuration Files

### Root Level
- `turbo.json` - Turborepo configuration
- `pnpm-workspace.yaml` - pnpm workspace definition
- `package.json` - Root package scripts

### App Level
- `next.config.mjs` - Next.js configuration (admin)
- `app.json` - Expo configuration (mobile)
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `tailwind.config.ts` - Tailwind configuration (admin)

## Special Directories

### `.kiro/`
- AI assistant configuration and steering rules
- Spec files for feature development

### `scripts/`
- Database migration SQL files
- Setup and utility scripts

### `migrations/`
- Database schema changes (mobile app)

### `references/`
- Reference implementations and examples (mobile app)
