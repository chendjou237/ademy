import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrainerCourseCard } from '../../components/TrainerCourseCard';
import { AppText, Button, Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Course, supabase } from '../../lib/supabase';
import { demoCourseService, isDemoMode } from '@/services/demoService';

export default function TrainerCoursesScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = useCallback(async () => {
    if (!user) return;

    try {
      let data, error;

      if (isDemoMode()) {
        // Use demo service
        data = await demoCourseService.getTrainerCourses(user.id);
        error = null;
      } else {
        // Use Supabase
        const result = await supabase
          .from('courses')
          .select(`
            *,
            lessons(count),
            enrollments(count)
          `)
          .eq('trainer_id', user.id)
          .order('created_at', { ascending: false });

        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user, fetchCourses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const handleCreateCourse = () => {
    router.push('/(trainer)/create-course' as any);
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <TrainerCourseCard course={item} onPress={() => router.push(`/(trainer)/course/${item.id}` as any)} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="h2" color="text">
            {t('nav.myCourses')}
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
            Gérez et modifiez vos cours
          </AppText>
        </View>

        <Button
          onPress={handleCreateCourse}
          style={{ marginBottom: theme.spacing.lg }}
        >
          {t('course.createCourse')}
        </Button>

        <FlatList
          data={courses}
          renderItem={renderCourse}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.lg }} />}
          ListEmptyComponent={() => (
            <Card style={styles.emptyCard}>
              <AppText variant="body" color="textSecondary" align="center">
                {loading ? t('common.loading') : 'Vous n\'avez créé aucun cours'}
              </AppText>
              <AppText variant="bodySmall" color="textLight" align="center" style={{ marginTop: theme.spacing.sm }}>
                Créez votre premier cours pour commencer à enseigner
              </AppText>
              <Button
                onPress={handleCreateCourse}
                style={{ marginTop: theme.spacing.lg, alignSelf: 'center' }}
              >
                {t('course.createCourse')}
              </Button>
            </Card>
          )}
        />
      </View>
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
  listContent: {
    paddingBottom: 20,
  },
  emptyCard: {
    padding: 40,
  },
});
