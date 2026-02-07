# Video Upload Fix - Mobile App (Updated for Expo SDK 54)

## Issues Fixed

### 1. **Replaced DocumentPicker with ImagePicker**

**Problem:** DocumentPicker was being used for video selection, but ImagePicker is more appropriate for media files and provides better integration with the device's media library.

**Solution:**
- Replaced `expo-document-picker` with `expo-image-picker`
- Updated to use `ImagePicker.launchImageLibraryAsync` with `MediaTypeOptions.Videos`
- Added proper permission handling with `requestMediaLibraryPermissionsAsync`

**Changes in** `apps/mobile/app/(trainer)/course/[courseId]/add-lesson.tsx`:

```typescript
// Before
import * as DocumentPicker from 'expo-document-picker';
const result = await DocumentPicker.getDocumentAsync({
  type: 'video/*',
  copyToCacheDirectory: true,
});

// After
import * as ImagePicker from 'expo-image-picker';
const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
  allowsEditing: false,
  quality: 1,
});
```

### 2. **Fixed Deprecated File Upload Method (Expo SDK 54)**

**Problem:** Multiple deprecation errors occurred:

1. First attempt used deprecated `FileSystem.File` and `Expo.fetch`:
   ```
   Error: The file "8C5EBD3D-CEFE-4CAC-B47F-E2A27505329B.MOV" couldn't be opened
   ```

2. Second attempt used deprecated `FileSystem.uploadAsync`:
   ```
   Error: Method uploadAsync imported from "expo-file-system" is deprecated
   ```

**Root Cause:**
- Expo SDK 54 introduced a new FileSystem API
- Old methods (`FileSystem.File`, `uploadAsync`) are deprecated
- Need to use new `File` class with `expo/fetch`

**Solution:**
Migrated to the new Expo SDK 54 FileSystem API using `File` class and `expo/fetch`:

**Changes in** `apps/mobile/lib/bunny.ts`:

```typescript
// DEPRECATED (SDK < 54) - DON'T USE
import * as FileSystem from 'expo-file-system';
const uploadResult = await FileSystem.uploadAsync(uploadUrl, videoUri, {
  httpMethod: 'PUT',
  headers: { 'AccessKey': BUNNY_API_KEY },
});

// NEW (SDK 54+) - WORKING ✅
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

const file = new File(videoUri);
const response = await expoFetch(uploadUrl, {
  method: 'PUT',
  headers: { 'AccessKey': BUNNY_API_KEY },
  body: file,
});
```

## Key Improvements

### ImagePicker Benefits

1. **Better UX**: Native media picker interface
2. **Permissions**: Proper permission handling
3. **Media Info**: Access to duration, dimensions, file size
4. **Type Safety**: Specific to videos only

### New File API Benefits (SDK 54)

1. **Modern API**: Uses latest Expo standards
2. **Works with URIs**: Handles content:// and file:// URIs correctly
3. **Simpler**: Direct file upload with fetch
4. **Better Integration**: Works seamlessly with expo/fetch
5. **Future-proof**: Won't be deprecated

## Updated Video File State

Changed from DocumentPicker asset to ImagePicker asset:

```typescript
// Before
const [videoFile, setVideoFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
// Properties: name, size, uri, mimeType

// After
const [videoFile, setVideoFile] = useState<ImagePicker.ImagePickerAsset | null>(null);
// Properties: fileName, fileSize, uri, duration, width, height
```

## Display Updates

Updated the video info display to use ImagePicker properties:

```typescript
// File name
{videoFile.fileName || 'Vidéo sélectionnée'}

// File size with fallback to duration
{videoFile.fileSize
  ? `${(videoFile.fileSize / (1024 * 1024)).toFixed(1)} MB`
  : videoFile.duration
    ? `${Math.round(videoFile.duration)}s`
    : 'Taille inconnue'
}
```

## Testing

### To Test Video Upload:

1. Open the mobile app as a trainer
2. Navigate to a course
3. Click "Add Lesson"
4. Click "Choisir une vidéo"
5. Grant media library permissions if prompted
6. Select a video from your device
7. Fill in lesson details
8. Click "Créer la leçon"
9. Video should upload successfully to Bunny.net

### Expected Behavior:

- ✅ Permission request appears
- ✅ Native video picker opens
- ✅ Video info displays correctly (name, size/duration)
- ✅ Upload progress shows
- ✅ Video uploads to Bunny.net without errors
- ✅ Lesson created with video reference

## Common Issues & Solutions

### Issue: Permission Denied

**Solution:** User needs to grant media library access. The app will prompt automatically.

### Issue: File Too Large

**Solution:** The app limits videos to 500MB. User should compress or select a smaller video.

### Issue: Upload Fails

**Possible causes:**

1. Network connection issues
2. Invalid Bunny.net API key
3. Bunny.net library ID incorrect
4. File format not supported

**Debug steps:**

1. Check console logs for upload result status
2. Verify EXPO_PUBLIC_BUNNY_API_KEY in .env
3. Verify EXPO_PUBLIC_BUNNY_LIBRARY_ID in .env
4. Test with a different video file

## API Changes Summary

| Component | Old API (Deprecated) | New API (SDK 54+) |
| --- | --- | --- |
| Video Picker | `expo-document-picker` | `expo-image-picker` |
| File Class | `FileSystem.File(Paths, uri)` | `File(uri)` |
| File Upload | `FileSystem.uploadAsync()` | `fetch()` with File body |
| HTTP Method | POST/PUT | PUT |
| Fetch | Standard fetch | `expo/fetch` |

## Migration Guide

### If you're on Expo SDK 54+:

✅ **You're all set!** The code is already updated to use the new API.

### If you're on older SDK versions:

You may need to use the legacy API:

```typescript
import * as FileSystem from 'expo-file-system/legacy';
```

Or upgrade to SDK 54:

```bash
npx expo install expo@latest
npx expo install --fix
```

## Dependencies

Required packages (should already be installed):

- `expo-image-picker` - For video selection
- `expo-file-system` - For File class
- `expo` - For expo/fetch

If not installed:

```bash
npx expo install expo-image-picker expo-file-system
```

## References

- [Expo FileSystem SDK 54 Docs](https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/)
- [Expo ImagePicker Docs](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo Fetch Docs](https://docs.expo.dev/versions/latest/sdk/fetch/)

## Notes

- The upload uses PUT method as required by Bunny.net API
- The new File class automatically handles binary content
- ImagePicker provides more metadata than DocumentPicker (duration, dimensions)
- The fix is backward compatible - existing lessons are not affected
- Progress tracking can be added in future using fetch progress events
