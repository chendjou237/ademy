import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Lesson } from '../lib/supabase';
import { AppText, Badge } from './ui';

interface LessonCardProps {
  lesson: Lesson;
  index: number;
  onPress: () => void;
  onEdit?: () => void;
  showProgress?: boolean;
  completed?: boolean;
}

export const LessonCard: React.FC<LessonCardProps> = ({
  lesson,
  index,
  onPress,
  onEdit,
  showProgress = false,
  completed = false
}) => {
  const { theme } = useTheme();

  const getVideoStatus = () => {
    if (!lesson.video_url) return { text: 'Pas de vidéo', color: 'neutral' as const };

    // Always show as ready if there's a video URL (ignore processing status)
    return { text: 'Prêt', color: 'success' as const };
  };

  const videoStatus = getVideoStatus();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: completed ? theme.colors.success : theme.colors.border,
          ...theme.shadows.sm
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.indexContainer}>
            <AppText variant="bodySmall" color="primary">
              {index}
            </AppText>
          </View>

          <View style={styles.titleContainer}>
            <AppText variant="h4" color="text" numberOfLines={2}>
              {lesson.title}
            </AppText>
            {lesson.description && (
              <AppText
                variant="bodySmall"
                color="textSecondary"
                numberOfLines={2}
                style={{ marginTop: theme.spacing.xs }}
              >
                {lesson.description}
              </AppText>
            )}
          </View>

          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={styles.editButton}
            >
              <Ionicons name="pencil" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.badges}>
            <Badge variant={videoStatus.color} size="sm">
              {videoStatus.text}
            </Badge>

            {lesson.is_free && (
              <Badge variant="secondary" size="sm" style={{ marginLeft: theme.spacing.xs }}>
                Gratuit
              </Badge>
            )}

            {showProgress && completed && (
              <Badge variant="success" size="sm" style={{ marginLeft: theme.spacing.xs }}>
                Terminé
              </Badge>
            )}
          </View>

          <View style={styles.meta}>
            {lesson.duration_minutes && (
              <AppText variant="caption" color="textLight">
                {lesson.duration_minutes} min
              </AppText>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  indexContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  editButton: {
    padding: 4,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badges: {
    flexDirection: 'row',
    flex: 1,
  },
  meta: {
    alignItems: 'flex-end',
  },
});
