# Course Management & Video Integration

## 🎯 Overview

This document covers the implementation of course creation, management, and Bunny.net video integration features for the Ademy mobile app.

## 🏗️ Features Implemented

### ✅ Course Management (Trainers)

**Course Creation (`app/(trainer)/create-course.tsx`)**
- Complete course creation form with validation
- Image thumbnail upload to Supabase Storage
- Category and difficulty level selection
- Price setting in XAF currency
- Automatic draft status on creation

**Course Detail & Management (`app/(trainer)/course/[id].tsx`)**
- Comprehensive course overview with statistics
- Publish/unpublish functionality with validation
- Course editing capabilities
- Lesson management interface
- Course deletion with confirmation
- Real-time enrollment and lesson counts

**Course Listing (`app/(trainer)/my-courses.tsx`)**
- Display all trainer's courses with status
- Quick stats (lessons, students, revenue)
- Navigation to course details
- Create new course button

### ✅ Video Integration (Bunny.net)

**Video Upload System (`lib/bunny.ts`)**
- Direct integration with Bunny.net Stream API
- Video creation and upload workflow
- Status tracking (uploading, processing, ready, error)
- Automatic thumbnail generation
- Video deletion capabilities

**Video Player (`components/VideoPlayer.tsx`)**
- Custom video player with Expo AV
- Progress tracking and completion detection
- Playback controls and time display
- Error handling for failed videos
- Support for Bunny.net URLs

**Lesson Creation (`app/(trainer)/course/[courseId]/add-lesson.tsx`)**
- Video file selection with size validation (500MB limit)
- Upload progress tracking with visual feedback
- Automatic video processing status updates
- Lesson ordering and metadata

### ✅ Learning Experience (Learners)

**Course Discovery (`app/(learner)/courses.tsx`)**
- Browse published courses with search
- Course cards with pricing and metadata
- Navigation to course details

**Course Enrollment (`app/(learner)/course/[id].tsx`)**
- Detailed course information display
- One-click enrollment for free/paid courses
- Preview of free lessons before enrollment
- Progress tracking for enrolled courses

**Lesson Viewing (`app/(learner)/lesson/[id].tsx`)**
- Full-screen video player experience
- Automatic progress tracking
- Manual lesson completion
- Course progress calculation

## 🎥 Video Workflow

### 1. Video Upload Process
```
1. Trainer selects video file (max 500MB)
2. Create video entry in Bunny.net → Get video ID
3. Upload video file to Bunny.net → Processing starts
4. Save lesson with video metadata to database
5. Bunny.net processes video → Status updates
6. Video becomes available for playback
```

### 2. Video Status States
- **`uploading`**: File is being uploaded to Bunny.net
- **`processing`**: Bunny.net is processing the video
- **`ready`**: Video is ready for playback
- **`error`**: Processing failed

### 3. Video URL Format
```
Storage: bunny://LIBRARY_ID/VIDEO_ID
Playback: https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID
```

## 📊 Database Schema Updates

### Courses Table
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

### Lessons Table
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

### Enrollments Table
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

### Lesson Progress Table
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

## 🔧 Configuration

### Environment Variables
```env
# Bunny.net Configuration
EXPO_PUBLIC_BUNNY_LIBRARY_ID=527238
EXPO_PUBLIC_BUNNY_API_KEY=your-api-key
EXPO_PUBLIC_BUNNY_PULLZONE_NAME=your-pullzone

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Required Dependencies
```json
{
  "expo-av": "Latest",
  "expo-document-picker": "Latest",
  "expo-image-picker": "Latest",
  "expo-file-system": "Latest",
  "@react-native-picker/picker": "Latest"
}
```

## 🚀 Usage Examples

### Creating a Course
```typescript
// Navigate to course creation
router.push('/(trainer)/create-course');

// Course creation form handles:
// - Title, description, price
// - Category and level selection
// - Thumbnail image upload
// - Automatic draft status
```

### Adding Video Lessons
```typescript
// From course detail screen
router.push(`/(trainer)/course/${courseId}/add-lesson`);

// Lesson creation handles:
// - Video file selection and validation
// - Upload progress tracking
// - Bunny.net integration
// - Lesson metadata
```

### Video Playback
```typescript
<VideoPlayer
  videoId={lesson.bunny_video_id}
  videoUrl={lesson.video_url}
  title={lesson.title}
  onComplete={() => markLessonComplete()}
/>
```

## 📱 User Flows

### Trainer Flow
1. **Create Course** → Fill form → Upload thumbnail → Save as draft
2. **Add Lessons** → Select video → Upload → Set metadata → Save
3. **Publish Course** → Review content → Publish → Available to learners
4. **Manage Course** → View stats → Edit content → Track enrollments

### Learner Flow
1. **Browse Courses** → Search/filter → View details
2. **Enroll in Course** → Free/paid enrollment → Access granted
3. **Watch Lessons** → Video playback → Progress tracking
4. **Complete Course** → All lessons done → Certificate (future)

## 🎯 Key Features

### Course Management
- ✅ Complete CRUD operations for courses
- ✅ Draft/published status management
- ✅ Thumbnail image upload
- ✅ Category and level organization
- ✅ XAF currency pricing

### Video Integration
- ✅ Bunny.net Stream API integration
- ✅ Video upload with progress tracking
- ✅ Automatic video processing
- ✅ Custom video player with controls
- ✅ Progress tracking and completion

### Learning Experience
- ✅ Course enrollment system
- ✅ Lesson progress tracking
- ✅ Free lesson previews
- ✅ Course completion calculation
- ✅ Mobile-optimized video playback

## 🔄 Next Steps

### Immediate Enhancements
- [ ] Payment integration for paid courses
- [ ] Video quality selection
- [ ] Offline video downloads
- [ ] Course certificates
- [ ] Student reviews and ratings

### Advanced Features
- [ ] Live streaming capabilities
- [ ] Interactive quizzes
- [ ] Course analytics dashboard
- [ ] Bulk lesson upload
- [ ] Video transcription/subtitles

## 🐛 Troubleshooting

### Common Issues

**Video Upload Fails**
- Check file size (max 500MB)
- Verify Bunny.net API credentials
- Ensure stable internet connection

**Video Won't Play**
- Check video processing status
- Verify Bunny.net library ID
- Test video URL directly

**Course Not Visible**
- Ensure course is published
- Check user enrollment status
- Verify database permissions

### Debug Tips
- Check console logs for API errors
- Verify environment variables
- Test Bunny.net API directly
- Check Supabase RLS policies

This implementation provides a complete course management and video streaming solution, ready for production use with proper error handling, progress tracking, and mobile optimization.
