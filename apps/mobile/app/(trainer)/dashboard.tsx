import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatsCard } from '../../components/StatsCard';
import { AppText, Button, Card } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import { demoStatsService, isDemoMode } from '@/services/demoService';

interface DashboardStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  totalRevenue: number;
  accountBalance: number;
}

export default function TrainerDashboardScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    accountBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      if (isDemoMode()) {
        // Use demo service
        const demoStats = await demoStatsService.getTrainerStats(user.id);
        setStats(demoStats);
      } else {
        // Use Supabase
        // Fetch course stats
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('id, is_published, price')
          .eq('trainer_id', user.id);

        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
          return;
        }

        // Fetch enrollment stats
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            id,
            course:courses!inner(
              trainer_id,
              price
            )
          `)
          .eq('course.trainer_id', user.id);

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
          return;
        }

        const totalCourses = courses?.length || 0;
        const publishedCourses = courses?.filter(c => c.is_published).length || 0;
        const totalStudents = enrollments?.length || 0;
        const totalRevenue = enrollments?.reduce((sum, e) => {
          const coursePrice = (e as any).course?.price || 0;
          return sum + coursePrice;
        }, 0) || 0;

        // For now, account balance is 70% of total revenue (assuming 30% platform fee)
        const accountBalance = Math.floor(totalRevenue * 0.7);

        setStats({
          totalCourses,
          publishedCourses,
          totalStudents,
          totalRevenue,
          accountBalance,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <AppText variant="h2" color="text">
            {t('nav.dashboard')}
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginTop: theme.spacing.xs }}>
            Gérez vos cours et suivez vos performances
          </AppText>
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            title="Total Cours"
            value={loading ? "..." : stats.totalCourses.toString()}
            icon="library"
            color="primary"
          />
          <StatsCard
            title="Cours Publiés"
            value={loading ? "..." : stats.publishedCourses.toString()}
            icon="checkmark-circle"
            color="success"
          />
          <StatsCard
            title="Étudiants"
            value={loading ? "..." : stats.totalStudents.toString()}
            icon="people"
            color="secondary"
          />
          <StatsCard
            title="Revenus Totaux"
            value={loading ? "..." : `${stats.totalRevenue.toLocaleString()} XAF`}
            icon="trending-up"
            color="warning"
          />
          <StatsCard
            title="Solde Compte"
            value={loading ? "..." : `${stats.accountBalance.toLocaleString()} XAF`}
            icon="wallet"
            color="success"
          />
        </View>

        <Card style={styles.actionCard}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Actions Rapides
          </AppText>

          <Button
            onPress={() => router.push('/(trainer)/create-course')}
            style={{ marginBottom: theme.spacing.md }}
          >
            Créer un nouveau cours
          </Button>

          <Button
            variant="outline"
            onPress={() => router.push('/(trainer)/my-courses')}
          >
            Voir tous mes cours
          </Button>
        </Card>

        <Card style={styles.tipsCard}>
          <AppText variant="h3" color="text" style={{ marginBottom: theme.spacing.lg }}>
            Conseils pour Formateurs
          </AppText>

          <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.md }}>
            • Créez des titres de cours accrocheurs et descriptifs
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.md }}>
            • Ajoutez des descriptions détaillées avec des objectifs clairs
          </AppText>
          <AppText variant="body" color="textSecondary" style={{ marginBottom: theme.spacing.md }}>
            • Organisez vos leçons de manière logique et progressive
          </AppText>
          <AppText variant="body" color="textSecondary">
            • Interagissez avec vos étudiants pour améliorer l&apos;engagement
          </AppText>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  actionCard: {
    marginBottom: 16,
  },
  tipsCard: {
    marginBottom: 20,
  },
});
