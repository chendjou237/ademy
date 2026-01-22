# Ademy Mobile App Documentation
## Complete Guide for Expo React Native Implementation

### Table of Contents
1. [App Overview](#app-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Database Schema](#database-schema)
4. [Authentication System](#authentication-system)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Core Features](#core-features)
7. [Video Integration](#video-integration)
8. [Internationalization](#internationalization)
9. [API Endpoints](#api-endpoints)
10. [UI/UX Components](#uiux-components)
11. [Navigation Structure](#navigation-structure)
12. [Implementation Guide](#implementation-guide)

---

## App Overview

**Ademy** is an African-focused online learning platform that connects trainers with learners. The mobile app provides the core functionality without admin features.

### Core Value Proposition
- African trainers create and monetize courses
- Learners access quality education content
- Video-based learning with progress tracking
- Multi-language support (French/English)
- XAF currency integration

### Target Users
- **Trainers**: Create courses, upload videos, manage content
- **Learners**: Browse courses, watch videos, track progress

---

## Architecture & Tech Stack

### Mobile Tech Stack (Expo)
```
Frontend: React Native + Expo
State Management: React Context + AsyncStorage
Navigation: React Navigation v6
UI Library: NativeBase or Tamagui
Video Player: Expo AV
HTTP Client: Axios
Authentication: Supabase Auth
Database: Supabase (PostgreSQL)
File Upload: Expo DocumentPicker + Bunny.net
Internationalization: i18n-js
```

### Backend Services
```
Database: Supabase PostgreSQL
Authentication: Supabase Auth
Video Hosting: Bunny.net Stream
File Storage: Bunny.net CDN
API: Supabase REST API + Custom endpoints
```

---

## Database Schema

### Core Tables

#### 1. Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('trainer', 'learner')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Courses Table
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Lessons Table
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  bunny_video_id TEXT,
  bunny_library_id TEXT,
  video_status TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. Enrollments Table
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id UUID NOT NULL REFERENCES profiles(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(learner_id, course_id)
);
```

#### 5. Lesson Progress Table
```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id),
  lesson_id UUID NOT NULL REFERENCES lessons(id),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(enrollment_id, lesson_id)
);
```

---

## Authentication System

### Supabase Auth Integration

#### Setup
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### Auth Flow
1. **Sign Up**: Email + Password + Role selection
2. **Sign In**: Email + Password
3. **Profile Creation**: Automatic via database trigger
4. **Session Management**: Persistent via AsyncStorage

#### Auth Context
```javascript
const AuthContext = createContext({
  user: null,
  profile: null,
  signIn: () => {},
  signUp: () => {},
  signOut: () => {},
  loading: true
})
```

---

## User Roles & Permissions

### Trainer Role
**Capabilities:**
- Create and manage courses
- Upload video lessons
- Set course pricing (XAF)
- Publish/unpublish courses
- View enrollment statistics
- Track revenue (future feature)

**Restrictions:**
- Cannot enroll in courses
- Cannot access learner dashboard

### Learner Role
**Capabilities:**
- Browse published courses
- Enroll in courses (free/paid)
- Watch video lessons
- Track learning progress
- Mark lessons as complete

**Restrictions:**
- Cannot create courses
- Cannot access trainer dashboard

---

## Core Features

### 1. Course Management (Trainer)

#### Create Course
```javascript
const createCourse = async (courseData) => {
  const { data, error } = await supabase
    .from('courses')
    .insert({
      trainer_id: user.id,
      title: courseData.title,
      description: courseData.description,
      price: courseData.price,
      category: courseData.category,
      level: courseData.level,
      is_published: false
    })
  return { data, error }
}

####
d Lesson with Video
```javascript
const addLesson = async (lessonData, videoFile) => {
  // 1. Upload video to Bunny.net
  const videoResult = await uploadVideoToBunny(videoFile, lessonData.title)

  // 2. Create lesson record
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      course_id: lessonData.courseId,
      title: lessonData.title,
      description: lessonData.description,
      video_url: `bunny://${videoResult.libraryId}/${videoResult.videoId}`,
      bunny_video_id: videoResult.videoId,
      bunny_library_id: videoResult.libraryId,
      video_status: 'processing',
      duration_minutes: lessonData.duration,
      order_index: lessonData.orderIndex,
      is_free: lessonData.isFree
    })

  return { data, error }
}
```

### 2. Course Discovery (Learner)

#### Browse Courses
```javascript
const getCourses = async (filters = {}) => {
  let query = supabase
    .from('courses')
    .select(`
      *,
      profiles!courses_trainer_id_fkey(full_name, avatar_url),
      lessons(count),
      enrollments(count)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`)
  }

  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  return await query
}
```

#### Enroll in Course
```javascript
const enrollInCourse = async (courseId) => {
  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      learner_id: user.id,
      course_id: courseId
    })
  return { data, error }
}
```

### 3. Learning Progress

#### Track Lesson Completion
```javascript
const markLessonComplete = async (enrollmentId, lessonId) => {
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      enrollment_id: enrollmentId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString()
    })
  return { data, error }
}
```

#### Calculate Course Progress
```javascript
const getCourseProgress = async (enrollmentId) => {
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('enrollment_id', enrollmentId)

  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', courseId)

  const completedCount = progress.filter(p => p.completed).length
  const totalCount = lessons.length

  return {
    completed: completedCount,
    total: totalCount,
    percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  }
}
```

---

## Video Integration

### Bunny.net Stream Setup

#### Environment Variables
```
BUNNY_LIBRARY_ID=527238
BUNNY_API_KEY=your-api-key
BUNNY_PULLZONE_NAME=vz-ca5a508d-fcd
```

#### Video Upload Flow
```javascript
// 1. Get upload credentials
const getUploadCredentials = async () => {
  const response = await fetch('/api/videos/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  })
  return await response.json()
}

// 2. Upload via TUS protocol (React Native)
import { TusClient } from 'tus-js-client'

const uploadVideo = async (videoFile, title) => {
  const credentials = await getUploadCredentials()

  return new Promise((resolve, reject) => {
    const upload = new TusClient(videoFile, {
      endpoint: credentials.uploadUrl,
      metadata: {
        filetype: videoFile.type,
        title: title
      },
      headers: {
        AccessKey: credentials.apiKey,
        LibraryId: credentials.libraryId
      },
      onSuccess: () => {
        // Extract video ID from upload URL
        const videoId = upload.url.split('/').pop()
        resolve({ videoId, libraryId: credentials.libraryId })
      },
      onError: reject
    })

    upload.start()
  })
}
```

#### Video Player Component (React Native)
```javascript
import { Video } from 'expo-av'

const BunnyVideoPlayer = ({ libraryId, videoId, title }) => {
  const [status, setStatus] = useState({})

  const videoUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`

  return (
    <Video
      source={{ uri: videoUrl }}
      rate={1.0}
      volume={1.0}
      isMuted={false}
      resizeMode="contain"
      shouldPlay={false}
      isLooping={false}
      style={{ width: '100%', height: 200 }}
      useNativeControls
      onPlaybackStatusUpdate={setStatus}
    />
  )
}
```

#### Video URL Format
```
Storage Format: bunny://LIBRARY_ID/VIDEO_ID
Example: bunny://527238/a1b2c3d4-e5f6-7890-abcd-ef1234567890

Playback URL: https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID
```

---

## Internationalization

### Language Support
- **Default**: French (fr)
- **Secondary**: English (en)
- **Currency**: XAF (Central African CFA Franc)

### i18n Setup (React Native)
```javascript
import I18n from 'i18n-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Translation files
import fr from './locales/fr.json'
import en from './locales/en.json'

I18n.translations = { fr, en }
I18n.defaultLocale = 'fr'
I18n.fallbacks = true

// Load saved language
const loadLanguage = async () => {
  const savedLanguage = await AsyncStorage.getItem('language')
  if (savedLanguage) {
    I18n.locale = savedLanguage
  }
}

// Save language preference
const setLanguage = async (language) => {
  I18n.locale = language
  await AsyncStorage.setItem('language', language)
}
```

### Translation Keys Structure
```json
{
  "nav": {
    "home": "Accueil",
    "courses": "Cours",
    "dashboard": "Tableau de bord"
  },
  "course": {
    "enrollNow": "S'inscrire maintenant",
    "by": "par",
    "free": "Gratuit"
  },
  "lesson": {
    "markComplete": "Marquer comme terminé",
    "completed": "Terminé",
    "minutes": "minutes"
  }
}
```

---

## API Endpoints

### Video Management
```
POST /api/videos/upload-url
- Get TUS upload credentials
- Returns: { uploadUrl, libraryId, apiKey }

POST /api/videos/find-recent
- Find recently uploaded video by title
- Body: { title }
- Returns: { videoId, libraryId, title, status }

GET /api/videos/status/[videoId]
- Check video processing status
- Returns: { videoId, status, title, length, thumbnailUrl }
```

### Lesson Management
```
PATCH /api/lessons/[lessonId]/update-status
- Update lesson video status
- Body: { status }
- Returns: { success }
```

### Course Data (via Supabase)
```javascript
// Get course with lessons and enrollment info
const getCourseDetails = async (courseId) => {
  const { data } = await supabase
    .from('courses')
    .select(`
      *,
      profiles!courses_trainer_id_fkey(full_name, avatar_url),
      lessons(*),
      enrollments(*)
    `)
    .eq('id', courseId)
    .single()

  return data
}
```

---

## UI/UX Components

### Design System

#### Color Palette
```javascript
const colors = {
  primary: '#3B82F6',      // Blue
  secondary: '#10B981',    // Green
  background: '#FFFFFF',   // White
  surface: '#F9FAFB',     // Light Gray
  text: '#111827',        // Dark Gray
  textSecondary: '#6B7280', // Medium Gray
  border: '#E5E7EB',      // Light Border
  error: '#EF4444',       // Red
  warning: '#F59E0B',     // Orange
  success: '#10B981'      // Green
}
```

#### Typography
```javascript
const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' }
}
```

### Key Components

#### Course Card
```javascript
const CourseCard = ({ course, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.card}>
    <Image source={{ uri: course.thumbnail_url }} style={styles.thumbnail} />
    <View style={styles.content}>
      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.instructor}>par {course.profiles.full_name}</Text>
      <View style={styles.footer}>
        <Text style={styles.level}>{course.level}</Text>
        <Text style={styles.price}>
          {course.price === 0 ? 'Gratuit' : `${course.price.toLocaleString()} XAF`}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
)
```

#### Lesson Player
```javascript
const LessonPlayer = ({ lesson, onComplete }) => {
  const [completed, setCompleted] = useState(lesson.completed)

  const handleComplete = async () => {
    await onComplete(lesson.id)
    setCompleted(true)
  }

  return (
    <View style={styles.container}>
      <BunnyVideoPlayer
        libraryId={lesson.bunny_library_id}
        videoId={lesson.bunny_video_id}
        title={lesson.title}
      />
      <View style={styles.controls}>
        <Text style={styles.title}>{lesson.title}</Text>
        <TouchableOpacity onPress={handleComplete} style={styles.completeButton}>
          <Text>Marquer comme terminé</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
```

#### Progress Bar
```javascript
const ProgressBar = ({ progress, total }) => {
  const percentage = total > 0 ? (progress / total) * 100 : 0

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {progress}/{total} leçons terminées ({Math.round(percentage)}%)
      </Text>
    </View>
  )
}
```

---

## Navigation Structure

### Stack Navigation Setup
```javascript
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
)

// Learner Tab Navigation
const LearnerTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Courses" component={CoursesScreen} />
    <Tab.Screen name="MyCourses" component={MyCoursesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
)

// Trainer Tab Navigation
const TrainerTabs = () => (
  <Tab.Navigator>
    <Tab.Screen name="Dashboard" component={TrainerDashboardScreen} />
    <Tab.Screen name="MyCourses" component={TrainerCoursesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
)

// Main App Navigation
const AppNavigation = () => {
  const { user, profile } = useAuth()

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : profile?.role === 'trainer' ? (
          <Stack.Screen name="TrainerApp" component={TrainerTabs} />
        ) : (
          <Stack.Screen name="LearnerApp" component={LearnerTabs} />
        )}

        {/* Shared Screens */}
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
        <Stack.Screen name="LessonPlayer" component={LessonPlayerScreen} />
        <Stack.Screen name="CreateCourse" component={CreateCourseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

### Screen Hierarchy
```
App
├── Auth Stack
│   ├── Login
│   └── Signup
├── Learner App (Tabs)
│   ├── Courses (Browse)
│   ├── My Courses (Enrolled)
│   └── Profile
├── Trainer App (Tabs)
│   ├── Dashboard (Stats)
│   ├── My Courses (Created)
│   └── Profile
└── Shared Screens
    ├── Course Detail
    ├── Lesson Player
    ├── Create Course
    └── Edit Course
```

---

## Implementation Guide

### Phase 1: Project Setup
```bash
# Create Expo project
npx create-expo-app AdemyMobile --template

# Install dependencies
npm install @supabase/supabase-js
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install expo-av expo-document-picker expo-file-system
npm install @react-native-async-storage/async-storage
npm install i18n-js
npm install tus-js-client
npm install react-native-elements react-native-vector-icons
```

### Phase 2: Core Setup
1. **Supabase Configuration**
   - Set up environment variables
   - Configure auth client
   - Set up database connection

2. **Authentication System**
   - Create auth context
   - Implement login/signup screens
   - Set up session persistence

3. **Navigation Structure**
   - Set up stack and tab navigators
   - Implement role-based navigation
   - Create screen components

### Phase 3: Core Features
1. **Course Management**
   - Course listing screen
   - Course detail screen
   - Course creation (trainer)
   - Enrollment system

2. **Video Integration**
   - Bunny.net setup
   - Video upload functionality
   - Video player component
   - Progress tracking

3. **User Dashboards**
   - Learner dashboard (enrolled courses)
   - Trainer dashboard (created courses, stats)
   - Profile management

### Phase 4: Advanced Features
1. **Internationalization**
   - Set up i18n
   - Implement language switcher
   - Translate all screens

2. **Offline Support**
   - Cache course data
   - Download videos for offline viewing
   - Sync progress when online

3. **Push Notifications**
   - New course notifications
   - Progress reminders
   - Course updates

### Phase 5: Polish & Testing
1. **UI/UX Refinement**
   - Consistent design system
   - Smooth animations
   - Loading states

2. **Performance Optimization**
   - Image optimization
   - Video streaming optimization
   - Database query optimization

3. **Testing & Deployment**
   - Unit tests
   - Integration tests
   - App store deployment

---

## Key Implementation Notes

### Currency Handling
- All prices in XAF (Central African CFA Franc)
- Use `toLocaleString()` for number formatting
- No decimal places for XAF currency

### Video Processing
- Videos uploaded to Bunny.net may take time to process
- Show processing status to users
- Implement retry mechanisms for failed uploads

### Offline Considerations
- Cache course metadata
- Allow downloading videos for offline viewing
- Sync progress when connection restored

### Performance Tips
- Implement lazy loading for course lists
- Use FlatList for large datasets
- Optimize images with proper sizing
- Implement video thumbnail generation

### Security
- Never expose API keys in client code
- Use Supabase RLS policies
- Validate all user inputs
- Implement proper error handling

This documentation provides a complete blueprint for building the Ademy mobile app with Expo React Native, maintaining all core functionality while adapting to mobile-specific patterns and best practices.
