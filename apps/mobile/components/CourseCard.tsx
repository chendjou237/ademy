import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { Course } from '../lib/supabase';
import { AppText, Badge } from './ui';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const { theme } = useTheme();
  const { t } = useI18n();

  const formatPrice = (price: number) => {
    return price === 0 ? t('course.free') : `${price.toLocaleString()} XAF`;
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'neutral';
    }
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
          <AppText variant="h4" color="text" numberOfLines={2}>
            {course.title}
          </AppText>
          <AppText variant="bodySmall" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
            {t('course.by')} {course.profiles?.full_name || 'Formateur'}
          </AppText>
        </View>

        {course.description && (
          <AppText
            variant="bodySmall"
            color="textSecondary"
            numberOfLines={2}
            style={{ marginTop: theme.spacing.sm }}
          >
            {course.description}
          </AppText>
        )}

        <View style={styles.footer}>
          <View style={styles.badges}>
            {course.level && (
              <Badge variant={getLevelColor(course.level)} size="sm">
                {t(`course.${course.level}`)}
              </Badge>
            )}
            {course.category && (
              <Badge variant="neutral" size="sm" style={{ marginLeft: theme.spacing.xs }}>
                {course.category}
              </Badge>
            )}
          </View>

          <View style={styles.meta}>
            <AppText variant="caption" color="textLight">
              {course.lessons?.length || 0} {t('course.lessons')}
            </AppText>
            <AppText variant="h4" color="primary" style={{ marginTop: theme.spacing.xs }}>
              {formatPrice(course.price)}
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
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 12,
  },
  badges: {
    flexDirection: 'row',
    flex: 1,
  },
  meta: {
    alignItems: 'flex-end',
  },
});
