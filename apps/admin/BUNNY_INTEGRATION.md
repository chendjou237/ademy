# Bunny.net Stream Integration Guide

This document explains how the Bunny.net Stream video hosting integration works in the Ademy platform.

## Overview

The platform uses Bunny.net Stream for:
- Video hosting and storage
- Adaptive bitrate streaming (HLS)
- Automatic video transcoding
- Global CDN delivery
- Embedded video player

## Architecture

### Video Upload Flow

1. **Trainer initiates upload** → `VideoUpload` component
2. **Create video in Bunny** → `/api/videos/create` endpoint
3. **Get upload credentials** → `/api/videos/upload-url` endpoint
4. **Upload via TUS protocol** → Direct to Bunny CDN
5. **Store video reference** → Supabase `lessons` table
6. **Bunny processes video** → Automatic transcoding
7. **Video ready for playback** → Embedded player

### Video Storage Format

Videos are stored in Supabase using a custom URL scheme:

```
bunny://LIBRARY_ID/VIDEO_ID
```

Example:
```
bunny://527238/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

This format allows:
- Easy parsing and validation
- Separation from external URLs
- Future-proof for additional metadata

### Video Playback

The `BunnyVideoPlayer` component:
1. Parses the `bunny://` URL
2. Constructs the embed URL: `https://iframe.mediadelivery.net/embed/{LIBRARY_ID}/{VIDEO_ID}`
3. Renders an iframe with Bunny's player
4. Supports adaptive streaming automatically

## API Endpoints

### POST `/api/videos/create`

Creates a new video in Bunny Stream.

**Request:**
```json
{
  "title": "Lesson 1: Introduction"
}
```

**Response:**
```json
{
  "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "libraryId": "527238"
}
```

### POST `/api/videos/upload-url`

Gets upload credentials for TUS upload.

**Request:**
```json
{
  "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Response:**
```json
{
  "uploadUrl": "https://video.bunnycdn.com/tusupload",
  "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "libraryId": "527238",
  "apiKey": "your-api-key"
}
```

### GET `/api/videos/status/[videoId]`

Checks video processing status.

**Response:**
```json
{
  "videoId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "finished",
  "title": "Lesson 1: Introduction",
  "length": 300,
  "thumbnailUrl": "https://vz-527238.b-cdn.net/..."
}
```

## Components

### `VideoUpload`

Handles video file uploads with progress tracking.

**Features:**
- File validation (type, size)
- TUS resumable uploads
- Progress bar with percentage
- Cancel upload functionality
- Error handling

**Usage:**
```tsx
<VideoUpload
  onUploadComplete={(videoId, libraryId) => {
    console.log('Video uploaded:', videoId)
  }}
  lessonTitle="Introduction to React"
/>
```

### `BunnyVideoPlayer`

Renders the Bunny.net embedded video player.

**Features:**
- Adaptive bitrate streaming
- Loading states
- Error handling
- Responsive design
- Full-screen support

**Usage:**
```tsx
<BunnyVideoPlayer
  libraryId="527238"
  videoId="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  title="Lesson 1: Introduction"
/>
```

### `AddLessonDialog` (Updated)

Now includes two upload methods:
1. **Upload Video** - Direct upload to Bunny Stream
2. **External URL** - Link to YouTube, Vimeo, etc.

## Environment Variables

Required in `.env`:

```env
BUNNY_LIBRARY_ID=527238
BUNNY_API_KEY=your-api-key-here
BUNNY_SIGNING_KEY=optional-for-secure-playback
```

## Database Schema

### Updated `lessons` table:

```sql
ALTER TABLE lessons ADD COLUMN bunny_video_id TEXT;
ALTER TABLE lessons ADD COLUMN bunny_library_id TEXT;
ALTER TABLE lessons ADD COLUMN video_status TEXT;
ALTER TABLE lessons ADD COLUMN thumbnail_url TEXT;
```

### Video URL formats:

- **Bunny Stream:** `bunny://527238/video-id`
- **External:** `https://youtube.com/watch?v=...`
- **Legacy:** Any other URL format

## Video Processing States

Bunny Stream videos go through these states:

1. **queued** - Video uploaded, waiting to process
2. **processing** - Video is being processed
3. **encoding** - Video is being transcoded
4. **finished** - Video ready for playback
5. **failed** - Processing failed

## Utilities

### `lib/bunny/utils.ts`

Helper functions for Bunny URLs:

```typescript
// Get embed URL for iframe player
getBunnyPlaybackUrl(libraryId, videoId)

// Get HLS playlist URL for custom players
getBunnyHlsUrl(libraryId, videoId)

// Get video thumbnail URL
getBunnyThumbnailUrl(libraryId, videoId)

// Check video processing status
checkVideoStatus(libraryId, videoId, apiKey)
```

## Security

### Authentication
- All API routes verify user authentication
- Only trainers can upload videos
- Video access controlled by course enrollment

### API Keys
- Bunny API key stored server-side only
- Never exposed to client
- Used only in API routes

### Upload Security
- File type validation
- File size limits (5GB max)
- TUS protocol for resumable uploads

## Testing

### Test Video Upload

1. Log in as a trainer
2. Create or edit a course
3. Add a new lesson
4. Select "Upload Video" tab
5. Choose a video file
6. Monitor upload progress
7. Verify video appears in lesson

### Test Video Playback

1. Log in as a learner
2. Enroll in a course with Bunny videos
3. Navigate to course player
4. Verify video loads and plays
5. Test adaptive streaming (change quality)

## Troubleshooting

### Upload fails
- Check Bunny API key is correct
- Verify library ID matches your account
- Check file size is under 5GB
- Ensure file is a valid video format

### Video won't play
- Check video processing status
- Verify video URL format is correct
- Check browser console for errors
- Ensure iframe is not blocked

### Slow uploads
- TUS protocol supports resume
- Check network connection
- Consider video file size
- Bunny CDN should be fast globally

## Future Enhancements

Potential improvements:

1. **Direct HLS playback** - Use hls.js for custom player
2. **Video analytics** - Track watch time, completion
3. **Subtitles/Captions** - Upload and display subtitles
4. **Video chapters** - Add chapter markers
5. **Thumbnail selection** - Choose custom thumbnails
6. **Batch upload** - Upload multiple videos at once
7. **Video editing** - Trim, crop videos in-platform
8. **Live streaming** - Add live class support

## Resources

- [Bunny Stream Documentation](https://docs.bunny.net/docs/stream)
- [TUS Protocol](https://tus.io/)
- [HLS Streaming](https://developer.apple.com/streaming/)
