# Bunny.net Stream Setup Guide

Quick setup guide to get Bunny.net Stream working in your Ademy platform.

## Prerequisites

- Bunny.net account (sign up at https://bunny.net)
- Bunny Stream library created
- API access key with Stream permissions

## Step 1: Get Your Bunny Credentials

1. Log in to [Bunny.net Dashboard](https://dash.bunny.net)
2. Navigate to **Stream** → **Libraries**
3. Create a new library or select existing one
4. Note your **Library ID** (e.g., `527238`)
5. Go to **API** section
6. Copy your **API Key** (starts with your library ID)

## Step 2: Update Environment Variables

Your `.env` file already has placeholders. Update them with your actual values:

```env
# Bunny Stream video library ID (you can find it in the Bunny dashboard)
BUNNY_LIBRARY_ID=527238

# Bunny Stream API Access Key (with read/write permissions)
BUNNY_API_KEY=d6b587a5-f170-4207-9c42d7251f42-909d-4439

# (Optional) Bunny CDN Pull Zone name if you'll later serve signed URLs
BUNNY_PULLZONE_NAME=vz-ca5a508d-fcd

# (Optional) Bunny Stream Signing Key (for secure playback)
BUNNY_SIGNING_KEY=
```

## Step 3: Run Database Migration

Apply the database migration to add Bunny-specific fields:

```bash
# Connect to your Supabase database and run:
psql $DATABASE_URL -f scripts/02-add-bunny-fields.sql
```

Or manually run in Supabase SQL Editor:

```sql
-- Copy contents of scripts/02-add-bunny-fields.sql
```

## Step 4: Install Dependencies

Dependencies are already installed:

```bash
npm install tus-js-client
# or
pnpm install tus-js-client
```

## Step 5: Test the Integration

### Test Video Upload

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in as a **trainer**

3. Navigate to **Trainer Dashboard** → **Create Course** or edit existing course

4. Go to **Lessons** tab → **Add Lesson**

5. In the dialog:
   - Enter lesson title
   - Select **Upload Video** tab
   - Choose a video file (MP4, MOV, etc.)
   - Click **Upload Video**
   - Monitor progress bar

6. Once uploaded, click **Add Lesson**

### Test Video Playback

1. Log in as a **learner** (or use different browser/incognito)

2. Enroll in the course with the uploaded video

3. Navigate to **My Learning** → Select the course

4. Video should load in the embedded Bunny player

5. Test playback controls (play, pause, fullscreen, quality)

## Step 6: Verify in Bunny Dashboard

1. Go to Bunny.net Dashboard → **Stream** → **Videos**

2. You should see your uploaded video

3. Check video status:
   - **Queued** - Just uploaded
   - **Processing** - Being processed
   - **Encoding** - Being transcoded
   - **Finished** - Ready for playback

4. Processing usually takes 1-5 minutes depending on video length

## Troubleshooting

### Upload fails with 401 Unauthorized

- Check your `BUNNY_API_KEY` is correct
- Ensure API key has Stream permissions
- Verify library ID matches your account

### Upload fails with 403 Forbidden

- Check library ID is correct
- Ensure library is active (not suspended)
- Verify API key belongs to the correct account

### Video won't play

- Wait for processing to complete (check Bunny dashboard)
- Check browser console for errors
- Verify video URL format: `bunny://LIBRARY_ID/VIDEO_ID`
- Try refreshing the page

### Upload is very slow

- Check your internet connection
- TUS protocol supports resume - you can pause and continue
- Consider video file size (large files take longer)
- Bunny CDN should provide fast uploads globally

### TypeScript errors

```bash
# Rebuild the project
npm run build

# Check for type errors
npx tsc --noEmit
```

## Configuration Options

### Video Quality Settings

Edit in Bunny Dashboard → Library Settings:

- **Resolutions**: 240p, 360p, 480p, 720p, 1080p, 1440p, 4K
- **Bitrate**: Automatic or custom
- **Codec**: H.264 (default) or H.265

### Player Customization

The embedded player supports query parameters:

```typescript
const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=true&responsive=true`
```

Options:
- `autoplay=true` - Auto-play video
- `preload=true` - Preload video data
- `responsive=true` - Responsive sizing
- `loop=true` - Loop video
- `muted=true` - Start muted

### Security (Optional)

Enable signed URLs for secure playback:

1. In Bunny Dashboard → Library → Security
2. Enable **Token Authentication**
3. Copy **Security Key** to `.env`:
   ```env
   BUNNY_SIGNING_KEY=your-security-key
   ```
4. Update player to generate signed URLs

## Next Steps

### Recommended Enhancements

1. **Add video status polling** - Show processing status to trainers
2. **Add thumbnail selection** - Let trainers choose custom thumbnails
3. **Add video analytics** - Track watch time and completion
4. **Add captions/subtitles** - Upload and display subtitles
5. **Add video chapters** - Allow trainers to add chapter markers

### Production Checklist

- [ ] Environment variables set in Vercel/production
- [ ] Database migration applied to production
- [ ] Test upload with production credentials
- [ ] Test playback on different devices/browsers
- [ ] Monitor Bunny usage and costs
- [ ] Set up Bunny CDN alerts
- [ ] Configure video retention policies
- [ ] Set up backup strategy

## Support

- **Bunny.net Support**: https://support.bunny.net
- **Bunny Stream Docs**: https://docs.bunny.net/docs/stream
- **TUS Protocol**: https://tus.io/protocols/resumable-upload.html

## Cost Estimation

Bunny Stream pricing (as of 2024):

- **Storage**: $0.005/GB/month
- **Encoding**: $0.01/minute
- **Streaming**: $0.01/GB (varies by region)

Example for 100 videos (10 min each, 1080p):
- Storage: ~50GB = $0.25/month
- Encoding: 1000 min = $10 one-time
- Streaming: 1000 views = ~$5/month

Much cheaper than alternatives like Vimeo or Wistia!
