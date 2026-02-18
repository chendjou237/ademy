# Storage Bucket Setup Guide

## Issue
When uploading course thumbnails, you get this error:
```
StorageApiError: new row violates row-level security policy
```

## Root Cause
The Supabase storage bucket `ademy` either:
1. Doesn't exist yet
2. Exists but doesn't have the correct Row Level Security (RLS) policies

## Solution

### Option 1: Run SQL Script (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Setup Script**
   - Copy the contents of `apps/admin/scripts/04-create-ademy-storage-bucket.sql`
   - Paste into the SQL editor
   - Click "Run" or press Cmd/Ctrl + Enter

4. **Verify Success**
   - You should see "Success. No rows returned"
   - Check Storage > Buckets to see the `ademy` bucket

### Option 2: Manual Setup via Dashboard

#### Step 1: Create the Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Set:
   - **Name**: `ademy`
   - **Public bucket**: ✅ Enabled
   - **File size limit**: 2 MB (or your preference)
   - **Allowed MIME types**: `image/*` (optional)
4. Click **Create bucket**

#### Step 2: Set Up RLS Policies

1. Click on the `ademy` bucket
2. Go to **Policies** tab
3. Click **New policy**

**Policy 1: Allow Uploads**
- **Policy name**: Authenticated users can upload to ademy bucket
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **USING expression**: (leave empty)
- **WITH CHECK expression**:
  ```sql
  bucket_id = 'ademy'
  ```

**Policy 2: Allow Updates**
- **Policy name**: Authenticated users can update in ademy bucket
- **Allowed operation**: UPDATE
- **Target roles**: authenticated
- **USING expression**:
  ```sql
  bucket_id = 'ademy'
  ```
- **WITH CHECK expression**: (leave empty)

**Policy 3: Allow Deletes**
- **Policy name**: Authenticated users can delete from ademy bucket
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **USING expression**:
  ```sql
  bucket_id = 'ademy'
  ```

**Policy 4: Allow Public Read**
- **Policy name**: Public can view ademy bucket files
- **Allowed operation**: SELECT
- **Target roles**: public
- **USING expression**:
  ```sql
  bucket_id = 'ademy'
  ```

## Bucket Structure

The `ademy` bucket is organized with folders:

```
ademy/
├── thumbnails/          # Course thumbnails
│   ├── 1234567890-abc.jpg
│   └── 1234567891-def.png
├── avatars/             # User profile pictures (future)
└── course-materials/
PDATE
TO authenticated
USING (bucket_id = 'ademy');
```
- **Who**: Any authenticated user
- **What**: Can update/replace files
- **Where**: In the `ademy` bucket
- **Why**: Trainers may want to change thumbnails

### 3. DELETE Policy
```sql
CREATE POLICY "Authenticated users can delete from ademy bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'ademy');
```
- **Who**: Any authenticated user
- **What**: Can delete files
- **Where**: From the `ademy` bucket
- **Why**: Trainers may want to remove old thumbnails

### 4. SELECT Policy (Public Read)
```sql
CREATE POLICY "Public can view ademy bucket files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'ademy');
```
- **Who**: Anyone (public)
- **What**: Can view/download files
- **Where**: From the `ademy` bucket
- **Why**: Course thumbnails need to be publicly visible

## Security Considerations

### Current Setup (Simple)
- ✅ Any authenticated user can upload
- ✅ Any authenticated user can delete
- ⚠️ Users can delete other users' files

### Recommended Improvements (Future)

For production, you may want to restrict who can delete files:

```sql
-- Only allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ademy'
  AND owner = auth.uid()
);
```

However, this requires storing the `owner` in the storage metadata, which needs additional setup.

## Testing

### Test Upload
1. Login to the admin app as a trainer
2. Go to "Create Course" or "Edit Course"
3. Click on the thumbnail upload area
4. Select an image file (< 2MB)
5. ✅ Upload should succeed
6. ✅ Thumbnail preview should appear

### Test Public Access
1. Copy the thumbnail URL from the database
2. Open it in an incognito/private browser window
3. ✅ Image should load without authentication

### Verify in Supabase Dashboard
1. Go to Storage > ademy bucket
2. Navigate to `thumbnails/` folder
3. ✅ You should see uploaded files
4. Click on a file
5. ✅ You should see a public URL

## Troubleshooting

### Issue: Still getting RLS error after running script
**Solution**:
1. Check if the bucket exists: Storage > Buckets
2. Check if policies exist: Click bucket > Policies tab
3. Try deleting and recreating the bucket
4. Make sure you're logged in as an authenticated user

### Issue: Bucket exists but no policies
**Solution**:
1. Run the SQL script again
2. Or manually create policies via dashboard (see Option 2)

### Issue: Upload works but can't view image
**Solution**:
1. Check if bucket is set to public
2. Check if SELECT policy exists for public role
3. Verify the public URL format is correct

### Issue: Can upload but can't delete
**Solution**:
1. Check if DELETE policy exists
2. Verify you're authenticated
3. Check browser console for errors

## File Size Limits

Current limits:
- **Max file size**: 2 MB (enforced in component)
- **Allowed types**: Images only (jpg, png, gif, webp, etc.)

To change limits:
1. Update `ImageUpload` component validation
2. Update bucket settings in Supabase dashboard

## Environment Variables

No environment variables needed for storage! The Supabase client automatically uses:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These are already configured in your `.env` file.

## Related Files

- `apps/admin/components/ui/image-upload.tsx` - Upload component
- `apps/admin/scripts/04-create-ademy-storage-bucket.sql` - Setup script
- `apps/admin/scripts/02-create-storage-bucket.sql` - Old script (course-thumbnails bucket)

## Migration from Old Bucket

If you were using the `course-thumbnails` bucket before:

1. **Option A**: Update the component to use `course-thumbnails`
   ```typescript
   // In image-upload.tsx
   bucket = "course-thumbnails"  // instead of "ademy"
   ```

2. **Option B**: Migrate files to new bucket (recommended)
   - Download files from `course-thumbnails`
   - Upload to `ademy/thumbnails/`
   - Update database URLs

## Next Steps

After setting up the storage bucket:

1. ✅ Test thumbnail upload
2. ✅ Test thumbnail display on course pages
3. ✅ Test thumbnail deletion
4. Consider adding:
   - Avatar uploads for user profiles
   - Course material uploads (PDFs, etc.)
   - Video thumbnail generation

## Conclusion

Once you run the SQL script or manually set up the policies, thumbnail uploads should work without RLS errors! 🎉
