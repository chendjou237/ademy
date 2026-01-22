# 🎥 Bunny.net Stream Integration

Your Ademy platform now has **full Bunny.net Stream integration** for professional video hosting and adaptive streaming!

## ✅ What's Been Implemented

### 🎬 Video Upload System
- **TUS resumable uploads** with progress tracking
- **File validation** (type, size limits)
- **Direct upload to Bunny CDN** (no server storage needed)
- **Cancel/resume** functionality
- **Real-time progress** indicators

### 📺 Video Playback
- **Embedded Bunny player** with adaptive streaming
- **Automatic quality adjustment** based on bandwidth
- **Mobile-responsive** player
- **Full-screen support**
- **Loading states** and error handling

### 🔧 API Integration
- **3 API routes** for video management:
  - Create video in Bunny Stream
  - Get upload credentials
  - Check processing status
- **Server-side security** (API keys never exposed)
- **Authentication checks** (trainers only)

### 💾 Database Updates
- **New fields** for Bunny metadata
- **Custom URL format**: `bunny://LIBRARY_ID/VIDEO_ID`
- **Backward compatible** with external URLs
- **Migration script** included

### 🎨 UI Components
- **VideoUpload** - Upload component with progress
- **BunnyVideoPlayer** - Embedded player component
- **Updated AddLessonDialog** - Dual upload methods
- **Updated LessonPlayer** - Bunny video support

## 📁 New Files Created

```
app/api/videos/
├── create/route.ts          # Create video in Bunny
├── upload-url/route.ts      # Get TUS upload credentials
└── status/[videoId]/route.ts # Check video status

components/
├── trainer/
│   └── video-upload.tsx     # Upload component
└── learner/
    └── bunny-video-player.tsx # Player component

lib/bunny/
├── types.ts                 # TypeScript types
└── utils.ts                 # Helper functions

scripts/
└── 02-add-bunny-fields.sql  # Database migration

Documentation/
├── BUNNY_INTEGRATION.md     # Full integration guide
├── SETUP_BUNNY.md          # Setup instructions
├── QUICK_REFERENCE.md      # Quick reference
└── README_BUNNY.md         # This file
```

## 🚀 Quick Start

### 1. Update Environment Variables

Your `.env` already has placeholders. Update with your Bunny credentials:

```env
BUNNY_LIBRARY_ID=your-library-id
BUNNY_API_KEY=your-api-key
```

### 2. Run Database Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually in SQL Editor
# Copy contents of scripts/02-add-bunny-fields.sql
```

### 3. Test Upload

1. Start dev server: `npm run dev`
2. Log in as trainer
3. Create/edit course → Add lesson
4. Upload a video file
5. Watch the magic happen! ✨

## 🎯 How It Works

### Upload Flow
```
Trainer selects video
       ↓
VideoUpload validates file
       ↓
API creates video in Bunny
       ↓
TUS uploads to Bunny CDN
       ↓
Progress bar updates
       ↓
Video ID saved to Supabase
       ↓
Bunny processes video
       ↓
Ready for playback!
```

### Playback Flow
```
Learner opens course
       ↓
Fetch lesson data
       ↓
Parse bunny:// URL
       ↓
BunnyVideoPlayer renders
       ↓
Adaptive HLS streaming
       ↓
Smooth playback! 🎬
```

## 📊 Video URL Format

Videos are stored using a custom URL scheme:

```
bunny://LIBRARY_ID/VIDEO_ID
```

Example:
```
bunny://527238/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

This allows:
- ✅ Easy parsing and validation
- ✅ Separation from external URLs
- ✅ Future-proof for metadata
- ✅ Backward compatible

## 🔐 Security Features

- ✅ API keys stored server-side only
- ✅ Authentication required for uploads
- ✅ Trainer role verification
- ✅ File type validation
- ✅ File size limits (5GB max)
- ✅ TUS protocol for secure uploads

## 📱 Features

### For Trainers
- Upload videos directly from browser
- Monitor upload progress in real-time
- Cancel and resume uploads
- Support for large files (up to 5GB)
- Automatic video processing
- Thumbnail generation

### For Learners
- Adaptive streaming (auto quality)
- Fast loading with CDN
- Mobile-friendly player
- Full-screen mode
- Responsive design
- Smooth playback

## 🛠️ Technical Details

### Dependencies Added
- `tus-js-client` - Resumable uploads

### API Endpoints
- `POST /api/videos/create` - Create video
- `POST /api/videos/upload-url` - Get credentials
- `GET /api/videos/status/[videoId]` - Check status

### Database Schema
```sql
ALTER TABLE lessons ADD COLUMN bunny_video_id TEXT;
ALTER TABLE lessons ADD COLUMN bunny_library_id TEXT;
ALTER TABLE lessons ADD COLUMN video_status TEXT;
ALTER TABLE lessons ADD COLUMN thumbnail_url TEXT;
```

## 📖 Documentation

- **[SETUP_BUNNY.md](./SETUP_BUNNY.md)** - Step-by-step setup guide
- **[BUNNY_INTEGRATION.md](./BUNNY_INTEGRATION.md)** - Full technical documentation
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference card

## ✨ What's Next?

### Recommended Enhancements

1. **Video Analytics** 📊
   - Track watch time
   - Monitor completion rates
   - View engagement metrics

2. **Subtitles/Captions** 📝
   - Upload subtitle files
   - Multi-language support
   - Auto-generated captions

3. **Video Chapters** 📑
   - Add chapter markers
   - Quick navigation
   - Better UX

4. **Thumbnail Selection** 🖼️
   - Choose custom thumbnails
   - Auto-generate options
   - Upload custom images

5. **Batch Upload** 📦
   - Upload multiple videos
   - Bulk processing
   - Progress tracking

6. **Video Editing** ✂️
   - Trim videos
   - Add intros/outros
   - Basic editing tools

## 🐛 Troubleshooting

### Upload Issues
- Check API key is correct
- Verify library ID matches
- Ensure file is under 5GB
- Check internet connection

### Playback Issues
- Wait for processing (1-5 min)
- Check video status in Bunny dashboard
- Verify URL format is correct
- Clear browser cache

### TypeScript Errors
```bash
npm run build
```

## 💰 Cost Estimation

Bunny Stream is very affordable:

- **Storage**: $0.005/GB/month
- **Encoding**: $0.01/minute
- **Streaming**: $0.01/GB

Example: 100 videos (10 min each)
- Storage: ~$0.25/month
- Encoding: ~$10 one-time
- Streaming: ~$5/month (1000 views)

Much cheaper than Vimeo or Wistia! 💸

## 🎉 Success!

Your platform now has:
- ✅ Professional video hosting
- ✅ Adaptive streaming
- ✅ Global CDN delivery
- ✅ Automatic transcoding
- ✅ Mobile optimization
- ✅ Production-ready code

## 📞 Support

- **Bunny Docs**: https://docs.bunny.net/docs/stream
- **TUS Protocol**: https://tus.io/
- **Issues**: Check troubleshooting section

---

**Built with ❤️ for Ademy - African Course Platform**

Ready to upload your first video? Let's go! 🚀
