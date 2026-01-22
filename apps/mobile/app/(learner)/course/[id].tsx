import { demoCourseService, demoEnrollmentService, isDemoMode } from '@/services/demoService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LessonCard } from '../../../components/LessonCard';
import { AppText, Badge, Button, Card } from '../../../components/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { useI18n } from '../../../contexts/I18nContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Course, Enrollment, Lesson, supabase } from '../../../lib/supabase';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchCourseDetails();
    }
  }, [fetchCourseDetails, id, user]);

  const fetchCourseDetails = useCallback(async () => {
    if (!user) return;

    try {
      let courseData: any, lessonsData: any, enrollmentData: any;
      let courseError: any, lessonsError: any;

      if (isDemoMode()) {
        // Use demo services
        courseData = await demoCourseService.getCourseById(id!);
        courseError = courseData ? null : { message: 'Course not found' };

        if (courseData) {
          lessonsData = courseData.lessons || [];
          lessonsError = null;

          // Check enrollment
          const enrollments = await demoEnrollmentService.getEnrollments(user.id);
          enrollmentData = enrollments.find((e: any) => e.course_id === id);
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
          .eq('is_published', true)
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

          // Check if user is enrolled
          const enrollmentResult = await supabase
            .from('enrollments')
            .select(`
              *,
              lesson_progress(*)
            `)
            .eq('learner_id', user.id)
            .eq('course_id', id)
            .single();

          enrollmentData = enrollmentResult.data;
        }
      }

      if (courseError) {
        console.error('Error fetching course:', courseError);
        Alert.alert('Erreur', 'Cours introuvable ou non publié');
        router.back();
        return;
      }

      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
      }

      setCourse(courseData);
      setLessons(lessonsData || []);
      setEnrollment(enrollmentData);
    } catch (error) {
      console.error('Error fetching course details:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const handleEnroll = async () => {
    if (!course || !user) return;

    setEnrolling(true);

    try {
      let data: any, error: any;

      if (isDemoMode()) {
        // Use demo service
        const result = await demoEnrollmentService.enrollInCourse(user.id, course.id);
        data = result.data;
        error = result.error;
      } else {
        // Use Supabase
        const result = await supabase
          .from('enrollments')
          .insert({
            learner_id: user.id,
            course_id: course.id,
            progress: 0,
          })
          .select(`
            *,
            lesson_progress(*)
          `)
          .single();

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error enrolling:', error);
        Alert.alert('Erreur', 'Impossible de s\'inscrire au cours');
      } else {
        setEnrollment(data);
        Alert.alert('Succès', 'Inscription réussie! Vous pouvez maintenant accéder à toutes les leçons.');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setEnrolling(false);
    }
  };

  const renderLesson = ({ item, index }: { item: Lesson; index: number }) => {
    const isAccessible = enrollment || item.is_free;
    const lessonProgress = enrollment?.lesson_progress?.find(
      (progress: any) => progress.lesson_id === item.id
    );
    const isCompleted = lessonProgress?.completed || false;

    return (
      <LessonCard
        lesson={item}
        index={index + 1}
        onPress={() => {
          if (isAccessible) {
            router.push(`/(learner)/lesson/${item.id}`);
          } else {
            Alert.alert('Accès restreint', 'Vous devez vous inscrire au cours pour accéder à cette leçon');
          }
        }}
        showProgress={!!enrollment}
        completed={isCompleted}
      />
    );
  };

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

  const formatPrice = (price: number) => {
    return price === 0 ? t('course.free') : `${price.toLocaleString()} XAF`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Course Header */}
        <Card style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <AppText variant="h2" color="text">
              {course.title}
            </AppText>

            <View style={styles.courseInfo}>
              <AppText variant="body" color="textSecondary">
                {t('course.by')} {course.profiles?.full_name}
              </AppText>

              <View style={styles.badges}>
                {course.level && (
                  <Badge variant="primary" size="sm">
                    {t(`course.${course.level}`)}
                  </Badge>
                )}
                {course.category && (
                  <Badge variant="neutral" size="sm" style={{ marginLeft: theme.spacing.xs }}>
                    {course.category}
                  </Badge>
                )}
              </View>
            </View>

            {course.description && (
              <AppText variant="body" color="textSecondary" style={{ marginTop: theme.spacing.md }}>
                {course.description}
              </AppText>
            )}

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
                  {formatPrice(course.price)}
                </AppText>
                <AppText variant="caption" color="textLight">
                  Prix
                </AppText>
              </View>
            </View>
          </View>

          {/* Enrollment Status */}
          {enrollment ? (
            <View style={styles.enrollmentStatus}>
              <Badge variant="success" size="sm">
                Inscrit
              </Badge>
              <AppText variant="bodySmall" color="textSecondary" style={{ marginLeft: theme.spacing.sm }}>
                Progrès: {enrollment.progress}%
              </AppText>
            </View>
          ) : (
            <Button
              onPress={handleEnroll}
              loading={enrolling}
              style={{ marginTop: theme.spacing.lg }}
            >
              {course.price === 0 ? 'S\'inscrire gratuitement' : `S'inscrire pour ${formatPrice(course.price)}`}
            </Button>
          )}
        </Card>

        {/* Lessons List */}
        <Card style={styles.lessonsCard}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Contenu du cours ({lessons.length} leçons)
          </AppText>

          {lessons.length === 0 ? (
            <View style={styles.emptyLessons}>
              <AppText variant="body" color="textSecondary" align="center">
                Aucune leçon disponible
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

        {!enrollment && (
          <Card style={styles.previewCard}>
            <AppText variant="h4" color="text" style={{ marginBottom: theme.spacing.md }}>
              Aperçu gratuit
            </AppText>
            <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.md }}>
              Vous pouvez accéder aux leçons gratuites sans inscription.
              Inscrivez-vous pour débloquer tout le contenu.
            </AppText>

            {lessons.filter(lesson => lesson.is_free).length > 0 ? (
              <AppText variant="bodySmall" color="success">
                {lessons.filter(lesson => lesson.is_free).length} leçon(s) gratuite(s) disponible(s)
              </AppText>
            ) : (
              <AppText variant="bodySmall" color="textLight">
                Aucune leçon gratuite disponible
              </AppText>
            )}
          </Card>
        )}
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
  courseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  badges: {
    flexDirection: 'row',
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
  enrollmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  lessonsCard: {
    marginBottom: 16,
  },
  emptyLessons: {
    padding: 32,
  },
  previewCard: {
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF',
    borderWidth: 1,
  },
});
