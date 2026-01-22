import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { Enrollment } from '../lib/supabase';
import { AppText, Badge, ProgressBar } from './ui';

interface EnrolledCourseCardProps {
  enrollment: Enrollment;
  onPress: () => void;
}

export const EnrolledCourseCard: React.FC<EnrolledCourseCardProps> = ({ enrollment, onPress }) => {
  const { theme } = useTheme();
  const { t } = useI18n();

  const course = enrollment.course;
  if (!course) return null;

  const getProgressStatus = (progress: number) => {
    if (progress === 0) return { text: t('progress.notStarted'), color: 'textLight' };
    if (progress === 100) return { text: t('progress.completed'), color: 'success' };
    return { text: t('progress.inProgress'), color: 'primary' };
  };

  const status = getProgressStatus(enrollment.progress);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface, ...theme.shadows.sm }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: course.thumbnail_url || 'https://via.placeholder.com/300x200?text=Course'
        }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="h4" color="text" numberOfLines={2}>
            {course.title}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
            {t('course.by')} {course.profiles?.full_name || 'Formateur'}
          </AppText>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <AppText variant="bodySmall" color="textSecondary">
              {t('progress.progress')}
            </AppText>
            <Badge
              variant={enrollment.progress === 100 ? 'success' : 'primary'}
              size="sm"
            >
              {status.text}
            </Badge>
          </View>

          <ProgressBar
            progress={enrollment.progress}
            color={enrollment.progress === 100 ? 'success' : 'primary'}
            style={{ marginTop: theme.spacing.xs }}
          />

          <AppText variant="caption" color="textLight" style={{ marginTop: theme.spacing.xs }}>
            {enrollment.progress}% terminé • {course.lessons?.length || 0} {t('course.lessons')}
          </AppText>
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" color="textLight">
            Inscrit le {new Date(enrollment.enrolled_at).toLocaleDateString('fr-FR')}
          </AppText>

          <AppText variant="bodySmall" color="primary">
            {enrollment.progress === 100 ? 'Revoir' : 'Continuer'}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
