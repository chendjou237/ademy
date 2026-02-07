# Technology Stack

## Build System
- **Monorepo**: Turborepo for workspace management
- **Package Manager**: pnpm (v9.0.0)
- **Node Version**: >=18

## Applications

### Admin Web App (`apps/admin`)
- **Framework**: Next.js 16.0.0 (App Router)
- **UI**: Radix UI + Tailwind CSS 4.x
- **State**: React Context
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)

### Mobile App (`apps/mobile`)
- **Framework**: Expo ~54.0 + React Native 0.81.5
- **Navigation**: React Navigation v7
- **UI**: Custom components + React Native Elements
- **Video**: Expo AV
- **i18n**: i18n-js

### Docs App (`apps/docs`)
- **Framework**: Next.js (documentation site)

## Shared Packages
- `@repo/types`: Shared TypeScript types for database entities
- `@repo/ui`: Shared React components
- `@repo/eslint-config`: ESLint configurations
- `@repo/typescript-config`: TypeScript configurations

## Backend Services
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with RLS policies
- **Video Hosting**: Bunny.net Stream (Library ID: 527238)
- **File Storage**: Bunny.net CDN
- **Payment**: PayUnit (mobile app)

## Key Libraries
- **Forms**: react-hook-form + zod validation
- **Video Upload**: tus-js-client (TUS protocol)
- **Styling**: Tailwind CSS 4.x, tailwind-merge, class-variance-authority
- **Icons**: lucide-react (web), @expo/vector-icons (mobile)
- **Date**: date-fns

## Common Commands

### Development
```bash
# Start all apps in dev mode
pnpm dev

# Start specific app
pnpm dev --filter=admin
pnpm dev --filter=mobile

# Mobile app specific
cd apps/mobile
pnpm ios          # iOS simulator
pnpm android      # Android emulator
```

### Building
```bash
# Build all apps
pnpm build

# Build specific app
pnpm build --filter=admin
```

### Code Quality
```bash
# Lint all packages
pnpm lint

# Type checking
pnpm check-types

# Format code
pnpm format
```

### Testing
```bash
# Run tests (when implemented)
pnpm test

# Run tests for specific package
pnpm test --filter=admin
```

## Environment Variables

### Admin App
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `BUNNY_API_KEY`: Bunny.net API key
- `BUNNY_LIBRARY_ID`: Bunny.net library ID (527238)
- `BUNNY_PULLZONE_NAME`: Bunny.net pull zone (vz-ca5a508d-fcd)

### Mobile App
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_BUNNY_LIBRARY_ID`: Bunny.net library ID

## Video Integration
- **Protocol**: TUS (resumable uploads)
- **Storage**: Bunny.net Stream
- **Format**: `bunny://LIBRARY_ID/VIDEO_ID`
- **Playback**: `https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID`
- **Status**: queued → processing → encoding → finished

## Currency & Localization
- **Default Language**: French (fr)
- **Secondary**: English (en)
- **Currency**: XAF (Central African CFA Franc)
- **No decimal places** for XAF amounts
