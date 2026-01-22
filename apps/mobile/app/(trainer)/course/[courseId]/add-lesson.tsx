import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Card, Input, ProgressBar } from '../../../../components/ui';
import { useI18n } from '../../../../contexts/I18nContext';
import { useTheme } from '../../../../contexts/ThemeContext';
import { createBunnyVideo, uploadVideoToBunny } from '../../../../lib/bunny';
import { supabase } from '../../../../lib/supabase';

export default function AddLessonScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { theme } = useTheme();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: '',
    is_free: false,
  });
  const [videoFile, setVideoFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Check file size (limit to 500MB)
        if (asset.size && asset.size > 500 * 1024 * 1024) {
          Alert.alert('Erreur', 'La vidéo ne peut pas dépasser 500MB');
          return;
        }

        setVideoFile(asset);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner la vidéo');
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setUploadProgress(0);
    setUploadStatus('');
  };

  const handleSubmit = async () => {
    if (!courseId) return;

    if (!formData.title) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    setLoading(true);
    setUploadStatus('Création de la leçon...');

    try {
      // Get the next order index
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = existingLessons && existingLessons.length > 0
        ? existingLessons[0].order_index + 1
        : 1;

      let bunnyVideoId = null;
      let videoUrl = null;
      let videoStatus = null;

      // Handle video upload if video is selected
      if (videoFile) {
        setUploadStatus('Création de la vidéo sur Bunny.net...');

        // Create video entry in Bunny.net
        const bunnyResult = await createBunnyVideo(formData.title);
        if (!bunnyResult) {
          Alert.alert('Erreur', 'Impossible de créer la vidéo sur Bunny.net');
          setLoading(false);
          return;
        }

        bunnyVideoId = bunnyResult.videoId;
        videoUrl = `bunny://${bunnyResult.libraryId}/${bunnyResult.videoId}`;
        videoStatus = 'uploading';

        setUploadStatus('Upload de la vidéo...');
        setUploadProgress(10);

        // Upload video file
        const uploadSuccess = await uploadVideoToBunny(
          bunnyResult.videoId,
          videoFile.uri,
          (progress) => {
            setUploadProgress(10 + (progress * 80)); // 10-90%
          }
        );

        if (!uploadSuccess) {
          Alert.alert('Erreur', 'Échec de l\'upload de la vidéo');
          setLoading(false);
          return;
        }

        videoStatus = 'processing';
        setUploadProgress(95);
      }

      setUploadStatus('Sauvegarde de la leçon...');

      // Create lesson in database
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          title: formData.title,
          description: formData.description || null,
          video_url: videoUrl,
          bunny_video_id: bunnyVideoId,
          bunny_library_id: bunnyVideoId ? '527238' : null,
          video_status: videoStatus,
          duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
          order_index: nextOrderIndex,
          is_free: formData.is_free,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating lesson:', error);
        Alert.alert('Erreur', 'Impossible de créer la leçon');
      } else {
        setUploadProgress(100);
        Alert.alert('Succès', 'Leçon créée avec succès!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setUploadStatus('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <AppText variant="h2" color="text">
            Ajouter une leçon
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
            Créez une nouvelle leçon pour votre cours
          </AppText>
        </View>

        <Card style={styles.formCard}>
          <Input
            label="Titre de la leçon *"
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Ex: Introduction aux variables"
            style={{ marginBottom: theme.spacing.lg }}
          />

          <Input
            label="Description"
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Décrivez le contenu de cette leçon..."
            multiline
            numberOfLines={3}
            style={{ marginBottom: theme.spacing.lg }}
          />

          <Input
            label="Durée (minutes)"
            value={formData.duration_minutes}
            onChangeText={(value) => handleInputChange('duration_minutes', value)}
            placeholder="Ex: 15"
            keyboardType="numeric"
            style={{ marginBottom: theme.spacing.lg }}
          />

          <View style={{ marginBottom: theme.spacing.lg }}>
            <AppText variant="bodySmall" color="text" style={{ marginBottom: theme.spacing.xs }}>
              Vidéo de la leçon
            </AppText>

            {!videoFile ? (
              <Button
                variant="outline"
                onPress={pickVideo}
              >
                Choisir une vidéo
              </Button>
            ) : (
              <Card padding="md" style={{ backgroundColor: theme.colors.surfaceLight }}>
                <View style={styles.videoInfo}>
                  <AppText variant="bodySmall" color="text">
                    {videoFile.name}
                  </AppText>
                  <AppText variant="caption" color="textLight">
                    {videoFile.size ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Taille inconnue'}
                  </AppText>
                </View>
                <Button
                  variant="ghost"
                  onPress={removeVideo}
                  style={{ marginTop: theme.spacing.sm }}
                >
                  Supprimer
                </Button>
              </Card>
            )}
          </View>

          {loading && (
            <Card padding="md" style={{ marginBottom: theme.spacing.lg, backgroundColor: theme.colors.surfaceLight }}>
              <AppText variant="bodySmall" color="text" style={{ marginBottom: theme.spacing.sm }}>
                {uploadStatus}
              </AppText>
              <ProgressBar progress={uploadProgress} showLabel />
            </Card>
          )}

          <View style={styles.actions}>
            <Button
              variant="outline"
              onPress={() => router.back()}
              disabled={loading}
              style={{ flex: 1, marginRight: theme.spacing.sm }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onPress={handleSubmit}
              loading={loading}
              style={{ flex: 1, marginLeft: theme.spacing.sm }}
            >
              Créer la leçon
            </Button>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  formCard: {
    marginBottom: 20,
  },
  videoInfo: {
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
  },
});
