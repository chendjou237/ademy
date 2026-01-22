# Project Structure

## File-Based Routing (app/ directory)
Expo Router uses file-based routing with role-based organization:

```
app/
├── _layout.tsx              # Root layout with providers
├── index.tsx                # Landing/redirect page
├── (auth)/                  # Authentication screens
│   ├── _layout.tsx          # Auth stack layout
│   ├── login.tsx            # Login screen
│   └── signup.tsx           # Registration screen
├── (learner)/               # Learner-specific screens
│   ├── _layout.tsx          # Learner tab navigation
│   ├── courses.tsx          # Browse courses
│   ├── my-courses.tsx       # Enrolled courses
│   ├── profile.tsx          # Learner profile
│   ├── course/[id].tsx      # Course detail view
│   └── lesson/[id].tsx      # Lesson player
├── (trainer)/               # Trainer-specific screens
│   ├── _layout.tsx          # Trainer tab navigation
│   ├── dashboard.tsx        # Trainer dashboard
│   ├── create-course.tsx    # Course creation
│   ├── my-courses.tsx       # Created courses
│   ├── profile.tsx          # Trainer profile
│   └── course/             # Course management
└── (tabs)/                  # Shared tab screens
```

## Component Organization

### UI Components (`components/ui/`)
Reusable design system components:
- `AppText.tsx` - Typography component with theme integration
- `Button.tsx` - Styled button variants
- `Card.tsx` - Container component
- `Input.tsx` - Form input component
- `ProgressBar.tsx` - Progress visualization
- `Badge.tsx` - Status indicators

### Feature Components (`components/`)
Business logic components:
- `CourseCard.tsx` - Course display card
- `EnrolledCourseCard.tsx` - Learner course card
- `TrainerCourseCard.tsx` - Trainer course management card
- `LessonCard.tsx` - Lesson list item
- `VideoPlayer.tsx` - Bunny.net video player wrapper
- `LoadingScreen.tsx` - Loading state component

## Context Providers (`contexts/`)
Global state management:
- `AuthContext.tsx` - User authentication and profile management
- `ThemeContext.tsx` - Dark/light theme switching
- `I18nContext.tsx` - Internationalization and language switching

## Theme System (`theme/`)
Centralized design tokens:
- `index.ts` - Theme composition and exports
- `colors.ts` - Color palette (light/dark variants)
- `typography.ts` - Font sizes, weights, and styles
- `spacing.ts` - Margins, padding, radius, and shadows

## Services (`lib/`)
External service integrations:
- `supabase.ts` - Database client and TypeScript interfaces
- `bunny.ts` - Video hosting service integration

## Localization (`locales/`)
Translation files:
- `en.json` - English translations
- `fr.json` - French translations (default)

## Naming Conventions

### Files
- **PascalCase** for components: `CourseCard.tsx`
- **camelCase** for utilities: `supabase.ts`
- **kebab-case** for routes: `my-courses.tsx`

### Components
- **Functional components** with TypeScript interfaces
- **Props interfaces** named `ComponentNameProps`
- **Export default** for main component, named exports for utilities

### Database Types
- **Interfaces** match Supabase table schemas
- **Optional fields** marked with `?` for nullable columns
- **Enums** for constrained values (role, level, etc.)

## Import Patterns
```typescript
// External libraries first
import React from 'react';
import { View, Text } from 'react-native';

// Internal imports with @ alias
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

// Relative imports last
import './styles.css';
```

## Route Protection
- **Authentication**: Handled in root `_layout.tsx`
- **Role-based access**: Separate route groups for trainer/learner
- **Shared screens**: Accessible to both roles when appropriate
