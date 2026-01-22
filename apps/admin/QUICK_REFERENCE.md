# Bunny.net Integration - Quick Reference

## Video URL Format

Videos are stored using a custom URL scheme:

```
bunny://LIBRARY_ID/VIDEO_ID
```

Example:
```
bunny://527238/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/videos/create` | POST | Create video in Bunny Stream |
| `/api/videos/upload-url` | POST | Get TUS upload credentials |
| `/api/videos/status/[videoId]` | GET | Check video processing status |

## Components

### VideoUpload
```tsx
<VideoUpload
  onUploadComplete={(videoId, libraryId) => {
    // Handle upload completion
  }}
  lessonTitle="Lesson Title"
/>
```

### BunnyVideoPlayer
```tsx
<BunnyVideoPlayer
  libraryId="527238"
  videoId="video-guid"
  title="Video Title"
/>
```

## Utility Functions

```typescript
import { getBunnyPlaybackUrl, getBunnyHlsUrl, getBunnyThumbnailUrl } from '@/lib/bunny/utils'

// Get embed URL
const embedUrl = getBunnyPlaybackUrl(libraryId, videoId)
// https://iframe.mediadelivery.net/embed/527238/video-id

// Get HLS playlist URL
const hlsUrl = getBunnyHlsUrl(libraryId, videoId)
// https://video.bunnycdn.com/play/527238/video-id/playlist.m3u8

// Get thumbnail URL
const thumbUrl = getBunnyThumbnailUrl(libraryId, videoId)
// https://vz-527238.b-cdn.net/video-id/thumbnail.jpg
```

## Video Processing States

| State | Description |
|-------|-------------|
| `queued` | Video uploaded, waiting to process |
| `processing` | Video is being processed |
| `encoding` | Video is being transcoded |
| `finished` | Video ready for playback |
| `failed` | Processing failed |

## Database Schema

```sql
-- Lessons table with Bunny fields
CREATE TABLE lessons (
  id UUID PRIMARY KEY,
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,  -- Format: bunny://LIBRARY_ID/VIDEO_ID
  bunny_video_id TEXT,
  bunny_library_id TEXT,
  video_status TEXT,
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER,
  is_free BOOLEAN DEFAULT FALSE
);
```

## Upload Flow

```
1. Trainer clicks "Upload Video"
   ↓
2. VideoUpload component validates file
   ↓
3. POST /api/videos/create → Creates video in Bunny
   ↓
4. POST /api/videos/upload-url → Gets TUS credentials
   ↓
5. TUS upload to Bunny CDN (with progress)
   ↓
6. onUploadComplete callback
   ↓
7. Save bunny://LIBRARY_ID/VIDEO_ID to Supabase
   ↓
8. Bunny processes video (1-5 minutes)
   ↓
9. Video ready for playback
```

## Playback Flow

```
1. Learner opens course
   ↓
2. Fetch lesson with video_url
   ↓
3. Parse bunny://LIBRARY_ID/VIDEO_ID
   ↓
4. BunnyVideoPlayer renders iframe
   ↓
5. Bunny serves adaptive HLS stream
   ↓
6. Video plays with automatic quality adjustment
```

## Environment Variables

```env
BUNNY_LIBRARY_ID=527238
BUNNY_API_KEY=your-api-key
BUNNY_PULLZONE_NAME=vz-ca5a508d-fcd
BUNNY_SIGNING_KEY=optional-security-key
```

## Common Tasks

### Check if video is Bunny-hosted

```typescript
function isBunnyVideo(url: string): boolean {
  return url?.startsWith('bunny://')
}
```

### Parse Bunny URL

```typescript
function parseBunnyUrl(url: string): { libraryId: string; videoId: string } | null {
  const match = url.match(/^bunny:\/\/([^/]+)\/(.+)$/)
  if (match) {
    return { libraryId: match[1], videoId: match[2] }
  }
  return null
}
```

### Create Bunny URL

```typescript
function createBunnyUrl(libraryId: string, videoId: string): string {
  return `bunny://${libraryId}/${videoId}`
}
```

## File Size Limits

- **Max file size**: 5GB per video
- **Recommended**: Under 2GB for faster uploads
- **Supported formats**: MP4, MOV, AVI, MKV, WebM, etc.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Upload fails | Check API key and library ID |
| Video won't play | Wait for processing to complete |
| Slow upload | Check internet connection, TUS supports resume |
| 401 Unauthorized | Verify API key has Stream permissions |
| 403 Forbidden | Check library ID is correct |

## Testing Checklist

- [ ] Upload video as trainer
- [ ] Monitor upload progress
- [ ] Verify video appears in Bunny dashboard
- [ ] Check video processing status
- [ ] Test playback as learner
- [ ] Test on mobile devices
- [ ] Test different video formats
- [ ] Test large files (>1GB)
- [ ] Test upload cancellation
- [ ] Test error handling

## Performance Tips

1. **Compress videos** before upload (H.264, 1080p max)
2. **Use thumbnails** for faster page loads
3. **Enable preload** for better UX
4. **Monitor bandwidth** usage in Bunny dashboard
5. **Set up CDN caching** for thumbnails

## Security Best Practices

1. **Never expose API key** to client
2. **Validate file types** before upload
3. **Limit file sizes** to prevent abuse
4. **Use signed URLs** for premium content
5. **Monitor usage** for unusual activity

## Cost Optimization

1. **Delete unused videos** regularly
2. **Use appropriate resolutions** (don't upload 4K if not needed)
3. **Enable compression** in Bunny settings
4. **Monitor storage** usage
5. **Set up alerts** for high bandwidth usage

## Support Resources

- [Bunny Stream Docs](https://docs.bunny.net/docs/stream)
- [TUS Protocol](https://tus.io/)
- [Setup Guide](./SETUP_BUNNY.md)
- [Integration Guide](./BUNNY_INTEGRATION.md)
