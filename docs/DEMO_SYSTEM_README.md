# Demo Data System for Ademy App

## Overview
A comprehensive demo data system has been implemented to enable development and testing without requiring real Supabase data. This system provides realistic mock data and services that mirror the production functionality.

## Configuration

### Enable/Disable Demo Mode
In `config/demo.ts`, change the `DEMO_MODE` constant:
```typescript
export const DEMO_MODE = true; // Set to false for production
```

## Demo Data Included

### Users
- **Trainer Account**: `trainer@demo.com` / `demo123`
  - Jean-Claude Formateur
  - Experienced web and mobile development trainer
- **Learner Account**: `learner@demo.com` / `demo123`
  - Marie Apprenante
  - Technology and development enthusiast

### Courses
1. **Développement Web avec React** (Intermediate, 75,000 XAF)
   - 3 lessons with video content
   - Mix of free and paid lessons
2. **React Native pour Débutants** (Beginner, 85,000 XAF)
   - 2 lessons covering environment setup and first app
3. **Design UI/UX avec Figma** (Beginner, Free)
   - 1 lesson on design principles

### Features
- **Enrollment System**: Sample enrollments with progress tracking
- **Video Playback**: Test videos from Google's sample collection
- **Trainer Stats**: Revenue, student count, course metrics
- **Progress Tracking**: Lesson completion and course progress

## Demo Services

### Authentication (`demoAuthService`)
- Sign in/out with demo credentials
- Profile management
- Role-based authentication

### Course Management (`demoCourseService`)
- Course listing and filtering
- Trainer course management
- Course creation and updates

### Enrollment System (`demoEnrollmentService`)
- Course enrollment
- Progress tracking
- Lesson completion

### Video Service (`demoVideoService`)
- Demo video URL mapping
- Upload simulation

### Stats Service (`demoStatsService`)
- Trainer dashboard analytics
- Revenue and student metrics

## Components

### DemoCredentials
- Quick login component for testing
- Shows available demo accounts
- Auto-fills login credentials

### DemoModeIndicator
- Visual indicator when in demo mode
- Warns users about fictional data

### VideoPlayer (Enhanced)
- Supports both demo and production videos
- Uses React Native Video for demo content
- WebView for production Bunny.net content

## Integration Status

### ✅ Completed
- Demo data configuration
- Demo service implementations
- Authentication system integration
- Video player dual-mode support
- Login screen with demo credentials

### 🔄 Partially Integrated
- Course listing screens
- Enrollment management
- Trainer dashboard
- Progress tracking

### ⏳ Pending
- Course creation forms
- Lesson management
- Payment processing
- File uploads

## Usage

### For Development
1. Keep `DEMO_MODE = true` in `config/demo.ts`
2. Use demo credentials to test different user roles
3. All data operations will use mock services
4. Videos will play using test content

### For Production
1. Set `DEMO_MODE = false` in `config/demo.ts`
2. All services will switch to Supabase automatically
3. Real authentication and data will be used

## Demo Credentials Quick Reference

| Role | Email | Password |
|------|-------|----------|
| Trainer | trainer@demo.com | demo123 |
| Learner | learner@demo.com | demo123 |

## Benefits

1. **Faster Development**: No need for real data setup
2. **Consistent Testing**: Same data across all environments
3. **Offline Development**: Works without internet connection
4. **Easy Demos**: Perfect for showcasing features
5. **Safe Testing**: No risk of corrupting real data

## Next Steps

1. Fix remaining TypeScript import issues
2. Complete integration in all screens
3. Add more demo data scenarios
4. Implement demo mode for file uploads
5. Add demo payment flow simulation

The demo system provides a solid foundation for development and testing while maintaining the ability to seamlessly switch to production data when needed.
