import * as FileSystem from 'expo-file-system';

const BUNNY_LIBRARY_ID = process.env.EXPO_PUBLIC_BUNNY_LIBRARY_ID || '527238';
const BUNNY_API_KEY = process.env.EXPO_PUBLIC_BUNNY_API_KEY || 'd6b587a5-f170-4207-9c42d7251f42-909d-4439';
const BUNNY_BASE_URL = 'https://video.bunnycdn.com';

export interface VideoUploadResult {
  videoId: string;
  libraryId: string;
  title: string;
  status: string;
}

export interface VideoStatus {
  videoId: string;
  status: string;
  title: string;
  length?: number;
  thumbnailUrl?: string;
  playbackUrl?: string;
}

// Create a new video entry in Bunny.net
export const createBunnyVideo = async (title: string): Promise<VideoUploadResult | null> => {
  try {
    const response = await fetch(`${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos`, {
      method: 'POST',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
      }),
    });

    if (!response.ok) {
      console.error('Failed to create video:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      videoId: data.guid,
      libraryId: BUNNY_LIBRARY_ID,
      title: data.title,
      status: data.status,
    };
  } catch (error) {
    console.error('Error creating Bunny video:', error);
    return null;
  }
};

// Upload video file to Bunny.net
export const uploadVideoToBunny = async (
  videoId: string,
  videoUri: string,
  onProgress?: (progress: number) => void
): Promise<boolean> => {
  try {
    const uploadUrl = `${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`;

    const uploadResult = await FileSystem.uploadAsync(uploadUrl, videoUri, {
      httpMethod: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'video/mp4',
      },
    });

    return uploadResult.status === 200;
  } catch (error) {
    console.error('Error uploading video to Bunny:', error);
    return false;
  }
};

// Get video status from Bunny.net
export const getBunnyVideoStatus = async (videoId: string): Promise<VideoStatus | null> => {
  try {
    const response = await fetch(`${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
      headers: {
        'AccessKey': BUNNY_API_KEY,
      },
    });

    if (!response.ok) {
      console.error('Failed to get video status:', response.status);
      return null;
    }

    const data = await response.json();

    return {
      videoId: data.guid,
      status: data.status,
      title: data.title,
      length: data.length,
      thumbnailUrl: data.thumbnailUrl,
      playbackUrl: `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${data.guid}`,
    };
  } catch (error) {
    console.error('Error getting video status:', error);
    return null;
  }
};

// Delete video from Bunny.net
export const deleteBunnyVideo = async (videoId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'AccessKey': BUNNY_API_KEY,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting video:', error);
    return false;
  }
};

// Check video status (based on web reference)
export const checkVideoStatus = async (videoId: string): Promise<string> => {
  try {
    const response = await fetch(`${BUNNY_BASE_URL}/library/${BUNNY_LIBRARY_ID}/videos/${videoId}`, {
      headers: {
        'Accept': 'application/json',
        'AccessKey': BUNNY_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check video status');
    }

    const data = await response.json();
    console.log('Video status from Bunny.net:', data.status);
    return data.status || 'unknown';
  } catch (error) {
    console.error('Error checking video status:', error);
    return 'unknown';
  }
};

// Generate HLS video playback URL for React Native Video component
export const getVideoPlaybackUrl = (videoId: string): string => {
  // Use HLS streaming URL for React Native Video (based on web reference)
  return `https://video.bunnycdn.com/play/${BUNNY_LIBRARY_ID}/${videoId}/playlist.m3u8`;
};

// Generate MP4 video playback URL as fallback
export const getVideoPlaybackUrlMp4 = (videoId: string): string => {
  // Use direct MP4 URL for React Native Video (based on web reference)
  return `https://video.bunnycdn.com/play/${BUNNY_LIBRARY_ID}/${videoId}`;
};

// Generate video embed URL for WebView
export const getBunnyEmbedUrl = (libraryId: string, videoId: string): string => {
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&preload=true`;
};

// Generate video thumbnail URL
export const getVideoThumbnailUrl = (videoId: string): string => {
  return `https://vz-ca5a508d-fcd.b-cdn.net/${videoId}/thumbnail.jpg`;
};
