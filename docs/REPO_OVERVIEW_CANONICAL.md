# Ademy Repository - Canonical Overview (Docs Reconciled)

This document consolidates and reconciles information across `docs/` into a single, up-to-date reference. Where source docs conflict, the corrected position is stated explicitly.

## Scope
- Monorepo structure, apps, shared packages
- Core domain model (Supabase)
- Video system (Bunny.net)
- Payments (PayUnit)
- Auth, profile creation, lesson completion
- Storage and thumbnails
- Demo mode
- Deployment and networking
- Known doc drift and corrections

## Monorepo Architecture
- Turborepo + pnpm workspaces
- Root apps
- `apps/admin`: Next.js 16 App Router web dashboard for admins, trainers, learners
- `apps/mobile`: Expo ~54 app for learners and trainers
- Shared packages: `packages/ui`, `packages/eslint-config`, `packages/typescript-config`, `packages/types`
- Node version: >= 18

Primary references: `docs/STEERING.md`, `docs/FOUNDATION_README.md`.

## Apps
### Admin App (Web)
- Tech: Next.js 16, React 19, Tailwind CSS 4, Radix, shadcn/ui, Supabase SSR auth, Recharts, next-intl.
- Responsibilities: role-based access (admin/trainer/learner), course CRUD, lesson management, Bunny video upload, enrollments, user management, analytics.
- API routes in `apps/admin/app/api/...` support video and payment operations.

Primary references: `docs/STEERING.md`, `docs/BUNNY_INTEGRATION.md`, `docs/WEB_PAYMENT_IMPLEMENTATION.md`.

### Mobile App
- Tech: Expo ~54, React Native 0.81, Expo Router, i18n-js, Expo AV, Supabase auth.
- Responsibilities: learners browse/enroll/watch/track; trainers create/manage courses and lessons.

Primary references: `docs/STEERING.md`, `docs/FOUNDATION_README.md`, `docs/COURSE_MANAGEMENT_README.md`.

## Shared Types
- Shared types live in `packages/types` and are imported as `@repo/types` and `@repo/types/api`.
- Mobile app is already migrated to shared types.
- Admin app migration is planned or partially done depending on file.

Primary references: `docs/MIGRATION_SHARED_TYPES.md`, `docs/SHARED_TYPES_SUMMARY.md`.

## Database Model (Supabase)
Core tables:
- `profiles`: user identity and role metadata.
- `courses`: course metadata including price, level, publish status, thumbnail URL.
- `lessons`: video metadata; includes Bunny fields and status.
- `enrollments`: learner-course relationship; includes payment metadata when paid.
- `lesson_progress`: completion per lesson per enrollment; unique on `(enrollment_id, lesson_id)`.
- `payment_transactions`: PayUnit transaction tracking.

Primary references: `docs/STEERING.md`, `docs/COURSE_MANAGEMENT_README.md`, `docs/PAYMENT_SYSTEM_COMPLETE.md`.

## Video System (Bunny.net)
### Storage Format
- Lessons store `video_url` as `bunny://LIBRARY_ID/VIDEO_ID`.
- Playback uses iframe embed: `https://iframe.mediadelivery.net/embed/{LIBRARY_ID}/{VIDEO_ID}`.

### Upload Flow (Admin)
1. Trainer initiates upload in UI.
2. `POST /api/videos/create` to Bunny Stream.
3. `POST /api/videos/upload-url` for TUS credentials.
4. Direct TUS upload to Bunny CDN.
5. Store `bunny://...` in Supabase lessons.
6. Bunny processes video, status tracked.

### Status Lifecycle
- `queued`, `processing`, `encoding`, `finished`, `failed`.

Primary references: `docs/BUNNY_INTEGRATION.md`, `docs/IMPLEMENTATION_SUMMARY.md`, `docs/QUICK_REFERENCE.md`.

## Payments (PayUnit)
### Architecture
- Payment processing is centralized in the admin app.
- Mobile app and web UI call admin API endpoints.

### Endpoints
- `POST /api/payments/initialize`
- `GET /api/payments/status/[transactionId]`
- `POST /api/payments/complete`
- `POST /api/payments/webhook` (future)

### Polling
- Web and mobile poll status every 3 seconds.
- Auto-close modal/webview on `SUCCESS`.
- Handles `FAILED`, `CANCELLED`, `PENDING`.

Primary references: `docs/PAYMENT_SYSTEM_COMPLETE.md`, `docs/WEB_PAYMENT_IMPLEMENTATION.md`, `docs/PAYMENT_STATUS_POLLING.md`.

## Authentication and Profiles
- Supabase email/password auth with role-based access.
- Profile creation uses DB trigger `handle_new_user` plus code fallback with `upsert`.
- Lesson completion uses `upsert` on `(enrollment_id, lesson_id)` to avoid race conditions.

Primary references: `docs/PROFILE_CREATION_SETUP.md`, `docs/LESSON_COMPLETION_FIX.md`.

## Storage and Thumbnails
- Course thumbnails uploaded to Supabase Storage with RLS policies.
- Two bucket names appear in docs; the newer setup uses bucket `ademy`.

Primary references: `docs/COURSE_THUMBNAIL_UPLOAD.md`, `docs/STORAGE_BUCKET_SETUP.md`.

## Demo Mode
- Admin app demo mode: `apps/admin/lib/demo/data.ts` with mock services.
- Mobile app demo mode: `config/demo.ts` with partial integration.

Primary references: `docs/DEMO_MODE.md`, `docs/DEMO_MODE_ADMIN_SUMMARY.md`, `docs/DEMO_SYSTEM_README.md`.

## Deployment and Networking
- Admin app deployed to Vercel; pnpm 8.6.12 recommended.
- Mobile app must use LAN IP instead of `localhost` for admin API.

Primary references: `docs/VERCEL_DEPLOYMENT.md`, `docs/NETWORK_SETUP.md`, `docs/QUICK_FIX_NETWORK_ERROR.md`.

## Corrections and Doc Drift
These are the authoritative corrections when documents conflict:

1. PayUnit base URL
- Correct: `https://gateway.payunit.net` (no `/api` prefix).
- Source of truth: `docs/PAYUNIT_ENDPOINT_FIX.md`.

2. Mobile payment env vars
- Current: `EXPO_PUBLIC_ADMIN_API_URL` only; PayUnit credentials are server-side.
- Source of truth: `docs/PAYMENT_SYSTEM_COMPLETE.md`, `docs/MOBILE_APP_UPDATES.md`.

3. Web payment auth
- Web uses cookie-based auth; mobile uses bearer token.
- Source of truth: `docs/WEB_PAYMENT_AUTH_FIX.md`.

4. Mobile app architecture
- Canonical: Expo Router and custom design system (not legacy React Navigation stack).
- Source of truth: `docs/FOUNDATION_README.md`, `docs/STEERING.md`.

5. Storage bucket
- Current bucket name appears to be `ademy` (with migration from `course-thumbnails`).
- Source of truth: `docs/STORAGE_BUCKET_SETUP.md`.

## Empty or Placeholder Docs
- `docs/PAYMENT_IMPLEMENTATION_SUMMARY.md` is empty.
- `docs/VERCEL_DEPLOYMENT_GUIDE.md` is empty.

## Recommended Next Steps (If You Want Cleanup)
- Align `docs/PAYMENT_INTEGRATION_README.md` with current architecture and endpoints.
- Update `docs/MOBILE_APP_DOCUMENTATION.md` to reflect Expo Router and new payment flow.
- Remove or replace empty documents.
- Add a single index document that points to canonical sources.
