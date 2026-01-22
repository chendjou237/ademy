import { router } from 'expo-router';
import { useEffect } from 'react';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useAuth } from '../../contexts/AuthContext';

export default function IndexScreen() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, go to auth
        router.replace('/(auth)/login' as any);
      } else if (profile?.role === 'trainer') {
        // Trainer, go to trainer dashboard
        router.replace('/(trainer)/dashboard' as any);
      } else {
        // Learner, go to courses
        router.replace('/(learner)/courses' as any);
      }
    }
  }, [user, profile, loading]);

  return <LoadingScreen />;
}
