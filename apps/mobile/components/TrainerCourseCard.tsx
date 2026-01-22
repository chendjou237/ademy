import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { Course } from '../lib/supabase';
import { AppText, Badge } from './ui';

interface TrainerCourseCardProps {
  course: Course;
  onPress: () => void;
}

export const TrainerCourseCard: React.FC<TrainerCourseCardProps> = ({ course, onPress }) => {
  const { theme } = useTheme();
  const { t } = useI18n();

  const formatPrice = (price: number) => {
    return price === 0 ? t('course.free') : `${price.toLocaleString()} XAF`;
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished ? 'success' : 'warning';
  };

  const getStatusText = (isPublished: boolean) => {
    return isPublished ? 'Publié' : 'Brouillon';
  };

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
          <View style={styles.titleRow}>
            <AppText variant="h4" color="text" numberOfLines={2} style={{ flex: 1 }}>
              {course.title}
            </AppText>
            <Badge
              variant={getStatusColor(course.is_published)}
              size="sm"
              style={{ marginLeft: theme.spacing.sm }}
            >
              {getStatusText(course.is_published)}
            </Badge>
          </View>

          {course.description && (
            <AppText
              variant="bodySmall"
              color="textSecondary"
              numberOfLines={2}
              style={{ marginTop: theme.spacing.xs }}
            >
              {course.description}
            </AppText>
          )}
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <AppText variant="h4" color="primary">
              {course.lessons?.length || 0}
            </AppText>
            <AppText variant="caption" color="textLight">
              {t('course.lessons')}
            </AppText>
          </View>

          <View style={styles.statItem}>
            <AppText variant="h4" color="secondary">
              {course.enrollments?.length || 0}
            </AppText>
            <AppText variant="caption" color="textLight">
              {t('course.students')}
            </AppText>
          </View>

          <View style={styles.statItem}>
            <AppText variant="h4" color="text">
              {formatPrice(course.price)}
            </AppText>
            <AppText variant="caption" color="textLight">
              {t('course.price')}
            </AppText>
          </View>
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" color="textLight">
            Créé le {new Date(course.created_at).toLocaleDateString('fr-FR')}
          </AppText>

          <View style={styles.actions}>
            <AppText variant="bodySmall" color="primary">
              {t('common.edit')}
            </AppText>
          </View>
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
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
});
