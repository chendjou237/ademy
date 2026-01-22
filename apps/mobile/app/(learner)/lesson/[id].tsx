import { demoEnrollmentService, demoLessonService, isDemoMode } from '@/services/demoService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Badge, Button, Card } from '../../../components/ui';
import { VideoPlayer } from '../../../components/VideoPlayer';
import { useAuth } from '../../../contexts/AuthContext';
import { useI18n } from '../../../contexts/I18nContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { Course, Enrollment, Lesson, supabase } from '../../../lib/supabase';

// Extended lesson type with course data
interface LessonWithCourse extends Lesson {
  course: Course & {
    profiles?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export default function LessonViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();

  const [lesson, setLesson] = useState<LessonWithCourse | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchLessonData();
    }
  }, [ id, user]);

  const fetchLessonData = useCallback(async () => {
    if (!user) return;

    try {
      let lessonData: any, enrollmentData: any, lessonError: any, enrollmentError: any;

      if (isDemoMode()) {
        // Use demo services
        lessonData = await demoLessonService.getLessonById(id!);
        lessonError = lessonData ? null : { message: 'Lesson not found' };

        if (lessonData) {
          const enrollments = await demoEnrollmentService.getEnrollments(user.id);
          enrollmentData = enrollments.find((e: any) => e.course_id === lessonData.course_id);
          enrollmentError = enrollmentData ? null : { message: 'Not enrolled' };
        }
      } else {
        // Use Supabase
        const lessonResult = await supabase
          .from('lessons')
          .select(`
            *,
            course:courses(
              *,
              profiles!courses_trainer_id_fkey(full_name, avatar_url)
            )
          `)
          .eq('id', id)
          .single();

        lessonData = lessonResult.data;
        lessonError = lessonResult.error;

        if (lessonData) {
          const enrollmentResult = await supabase
            .from('enrollments')
            .select(`
              *,
              lesson_progress(*)
            `)
            .eq('learner_id', user.id)
            .eq('course_id', lessonData.course.id)
            .single();

          enrollmentData = enrollmentResult.data;
          enrollmentError = enrollmentResult.error;
        }
      }

      if (lessonError) {
        console.error('Error fetching lesson:', lessonError);
        Alert.alert('Erreur', 'Impossible de charger la leçon');
        return;
      }

      if (enrollmentError) {
        console.error('Error fetching enrollment:', enrollmentError);
        Alert.alert('Erreur', 'Vous n\'êtes pas inscrit à ce cours');
        router.back();
        return;
      }

      // Check if lesson is completed
      const lessonProgress = enrollmentData?.lesson_progress?.find(
        (progress: any) => progress.lesson_id === lessonData.id
      );

      setLesson(lessonData as LessonWithCourse);
      setEnrollment(enrollmentData);
      setIsCompleted(lessonProgress?.completed || false);
    } catch (error) {
      console.error('Error fetching lesson data:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const markAsComplete = async () => {
    if (!lesson || !enrollment || !user) return;

    setMarkingComplete(true);

    try {
      if (isDemoMode()) {
        // Use demo service
        const { error } = await demoEnrollmentService.updateProgress(
          enrollment.id,
          lesson.id,
          true
        );

        if (error) {
          console.error('Error marking lesson complete:', error);
          Alert.alert('Erreur', 'Impossible de marquer la leçon comme terminée');
          return;
        }
      } else {
        // Use Supabase
        const { error: progressError } = await supabase
          .from('lesson_progress')
          .upsert({
            enrollment_id: enrollment.id,
            lesson_id: lesson.id,
            completed: true,
            completed_at: new Date().toISOString(),
          });

        if (progressError) {
          console.error('Error marking lesson complete:', progressError);
          Alert.alert('Erreur', 'Impossible de marquer la leçon comme terminée');
          return;
        }

        // Update course progress
        const { data: allLessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', lesson.course.id);

        const { data: completedLessons } = await supabase
          .from('lesson_progress')
          .select('lesson_id')
          .eq('enrollment_id', enrollment.id)
          .eq('completed', true);

        const totalLessons = allLessons?.length || 0;
        const completedCount = (completedLessons?.length || 0) + (isCompleted ? 0 : 1);
        const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

        await supabase
          .from('enrollments')
          .update({ progress: progressPercentage })
          .eq('id', enrollment.id);
      }

      setIsCompleted(true);
      Alert.alert('Félicitations!', 'Leçon marquée comme terminée');
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleVideoComplete = () => {
    if (!isCompleted) {
      markAsComplete();
    }
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

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <AppText variant="body" color="error">
            Leçon introuvable
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content}>
        {/* Video Player */}
        {lesson.video_url && (
          <View style={styles.videoContainer}>
            <VideoPlayer
              videoId={lesson.bunny_video_id}
              videoUrl={lesson.video_url}
              title={lesson.title}
              onComplete={handleVideoComplete}
            />
          </View>
        )}

        {/* Lesson Info */}
        <Card style={styles.lessonCard}>
          <View style={styles.lessonHeader}>
            <AppText variant="h2" color="text">
              {lesson.title}
            </AppText>

            <View style={styles.badges}>
              {isCompleted && (
                <Badge variant="success" size="sm">
                  Terminé
                </Badge>
              )}
              {lesson.is_free && (
                <Badge variant="secondary" size="sm" style={{ marginLeft: theme.spacing.xs }}>
                  Gratuit
                </Badge>
              )}
            </View>
          </View>

          {lesson.description && (
            <AppText variant="body" color="textSecondary" style={{ marginTop: theme.spacing.md }}>
              {lesson.description}
            </AppText>
          )}

          <View style={styles.lessonMeta}>
            <AppText variant="bodySmall" color="textLight">
              Cours: {lesson.course.title}
            </AppText>
            {lesson.duration_minutes && (
              <AppText variant="bodySmall" color="textLight">
                Durée: {lesson.duration_minutes} minutes
              </AppText>
            )}
            <AppText variant="bodySmall" color="textLight">
              Par: {lesson.course.profiles?.full_name}
            </AppText>
          </View>

          {!isCompleted && (
            <Button
              onPress={markAsComplete}
              loading={markingComplete}
              style={{ marginTop: theme.spacing.lg }}
            >
              {t('lesson.markComplete')}
            </Button>
          )}
        </Card>

        {/* Video Status Info - Removed since we ignore status and always show video */}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  lessonCard: {
    margin: 16,
    marginTop: 16,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badges: {
    flexDirection: 'row',
    marginLeft: 16,
  },
  lessonMeta: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statusCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFF9E6',
    borderColor: '#FFD700',
    borderWidth: 1,
  },
});
