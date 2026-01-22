---
inclusion: always
---

# Tech Stack

## Framework & Runtime

- **Next.js 16** (App Router) - React framework with server-side rendering
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript

## Styling & UI

- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Headless UI components for accessibility
- **shadcn/ui** - Pre-built component library built on Radix UI
- **Lucide React** - Icon library
- **next-themes** - Dark mode support

## Backend & Database

- **Supabase** - PostgreSQL database with authentication and Row Level Security (RLS)
- **@supabase/ssr** - Server-side Supabase client for Next.js
- **Supabase Auth** - User authentication and session management

## Video & Media

- **Bunny.net Stream** - Video hosting, transcoding, and CDN delivery
- **tus-js-client** - Resumable file uploads via TUS protocol

## Form Handling & Validation

- **react-hook-form** - Form state management
- **zod** - Schema validation
- **@hookform/resolvers** - Integration between react-hook-form and zod

## Common Commands

```bash
# Development
pnpm dev              # Start development server on localhost:3000

# Building
pnpm build            # Create production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
```

## Environment Variables

Required in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `BUNNY_LIBRARY_ID` - Bunny.net Stream library ID
- `BUNNY_API_KEY` - Bunny.net API key (server-side only)

## Build Configuration

- **ESLint**: Errors ignored during builds (`ignoreDuringBuilds: true`)
- **TypeScript**: Build errors ignored (`ignoreBuildErrors: true`)
- **Images**: Unoptimized for compatibility
