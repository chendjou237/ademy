import { useTheme } from '@/contexts/ThemeContext';
import { demoCourseService, isDemoMode } from '@/services/demoService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LessonCard } from '../../../components/LessonCard';
import { AppText, Badge, Button, Card } from '../../../components/ui';
import { useI18n } from '../../../contexts/I18nContext';
import { Course, Lesson, supabase } from '../../../lib/supabase';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { t } = useI18n();


  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [fetchCourseDetails, id]);

  const fetchCourseDetails = useCallback(async () => {
    try {
      let courseData: any, lessonsData: any;
      let courseError: any, lessonsError: any;

      if (isDemoMode()) {
        // Use demo services
        courseData = await demoCourseService.getCourseById(id!);
        courseError = courseData ? null : { message: 'Course not found' };

        if (courseData) {
          lessonsData = courseData.lessons || [];
          lessonsError = null;
        }
      } else {
        // Use Supabase
        const courseResult = await supabase
          .from('courses')
          .select(`
            *,
            profiles!courses_trainer_id_fkey(full_name, avatar_url),
            enrollments(count)
          `)
          .eq('id', id)
          .single();

        courseData = courseResult.data;
        courseError = courseResult.error;

        if (courseData) {
          // Fetch lessons
          const lessonsResult = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', id)
            .order('order_index', { ascending: true });

          lessonsData = lessonsResult.data;
          lessonsError = lessonsResult.error;
        }
      }

      if (courseError) {
        console.error('Error fetching course:', courseError);
        Alert.alert('Erreur', 'Impossible de charger le cours');
        return;
      }

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
      }

      setCourse(courseData);
      setLessons(lessonsData || []);
    } catch (error) {
      console.error('Error fetching course details:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const togglePublishStatus = async () => {
    if (!course) return;

    if (!course.is_published && lessons.length === 0) {
      Alert.alert('Erreur', 'Vous devez ajouter au moins une leçon avant de publier le cours');
      return;
    }

    setPublishing(true);

    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !course.is_published })
        .eq('id', course.id);

      if (error) {
        Alert.alert('Erreur', 'Impossible de modifier le statut du cours');
      } else {
        setCourse(prev => prev ? { ...prev, is_published: !prev.is_published } : null);
        Alert.alert(
          'Succès',
          course.is_published ? 'Cours dépublié' : 'Cours publié avec succès'
        );
      }
    } catch (err) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setPublishing(false);
    }
  };

  const deleteCourse = async () => {
    if (!course) return;

    Alert.alert(
      'Supprimer le cours',
      'Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', course.id);

              if (error) {
                Alert.alert('Erreur', 'Impossible de supprimer le cours');
              } else {
                Alert.alert('Succès', 'Cours supprimé', [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              }
            } catch (err) {
              Alert.alert('Erreur', 'Une erreur est survenue');
            }
          }
        }
      ]
    );
  };

  const renderLesson = ({ item, index }: { item: Lesson; index: number }) => (
    <LessonCard
      lesson={item}
      index={index + 1}
      onPress={() => console.log('View lesson:', item.id)}
      onEdit={() => console.log('Edit lesson:', item.id)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <AppText variant="body" color="textSecondary">
            {t('common.loading')}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <AppText variant="body" color="error">
            Cours introuvable
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        <Card style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <View style={styles.titleRow}>
              <AppText variant="h2" color="text" style={{ flex: 1 }}>
                {course.title}
              </AppText>
              <Badge
                variant={course.is_published ? 'success' : 'warning'}
                size="sm"
              >
                {course.is_published ? 'Publié' : 'Brouillon'}
              </Badge>
            </View>

            <AppText variant="body" color="textSecondary" style={{ marginTop: theme.spacing.sm }}>
              {course.description}
            </AppText>

            <View style={styles.courseStats}>
              <View style={styles.statItem}>
                <AppText variant="h4" color="primary">
                  {lessons.length}
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
                  Étudiants
                </AppText>
              </View>

              <View style={styles.statItem}>
                <AppText variant="h4" color="text">
                  {course.price === 0 ? 'Gratuit' : `${course.price.toLocaleString()} XAF`}
                </AppText>
                <AppText variant="caption" color="textLight">
                  Prix
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <Button
              variant="outline"
              onPress={() => console.log('Edit course:', course.id)}
              style={{ flex: 1, marginRight: theme.spacing.sm }}
            >
              Modifier
            </Button>
            <Button
              variant={course.is_published ? 'outline' : 'primary'}
              onPress={togglePublishStatus}
              loading={publishing}
              style={{ flex: 1, marginLeft: theme.spacing.sm }}
            >
              {course.is_published ? 'Dépublier' : 'Publier'}
            </Button>
          </View>
        </Card>

        <Card style={styles.lessonsCard}>
          <View style={styles.lessonsHeader}>
            <AppText variant="h3" color="text">
              Leçons ({lessons.length})
            </AppText>
            <Button
              onPress={() => router.push(`/(trainer)/course/${course.id}/add-lesson` as any)}
              size="sm"
            >
              Ajouter une leçon
            </Button>
          </View>

          {lessons.length === 0 ? (
            <View style={styles.emptyLessons}>
              <AppText variant="body" color="textSecondary" align="center">
                Aucune leçon ajoutée
              </AppText>
              <AppText variant="bodySmall" color="textLight" align="center" style={{ marginTop: theme.spacing.xs }}>
                Ajoutez votre première leçon pour commencer
              </AppText>
            </View>
          ) : (
            <FlatList
              data={lessons}
              renderItem={renderLesson}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: theme.spacing.md }} />}
            />
          )}
        </Card>

        <Card style={styles.dangerCard}>
          <AppText variant="h4" color="error" style={{ marginBottom: theme.spacing.md }}>
            Zone de danger
          </AppText>
          <Button
            variant="outline"
            onPress={deleteCourse}
            style={{ borderColor: theme.colors.error }}
          >
            <AppText variant="button" color="error">
              Supprimer le cours
            </AppText>
          </Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseCard: {
    marginBottom: 16,
  },
  courseHeader: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  courseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
  },
  lessonsCard: {
    marginBottom: 16,
  },
  lessonsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyLessons: {
    padding: 32,
  },
  dangerCard: {
    marginBottom: 20,
    borderColor: '#FF4444',
    borderWidth: 1,
  },
});
