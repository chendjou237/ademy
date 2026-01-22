import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '../../components/CourseCard';
import { AppText, Card, Input } from '../../components/ui';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Course, supabase } from '../../lib/supabase';
import { demoCourseService, isDemoMode } from '@/services/demoService';

export default function CoursesScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      let data, error;

      if (isDemoMode()) {
        // Use demo service
        data = await demoCourseService.getCourses();
        error = null;
      } else {
        // Use Supabase
        const result = await supabase
          .from('courses')
          .select(`
            *,
            profiles!courses_trainer_id_fkey(full_name, avatar_url),
            lessons(count)
          `)
          .eq('is_published', true)
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
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourse = ({ item }: { item: Course }) => (
    <CourseCard course={item} onPress={() => router.push(`/(learner)/course/${item.id}`)} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="h2" color="text">
            {t('nav.courses')}
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
            Découvrez des cours créés par des formateurs africains
          </AppText>
        </View>

        <Input
          placeholder={t('common.search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ marginBottom: theme.spacing.lg }}
        />

        <FlatList
          data={filteredCourses}
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
                {loading ? t('common.loading') : 'Aucun cours disponible'}
              </AppText>
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
