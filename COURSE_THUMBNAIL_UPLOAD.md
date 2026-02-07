# Course Thumbnail Upload Feature

## Overview
Trainers can now upload custom thumbnails for their courses when creating or editing courses. Thumbnails are stored in Supabase Storage and displayed throughout the application.

## Implementation Details

### Components

#### 1. **ImageUpload Component** (`components/ui/image-upload.tsx`)
A reusable component for uploading images to Supabase Storage.

**Features:**
- Drag-and-drop or click to upload
- Image preview with aspect ratio (16:9)
- File validation (type and size)
- Remove/replace functionality
- Upload progress indicator
- Error handling

**Props:**
```typescript
interface ImageUploadProps {
  value?: string | null          // Current image URL
  onChange: (url: string | null) => void  // Callback when image changes
  disabled?: boolean             // Disable upload
  bucket?: string                // Storage bucket name (default: 'course-thumbnails')
  folder?: string                // Folder within bucket (default: 'thumbnails')
  label?: string                 // Field label
  description?: string           // Help text
}
```

**Validation:**
- File type: Images only (`image/*`)
- File size: Maximum 2MB
- Recommended dimensions: 800x450px (16:9 aspect ratio)

### Forms Updated

#### 2. **CreateCourseForm** (`components/trainer/create-course-form.tsx`)
- Added `thumbnailUrl` state
- Integrated `ImageUpload` component
- Saves thumbnail URL to database on course creation

#### 3. **EditCourseForm** (`components/trainer/edit-course-form.tsx`)
- Added `thumbnailUrl` state initialized from existing course data
- Integrated `ImageUpload` component
- Updates thumbnail URL in database on save
- Allows replacing or removing existing thumbnails

### Database Schema

The `courses` table already has a `thumbnail_url` column:
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY,
  trainer_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,  -- Stores the Supabase Storage public URL
  -- ... other fields
);
```

### Storage Setup

#### Bucket Configuration
- **Bucket Name**: `course-thumbnails`
- **Public Access**: Yes (for displaying images)
- **Folder Structure**: `thumbnails/TIMESTAMP-RANDOM.ext`

#### Storage Policies (RLS)
Run the migration script: `scripts/02-create-storage-bucket.sql`

**Policies:**
1. **Upload**: Authenticated users can upload to `thumbnails/` folder
2. **Update**: Authenticated users can update their uploads
3. **Delete**: Authenticated users can delete their uploads
4. **Read**: Public read access for all thumbnails

## Usage

### For Trainers

#### Creating a Course
1. Navigate to "Create New Course"
2. Fill in course details
3. Click the thumbnail upload area
4. Select an image (recommended: 800x450px, max 2MB)
5. Preview appears automatically
6. Submit the form to create the course with thumbnail

#### Editing a Course
1. Navigate to "My Courses" → Select a course
2. Go to "Course Details" tab
3. To add/change thumbnail: Click the upload area or existing image
4. To remove thumbnail: Click the X button on the preview
5. Click "Save Changes"

### File Upload Flow

```
User selects file
    ↓
Validate file type & size
    ↓
Generate unique filename (timestamp + random)
    ↓
Upload to Supabase Storage
    ↓
Get public URL
    ↓
Update component state
    ↓
Save to database on form submit
```

## Technical Details

### File Naming Convention
```
thumbnails/{timestamp}-{random}.{extension}
Example: thumbnails/1706024400000-a7b3c9d.jpg
```

### URL Format
```
https://{project-ref}.supabase.co/storage/v1/object/public/course-thumbnails/thumbnails/{filename}
```

### Error Handling

**Common Errors:**
- File too large (>2MB): "Image must be less than 2MB"
- Invalid file type: "Please select an image file"
- Upload failure: "Failed to upload image"
- Network issues: Displayed in error message

## Setup Instructions

### 1. Run Database Migration
Execute the storage bucket creation script in your Supabase SQL editor:
```bash
# Copy contents of scripts/02-create-storage-bucket.sql
# Paste and run in Supabase Dashboard → SQL Editor
```

### 2. Verify Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Confirm `course-thumbnails` bucket exists
3. Verify it's set to "Public"

### 3. Test Upload
1. Create or edit a course as a trainer
2. Upload a test image
3. Verify it appears in Storage bucket
4. Confirm the URL is saved in the `courses` table

## Display Integration

Thumbnails are automatically displayed in:
- Course cards/lists (for learners and trainers)
- Course detail pages
- Enrollment screens
- Search results

**Example Usage:**
```tsx
{course.thumbnail_url && (
  <Image
    src={course.thumbnail_url}
    alt={course.title}
    width={800}
    height={450}
    className="object-cover"
  />
)}
```

## Best Practices

### For Trainers
1. **Image Dimensions**: Use 800x450px (16:9 ratio) for best results
2. **File Size**: Keep under 500KB for faster loading
3. **Content**: Use clear, relevant images that represent the course
4. **Format**: JPG or PNG recommended

### For Developers
1. **Validation**: Always validate on both client and server
2. **Error Handling**: Provide clear error messages
3. **Cleanup**: Consider implementing orphaned file cleanup
4. **Optimization**: Consider adding image optimization/resizing
5. **CDN**: Supabase Storage includes CDN for fast delivery

## Future Enhancements

Potential improvements:
- [ ] Automatic image resizing/optimization
- [ ] Crop/edit functionality
- [ ] Multiple image sizes (thumbnail, medium, large)
- [ ] Image compression before upload
- [ ] Drag-and-drop from external sources
- [ ] AI-generated thumbnails
- [ ] Template library for thumbnails
- [ ] Bulk upload for multiple courses

## Troubleshooting

### Upload Not Working
1. Check Supabase Storage bucket exists
2. Verify RLS policies are active
3. Check browser console for errors
4. Ensure user is authenticated
5. Verify file meets size/type requirements

### Image Not Displaying
1. Confirm URL is saved in database
2. Check bucket is set to "Public"
3. Verify URL is accessible in browser
4. Check CORS settings if needed

### Permission Errors
1. Verify user is authenticated
2. Check RLS policies in Supabase
3. Ensure bucket permissions are correct
4. Review storage policies in dashboard

## Security Considerations

1. **File Type Validation**: Only images allowed
2. **Size Limits**: 2MB maximum prevents abuse
3. **Authentication**: Only authenticated users can upload
4. **RLS Policies**: Proper access control
5. **Public URLs**: Only thumbnails are public (not user data)
6. **Unique Filenames**: Prevents overwrites and conflicts

## Cost Considerations

**Supabase Storage Pricing:**
- Storage: $0.021/GB/month
- Bandwidth: $0.09/GB

**Estimated Costs (1000 courses):**
- Average thumbnail: 200KB
- Total storage: ~200MB = $0.004/month
- Very affordable for most use cases
