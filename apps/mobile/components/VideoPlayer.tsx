import { demoVideoService, isDemoMode } from '@/services/demoService';
import { ResizeMode, Video } from 'expo-av';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../contexts/ThemeContext';
import { AppText } from './ui';

interface VideoPlayerProps {
  videoId?: string;
  videoUrl?: string;
  title?: string;
  onComplete?: () => void;
  showControls?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  videoUrl,
  title,
  onComplete,
  showControls = true,
}) => {
  const { theme } = useTheme();

  const getVideoSource = () => {
    let sourceVideoId = null;
    let libraryId = '527238'; // Default library ID

    if (videoUrl && videoUrl.startsWith('bunny://')) {
      // Parse bunny:// URL format: bunny://LIBRARY_ID/VIDEO_ID
      const parts = videoUrl.replace('bunny://', '').split('/');
      libraryId = parts[0];
      sourceVideoId = parts[1];
    } else if (videoId) {
      sourceVideoId = videoId;
    }

    if (sourceVideoId) {
      if (isDemoMode()) {
        // Use demo video URL for direct video playback
        const demoUrl = demoVideoService.getVideoUrl(sourceVideoId);
        console.log('Using demo video URL:', demoUrl);
        return { type: 'direct', url: demoUrl };
      } else {
        // Use Bunny.net embed URL for production
        const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${sourceVideoId}?autoplay=false&preload=true`;
        console.log('Using Bunny.net embed URL:', embedUrl);
        return { type: 'embed', url: embedUrl };
      }
    }

    return null;
  };

  const videoSource = getVideoSource();

  if (!videoSource) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.placeholder}>
          <AppText variant="body" color="textSecondary" align="center">
            Aucune vidéo disponible
          </AppText>
          {title && (
            <AppText variant="bodySmall" color="textLight" align="center" style={{ marginTop: theme.spacing.xs }}>
              {title}
            </AppText>
          )}
        </View>
      </View>
    );
  }

  if (videoSource.type === 'direct') {
    // Use React Native Video for demo videos
    return (
      <View style={styles.container}>
        <Video
          source={{ uri: videoSource.url }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          useNativeControls={true}
          style={styles.video}
          onError={(error: any) => {
            console.error('Demo video error:', error);
          }}
        />
      </View>
    );
  } else {
    // Use WebView for Bunny.net embed
    return (
      <View style={styles.container}>
        <WebView
          source={{ uri: videoSource.url }}
          style={styles.webview}
          allowsFullscreenVideo={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onLoad={() => {
            console.log('Video WebView loaded successfully');
            // Don't auto-complete - let user manually mark as complete
          }}
          onError={(error) => {
            console.error('WebView error:', error);
          }}
          onHttpError={(error) => {
            console.error('WebView HTTP error:', error);
          }}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
