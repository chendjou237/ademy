# Ademy Mobile App Foundation

## 🎯 Overview

This is the complete foundation for the Ademy mobile learning platform, built with Expo React Native using Expo Router for file-based routing. The foundation includes a comprehensive design system, theming, internationalization, authentication setup, and role-based navigation structure.

## 🏗️ Architecture

### Tech Stack
- **Framework**: Expo React Native
- **Routing**: Expo Router (file-based routing)
- **State Management**: React Context + AsyncStorage
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Internationalization**: i18n-js
- **Styling**: Custom theme system with TypeScript

### Project Structure
```
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Authentication group
│   │   ├── login.tsx      # Login screen
│   │   └── signup.tsx     # Signup screen
│   ├── (learner)/         # Learner role tabs
│   │   ├── courses.tsx    # Browse courses
│   │   ├── my-courses.tsx # Enrolled courses
│   │   └── profile.tsx    # Profile management
│   ├── (trainer)/         # Trainer role tabs
│   │   ├── dashboard.tsx  # Analytics dashboard
│   │   ├── my-courses.tsx # Created courses
│   │   └── profile.tsx    # Profile management
│   ├── _layout.tsx        # Root layout with providers
│   ├── index.tsx          # Route handler based on auth state
│   └── demo.tsx           # Design system showcase
├── components/
│   ├── ui/                # Reusable UI components
│   ├── CourseCard.tsx     # Course display components
│   ├── LoadingScreen.tsx  # Loading component
│   └── StatsCard.tsx      # Dashboard statistics
├── contexts/              # React contexts (Theme, Auth, I18n)
├── lib/                   # Supabase configuration
├── locales/               # Translation files (fr/en)
└── theme/                 # Design system tokens
```

## 🎨 Design System

### Brand Colors
- **Primary**: #0070F0 (Blue)
- **Secondary**: #00C27A (Green)
- **Background**: #FFFFFF (White)
- **Surface**: #F5F5F5 (Light Gray)
- **Text**: #222222 (Dark Gray)

### Typography Scale
- **H1**: 32px, Bold (Titles)
- **H2**: 24px, Bold (Section headers)
- **H3**: 20px, SemiBold (Subsections)
- **H4**: 18px, SemiBold (Card titles)
- **Body**: 16px, Regular (Main text)
- **Body Small**: 14px, Regular (Secondary text)
- **Caption**: 12px, Regular (Labels, metadata)

### Spacing System (4px base)
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px
- **3xl**: 48px

### Component Library

#### Core Components
- **AppText**: Typography component with variant system
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Input**: Text input with label, error, and helper text
- **Card**: Container with padding and shadow options
- **ProgressBar**: Progress indicator with percentage
- **Badge**: Status and category indicators

#### Specialized Components
- **CourseCard**: Course display for learners
- **EnrolledCourseCard**: Progress tracking for enrolled courses
- **TrainerCourseCard**: Course management for trainers
- **StatsCard**: Dashboard statistics display

## 🌍 Internationalization

### Supported Languages
- **French (fr)**: Default language
- **English (en)**: Secondary language

### Usage
```typescript
import { useI18n } from '../contexts/I18nContext';

const { t, locale, setLocale } = useI18n();
const text = t('nav.courses'); // "Cours" or "Courses"
```

### Translation Structure
```json
{
  "nav": { "courses": "Cours" },
  "auth": { "signIn": "Se connecter" },
  "course": { "enrollNow": "S'inscrire maintenant" },
  "common": { "loading": "Chargement..." }
}
```

## 🎭 Theming

### Theme System
- **Light/Dark Mode**: Automatic system detection with manual override
- **Persistent**: Theme preference saved to AsyncStorage
- **Typed**: Full TypeScript support for theme tokens

### Usage
```typescript
import { useTheme } from '../contexts/ThemeContext';

const { theme, isDark, toggleTheme } = useTheme();
const styles = { backgroundColor: theme.colors.primary };
```

## 🔐 Authentication

### Supabase Integration
- **Email/Password**: Standard authentication
- **Role-based**: Trainer vs Learner roles
- **Profile Management**: Automatic profile creation
- **Session Persistence**: Maintains login state

### User Roles
- **Trainer**: Create courses, manage content, view analytics
- **Learner**: Browse courses, enroll, track progress

## 🧭 Navigation (Expo Router)

### File-Based Routing Structure
```
app/
├── index.tsx              # Route handler (redirects based on auth state)
├── _layout.tsx            # Root layout with context providers
├── (auth)/                # Authentication group
│   ├── _layout.tsx        # Auth stack layout
│   ├── login.tsx          # Login screen
│   └── signup.tsx         # Signup screen
├── (learner)/             # Learner role group (tabs)
│   ├── _layout.tsx        # Learner tabs layout
│   ├── courses.tsx        # Browse all courses
│   ├── my-courses.tsx     # Enrolled courses with progress
│   └── profile.tsx        # Profile management
├── (trainer)/             # Trainer role group (tabs)
│   ├── _layout.tsx        # Trainer tabs layout
│   ├── dashboard.tsx      # Analytics and stats
│   ├── my-courses.tsx     # Created courses management
│   └── profile.tsx        # Profile management (shared)
└── demo.tsx               # Design system showcase (modal)
```

### Routing Logic
1. **Index Route**: Checks authentication state and redirects:
   - Not authenticated → `/(auth)/login`
   - Trainer role → `/(trainer)/dashboard`
   - Learner role → `/(learner)/courses`

2. **Route Groups**:
   - `(auth)`: Authentication flows
   - `(learner)`: Learner-specific tabs
   - `(trainer)`: Trainer-specific tabs

3. **Shared Screens**: Profile screen is reused between roles

## 📱 Screens (Expo Router)

### Authentication Routes (`app/(auth)/`)
- **login.tsx**: Email/password login with role detection
- **signup.tsx**: Registration with role selection and picker

### Learner Routes (`app/(learner)/`)
- **courses.tsx**: Browse published courses with search and filtering
- **my-courses.tsx**: View enrolled courses with progress tracking
- **profile.tsx**: Manage profile, settings, theme, and language

### Trainer Routes (`app/(trainer)/`)
- **dashboard.tsx**: Analytics dashboard with stats cards and quick actions
- **my-courses.tsx**: Manage created courses with publish/unpublish
- **profile.tsx**: Shared profile management (same as learner)

### Utility Routes
- **index.tsx**: Authentication state handler and router
- **demo.tsx**: Complete design system showcase (modal presentation)

## 🚀 Getting Started

### Prerequisites
```bash
npm install -g expo-cli
```

### Installation
```bash
npm install
```

### Environment Setup
Create `.env` file with Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development
```bash
npm start
```

### Accessing Different Flows
- **Demo Screen**: Navigate to `/demo` to see all components
- **Authentication**: Will redirect automatically if not logged in
- **Role Testing**: Create accounts with different roles to test navigation

## 📦 Dependencies

### Core
- `expo`: ~54.0.20
- `react-native`: 0.81.5
- `@react-navigation/native`: ^7.1.8
- `@react-navigation/bottom-tabs`: ^7.4.0
- `@react-navigation/native-stack`: ^6.11.0

### Supabase & Storage
- `@supabase/supabase-js`: Latest
- `@react-native-async-storage/async-storage`: Latest

### UI & Utilities
- `@expo/vector-icons`: ^15.0.3
- `i18n-js`: Latest
- `@react-native-picker/picker`: Latest

## 🎯 Next Steps

### Phase 1: Core Features
1. **Course Management**: Complete CRUD operations
2. **Video Integration**: Bunny.net streaming setup
3. **Enrollment System**: Course purchase and enrollment
4. **Progress Tracking**: Lesson completion and analytics

### Phase 2: Advanced Features
1. **Payment Integration**: XAF currency support
2. **Offline Support**: Download courses for offline viewing
3. **Push Notifications**: Course updates and reminders
4. **Search & Filtering**: Advanced course discovery

### Phase 3: Polish
1. **Performance Optimization**: Image and video optimization
2. **Testing**: Unit and integration tests
3. **App Store Deployment**: iOS and Android releases

## 🔧 Customization

### Adding New Colors
```typescript
// theme/colors.ts
export const colors = {
  // Add new color
  accent: '#FF6B6B',
  // Update dark mode variant
  dark: {
    accent: '#FF8E8E',
  }
};
```

### Creating New Components
```typescript
// components/ui/NewComponent.tsx
import { useTheme } from '../../contexts/ThemeContext';

export const NewComponent = () => {
  const { theme } = useTheme();
  // Use theme tokens for consistent styling
};
```

### Adding Translations
```json
// locales/fr.json
{
  "newSection": {
    "title": "Nouveau Titre",
    "description": "Description en français"
  }
}
```

## 📋 Features Implemented

### ✅ Complete
- [x] Design system with full component library
- [x] Light/dark theme with persistence
- [x] French/English internationalization
- [x] Supabase authentication setup
- [x] Role-based navigation (Trainer/Learner)
- [x] Responsive layout system
- [x] TypeScript integration
- [x] Demo screen showcasing all components

### 🚧 Foundation Ready For
- [ ] Course CRUD operations
- [ ] Video streaming integration
- [ ] Payment processing
- [ ] Real-time features
- [ ] Push notifications
- [ ] Offline capabilities

## 💡 Key Design Decisions

1. **Component-First Architecture**: Reusable UI components with consistent theming
2. **Context-Based State**: Simple state management without external libraries
3. **TypeScript Throughout**: Full type safety for better developer experience
4. **Mobile-First Design**: Optimized for mobile with responsive considerations
5. **Accessibility Ready**: Semantic components and proper contrast ratios
6. **Scalable Structure**: Easy to extend with new features and screens

This foundation provides everything needed to build a professional learning platform while maintaining code quality, user experience, and scalability.
