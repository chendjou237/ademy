# Ademy Platform - Project Steering Document

> **Last Updated**: January 22, 2026
> **Project Type**: Turborepo Monorepo
> **Primary Stack**: Next.js (Admin) + Expo React Native (Mobile)

---

## 🎯 Project Overview

**Ademy** is an African-focused online learning platform that connects trainers with learners. The platform enables African trainers to create and monetize video-based courses while providing learners access to quality educational content.

### Core Value Proposition
- 🎓 African trainers create and monetize courses
- 📚 Learners access quality education content
- 🎥 Video-based learning with progress tracking
- 🌍 Multi-language support (French/English)
- 💰 XAF currency integration (Central African CFA Franc)

### Target Users
- **Trainers**: Create courses, upload videos, manage content, view analytics
- **Learners**: Browse courses, watch videos, track progress
- **Admins**: Manage users, courses, enrollments (via admin dashboard)

---

## 🏗️ Architecture

### Monorepo Structure (Turborepo)

```
ademy/
├── apps/
│   ├── admin/          # Next.js admin/trainer/learner dashboard
│   └── mobile/         # Expo React Native mobile app
├── packages/
│   ├── ui/             # Shared React components
│   ├── eslint-config/  # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── turbo.json          # Turborepo configuration
├── pnpm-workspace.yaml # PNPM workspace configuration
└── package.json        # Root package.json
```

### Package Manager
- **PNPM** (v9.0.0) with workspaces
- **Turborepo** (v2.7.5) for build orchestration

### Node Version
- **Node.js**: >=18

---

## 📱 Applications

### 1. Admin Dashboard (`apps/admin`)

**Framework**: Next.js 16.0.0 (App Router)
**Purpose**: Web-based dashboard for admins, trainers, and learners

#### Tech Stack
- **Frontend**: React 19.2.0, TypeScript 5
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI, shadcn/ui patterns
- **Forms**: React Hook Form + Zod validation
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with SSR
- **Video Hosting**: Bunny.net Stream
- **File Uploads**: TUS protocol (resumable uploads)
- **Charts**: Recharts
- **Internationalization**: next-intl

#### Key Features
- ✅ Role-based authentication (Admin, Trainer, Learner)
- ✅ Course management (CRUD operations)
- ✅ Video upload with Bunny.net integration
- ✅ Lesson management with video status tracking
- ✅ Enrollment system
- ✅ User management (admin only)
- ✅ Analytics dashboard
- ✅ Responsive design

#### Directory Structure
```
apps/admin/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin-only routes
│   ├── trainer/           # Trainer routes
│   ├── learner/           # Learner routes
│   ├── courses/           # Public course browsing
│   ├── auth/              # Authentication pages
│   └── api/               # API routes (videos, lessons)
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── trainer/          # Trainer-specific components
│   ├── learner/          # Learner-specific components
│   ├── courses/          # Course-related components
│   ├── auth/             # Authentication components
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client/server setup
│   ├── bunny/            # Bunny.net utilities
│   └── i18n/             # Internationalization
├── scripts/              # Database migrations
│   ├── 01-create-tables.sql
│   └── 02-add-bunny-fields.sql
└── styles/               # Global styles
```

#### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
BUNNY_API_KEY=
BUNNY_LIBRARY_ID=527238
BUNNY_PULLZONE_NAME=vz-ca5a508d-fcd
```

#### Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm check-types  # Type checking
```

---

### 2. Mobile App (`apps/mobile`)

**Framework**: Expo ~54.0.20 with Expo Router
**Purpose**: Native mobile app for learners and trainers

#### Tech Stack
- **Frontend**: React Native 0.81.5, React 19.1.0
- **Routing**: Expo Router 6.0.13 (file-based routing)
- **State Management**: React Context + AsyncStorage
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Video Player**: Expo AV
- **Internationalization**: i18n-js 4.5.1
- **UI Components**: Custom design system

#### Key Features
- ✅ Complete design system with theming
- ✅ Light/Dark mode with persistence
- ✅ French/English internationalization
- ✅ Role-based navigation (Trainer/Learner)
- ✅ Supabase authentication
- ✅ Demo mode for testing (DEMO_MODE flag)
- ✅ File-based routing with Expo Router
- ✅ TypeScript integration

#### Directory Structure
```
apps/mobile/
├── app/                    # Expo Router (file-based routing)
│   ├── (auth)/            # Authentication group
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (learner)/         # Learner role tabs
│   │   ├── courses.tsx
│   │   ├── my-courses.tsx
│   │   └── profile.tsx
│   ├── (trainer)/         # Trainer role tabs
│   │   ├── dashboard.tsx
│   │   ├── my-courses.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Route handler
│   └── demo.tsx           # Design system showcase
├── components/            # React components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── I18nContext.tsx
├── lib/                  # Supabase configuration
├── locales/              # Translation files
│   ├── fr.json
│   └── en.json
├── theme/                # Design system tokens
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
├── config/               # Configuration files
│   └── demo.ts          # Demo/mock data
└── services/            # API services
```

#### Design System
- **Primary Color**: #0070F0 (Blue)
- **Secondary Color**: #00C27A (Green)
- **Typography**: 32px (H1) → 12px (Caption)
- **Spacing**: 4px base unit (xs: 4px → 3xl: 48px)
- **Components**: Button, Input, Card, ProgressBar, Badge, CourseCard

#### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

#### Scripts
```bash
pnpm start        # Start Expo development server
pnpm android      # Run on Android
pnpm ios          # Run on iOS
pnpm web          # Run on web
pnpm lint         # Run ESLint
```

#### Demo Mode
The mobile app includes a comprehensive demo mode for testing without a backend:
- Set `DEMO_MODE = true` in `config/demo.ts`
- Includes mock users, courses, lessons, enrollments
- Demo credentials: `trainer@demo.com` / `learner@demo.com` (password: `demo123`)

---

## 🗄️ Database Schema (Supabase)

### Core Tables

#### 1. `profiles`
```sql
- id: UUID (references auth.users)
- email: TEXT
- full_name: TEXT
- role: TEXT ('trainer' | 'learner' | 'admin')
- avatar_url: TEXT
- bio: TEXT
- phone_number: TEXT
- mobile_money_provider: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 2. `courses`
```sql
- id: UUID
- trainer_id: UUID (references profiles)
- title: TEXT
- description: TEXT
- thumbnail_url: TEXT
- price: DECIMAL (XAF)
- category: TEXT
- level: TEXT ('beginner' | 'intermediate' | 'advanced')
- is_published: BOOLEAN
- is_free: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 3. `lessons`
```sql
- id: UUID
- course_id: UUID (references courses)
- title: TEXT
- description: TEXT
- video_url: TEXT (format: bunny://LIBRARY_ID/VIDEO_ID)
- bunny_video_id: TEXT
- bunny_library_id: TEXT
- video_status: TEXT ('queued' | 'processing' | 'encoding' | 'finished' | 'failed')
- thumbnail_url: TEXT
- duration_minutes: INTEGER
- order_index: INTEGER
- is_free: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### 4. `enrollments`
```sql
- id: UUID
- learner_id: UUID (references profiles)
- course_id: UUID (references courses)
- enrolled_at: TIMESTAMPTZ
- progress: INTEGER (0-100)
- UNIQUE(learner_id, course_id)
```

#### 5. `lesson_progress`
```sql
- id: UUID
- enrollment_id: UUID (references enrollments)
- lesson_id: UUID (references lessons)
- completed: BOOLEAN
- completed_at: TIMESTAMPTZ
- UNIQUE(enrollment_id, lesson_id)
```

### Migrations
Located in `apps/admin/scripts/`:
- `01-create-tables.sql` - Initial schema
- `02-add-bunny-fields.sql` - Bunny.net integration fields

---

## 🎥 Video Integration (Bunny.net Stream)

### Configuration
- **Library ID**: 527238
- **Pull Zone**: vz-ca5a508d-fcd
- **Upload Protocol**: TUS (resumable uploads)
- **Streaming**: HLS adaptive bitrate

### Video URL Format
```
Storage: bunny://LIBRARY_ID/VIDEO_ID
Example: bunny://527238/a1b2c3d4-e5f6-7890-abcd-ef1234567890

Playback: https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID
```

### API Endpoints (Admin App)
- `POST /api/videos/create` - Create video in Bunny Stream
- `POST /api/videos/upload-url` - Get TUS upload credentials
- `GET /api/videos/status/[videoId]` - Check processing status
- `POST /api/videos/find-recent` - Find recently uploaded video
- `PATCH /api/lessons/[lessonId]/update-status` - Update lesson status

### Upload Flow
1. Trainer selects video file
2. Validate file (type, size ≤ 5GB)
3. Create video in Bunny Stream
4. Get TUS upload credentials
5. Upload directly to Bunny CDN with progress tracking
6. Save `bunny://LIBRARY_ID/VIDEO_ID` to Supabase
7. Bunny processes video (1-5 minutes)
8. Video ready for playback

---

## 🌍 Internationalization

### Supported Languages
- **French (fr)**: Default language
- **English (en)**: Secondary language

### Currency
- **XAF**: Central African CFA Franc

### Implementation
- **Admin App**: next-intl
- **Mobile App**: i18n-js

### Translation Structure
```json
{
  "nav": { "courses": "Cours" },
  "auth": { "signIn": "Se connecter" },
  "course": { "enrollNow": "S'inscrire maintenant" },
  "common": { "loading": "Chargement..." }
}
```

---

## 👥 User Roles & Permissions

### Admin
- Manage all users
- Manage all courses
- View all enrollments
- Access analytics dashboard
- Full system access

### Trainer
- Create and manage own courses
- Upload video lessons
- Set course pricing (XAF)
- Publish/unpublish courses
- View enrollment statistics
- Track revenue

### Learner
- Browse published courses
- Enroll in courses (free/paid)
- Watch video lessons
- Track learning progress
- Mark lessons as complete

---

## 🚀 Development Workflow

### Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Set Up Environment Variables**
   - Copy `.env.example` to `.env` in each app
   - Add Supabase credentials
   - Add Bunny.net credentials (admin only)

3. **Run Database Migrations**
   ```bash
   # Execute SQL scripts in Supabase dashboard
   apps/admin/scripts/01-create-tables.sql
   apps/admin/scripts/02-add-bunny-fields.sql
   ```

4. **Start Development**
   ```bash
   # All apps
   pnpm dev

   # Specific app
   pnpm dev --filter=admin
   pnpm dev --filter=mobile
   ```

### Turborepo Commands

```bash
# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Type check all apps
pnpm check-types

# Format code
pnpm format
```

### Port Configuration
- **Admin App**: http://localhost:3001 (default Next.js port)
- **Mobile App**: Expo DevTools (varies)

---

## 📝 Coding Standards

### TypeScript
- ✅ Strict mode enabled
- ✅ Full type safety required
- ✅ No `any` types (use `unknown` if needed)
- ✅ Interfaces for data models

### React
- ✅ Functional components only
- ✅ Hooks for state management
- ✅ Context for global state
- ✅ Server Components (Next.js) where possible

### Naming Conventions
- **Components**: PascalCase (`CourseCard.tsx`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **Constants**: UPPER_SNAKE_CASE (`DEMO_MODE`)
- **Types**: PascalCase with `Type` suffix (`CourseType`)

### File Organization
- **Components**: One component per file
- **Utilities**: Group related functions
- **Types**: Co-locate with usage or in `types/`
- **Styles**: Tailwind classes (admin), StyleSheet (mobile)

---

## 🔐 Authentication & Security

### Supabase Auth
- Email/password authentication
- Role-based access control (RLS)
- Session persistence (cookies for web, AsyncStorage for mobile)
- Server-side authentication (Next.js)

### Security Best Practices
- ✅ API keys stored server-side only
- ✅ Row-level security (RLS) enabled
- ✅ Role verification on all protected routes
- ✅ File validation (type, size)
- ✅ HTTPS only in production

---

## 📚 Documentation

### Admin App Documentation
- `IMPLEMENTATION_SUMMARY.md` - Bunny.net integration overview
- `BUNNY_INTEGRATION.md` - Full technical documentation
- `SETUP_BUNNY.md` - Setup instructions
- `QUICK_REFERENCE.md` - Quick reference guide
- `README_BUNNY.md` - Getting started with video
- `DEPLOYMENT_CHECKLIST.md` - Production deployment guide

### Mobile App Documentation
- `MOBILE_APP_DOCUMENTATION.md` - Complete mobile app guide
- `FOUNDATION_README.md` - Foundation architecture
- `COURSE_MANAGEMENT_README.md` - Course management guide
- `DEMO_SYSTEM_README.md` - Demo mode documentation

---

## 🎯 Current Status

### ✅ Completed Features
- [x] Turborepo monorepo setup
- [x] Admin dashboard with role-based access
- [x] Mobile app foundation with design system
- [x] Supabase authentication (both apps)
- [x] Course management (CRUD)
- [x] Video upload with Bunny.net
- [x] Lesson management
- [x] Enrollment system
- [x] Progress tracking
- [x] Internationalization (FR/EN)
- [x] Demo mode (mobile)
- [x] TypeScript integration

### 🚧 In Progress / Planned
- [ ] Payment integration (XAF)
- [ ] Mobile video player integration
- [ ] Push notifications
- [ ] Offline support (mobile)
- [ ] Advanced analytics
- [ ] Search and filtering
- [ ] User reviews and ratings
- [ ] Certificate generation

---

## 🐛 Known Issues & Limitations

### Admin App
- Max video upload: 5GB per file
- Video processing time: 1-5 minutes
- Browser support: Modern browsers only

### Mobile App
- Demo mode active by default (`DEMO_MODE = true`)
- Video player not yet integrated with Bunny.net
- Offline support not implemented

---

## 📦 Dependencies Management

### Shared Dependencies
Managed at workspace root:
- `typescript`: 5.9.2
- `prettier`: ^3.7.4
- `turbo`: ^2.7.5

### App-Specific Dependencies
Each app manages its own dependencies in `package.json`

### Updating Dependencies
```bash
# Update all workspaces
pnpm update -r

# Update specific workspace
pnpm update --filter=admin
```

---

## 🚀 Deployment

### Admin App (Vercel)
- Platform: Vercel
- Build command: `pnpm build`
- Output directory: `.next`
- Environment variables: Set in Vercel dashboard

### Mobile App (Expo)
- Platform: Expo Application Services (EAS)
- Build: `eas build`
- Submit: `eas submit`
- Update: `eas update`

---

## 💡 Best Practices

### Performance
- Use Next.js Image component for images
- Implement lazy loading for heavy components
- Optimize video delivery with Bunny.net CDN
- Cache API responses where appropriate

### Accessibility
- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Proper contrast ratios

### Testing
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Manual testing on multiple devices

---

## 📞 Support & Resources

### External Services
- **Supabase**: https://supabase.com/docs
- **Bunny.net**: https://docs.bunny.net
- **Expo**: https://docs.expo.dev
- **Next.js**: https://nextjs.org/docs
- **Turborepo**: https://turbo.build/repo/docs

### Internal Documentation
- See individual app README files
- Check `docs/` directories in each app
- Review code comments for complex logic

---

## 🎉 Quick Start Checklist

- [ ] Clone repository
- [ ] Install PNPM globally
- [ ] Run `pnpm install`
- [ ] Set up Supabase project
- [ ] Add environment variables
- [ ] Run database migrations
- [ ] Start development servers
- [ ] Test authentication flow
- [ ] Upload test video (admin)
- [ ] Test mobile app in Expo Go

---

**Built with ❤️ for African Education**

*This steering document is a living document. Update it as the project evolves.*
