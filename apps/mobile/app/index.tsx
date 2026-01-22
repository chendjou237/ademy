import { router } from 'expo-router';
import { useEffect } from 'react';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../contexts/AuthContext';

export default function IndexScreen() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    console.log('=== IndexScreen Navigation Debug ===');
    console.log('Loading:', loading);
    console.log('User exists:', !!user);
    console.log('User ID:', user?.id);
    console.log('Profile:', profile);
    console.log('Profile role:', profile?.role);
    console.log('Profile email:', profile?.email);

    if (!loading) {
      console.log('=== Navigation Decision ===');

      if (!user) {
        console.log('DECISION: No user -> Login');
        router.replace('/(auth)/login');
      } else if (profile?.role === 'trainer') {
        console.log('DECISION: Trainer -> Dashboard');
        router.replace('/(trainer)/dashboard');
      } else if (profile?.role === 'learner') {
        console.log('DECISION: Learner -> Courses');
        router.replace('/(learner)/courses');
      } else if (user && !profile) {
        // User exists but no profile - wait a bit more or redirect to login
        console.log('DECISION: User exists but no profile, waiting...');
        const timeoutId = setTimeout(() => {
          console.log('TIMEOUT: Still no profile, redirecting to login');
          router.replace('/(auth)/login');
        }, 2000);
        return () => clearTimeout(timeoutId);
      } else {
        console.log('DECISION: Unknown state -> Learner (fallback)');
        console.log('Profile object:', JSON.stringify(profile, null, 2));
        router.replace('/(learner)/courses');
      }
    }
  }, [user, profile, loading]);

  return <LoadingScreen />;
}
