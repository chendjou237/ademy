import { Session, User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Profile, supabase } from '../lib/supabase';
import { demoAuthService, isDemoMode } from '@/services/demoService';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'trainer' | 'learner') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);

      let data, error;

      if (isDemoMode()) {
        // Use demo service
        data = await demoAuthService.getProfile(userId);
        error = data ? null : { message: 'Profile not found' };
      } else {
        // Use Supabase
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Error fetching profile:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));

        if (error.code === 'PGRST116') {
          console.log('Profile not found - this is normal for new users');
        }
        setProfile(null);
      } else {
        console.log('Profile fetched successfully:', data);
        console.log('Profile role:', data?.role);
        console.log('Profile email:', data?.email);
        setProfile(data);

        // Force navigation based on role
        if (data?.role === 'trainer') {
          console.log('Profile loaded: Trainer -> Dashboard');
          router.replace('/(trainer)/dashboard');
        } else if (data?.role === 'learner') {
          console.log('Profile loaded: Learner -> Courses');
          router.replace('/(learner)/courses');
        }
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setProfile(null);
    } finally {
      console.log('Profile fetch completed, setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const initializeAuth = async () => {
      try {
        // Set a safety timeout
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout reached');
            setLoading(false);
          }
        }, 8000);

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }

        console.log('Initial session check:', session ? 'Session found' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Keep loading true until profile is fetched
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session ? 'Session exists' : 'No session');

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Keep loading true until profile is fetched
          fetchProfile(session.user.id);

          // Navigation will be handled by index.tsx after profile is loaded
        } else {
          setProfile(null);
          setLoading(false);

          // If this is a sign out event, navigate to login
          if (event === 'SIGNED_OUT') {
            console.log('User signed out, navigating to login');
            router.replace('/(auth)/login');
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);



  const signIn = async (email: string, password: string) => {
    setLoading(true);

    if (isDemoMode()) {
      // Use demo service
      const { user, error } = await demoAuthService.signIn(email, password);

      if (error) {
        setLoading(false);
        return { error };
      }

      if (user) {
        // Simulate session for demo mode
        const mockSession = {
          user: { id: user.id, email: user.email },
        } as Session;

        setSession(mockSession);
        setUser(mockSession.user as User);

        // Fetch profile
        await fetchProfile(user.id);
      }

      return { error: null };
    } else {
      // Use Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If there's an error, reset loading state
      if (error) {
        setLoading(false);
      }
      // Let the onAuthStateChange handle navigation after profile is fetched

      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'trainer' | 'learner') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      return { error };
    }

    // Create profile record
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: role,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return { error: profileError };
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    console.log('Starting sign out process');
    setLoading(true);

    try {
      if (isDemoMode()) {
        await demoAuthService.signOut();
      } else {
        await supabase.auth.signOut();
      }
      console.log('Sign out completed');
    } catch (error) {
      console.error('Error during sign out:', error);
    }

    // Reset state immediately
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);

    console.log('Sign out state reset completed');

    // Force navigation to login
    router.replace('/(auth)/login');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    let error;

    if (isDemoMode()) {
      const result = await demoAuthService.updateProfile(user.id, updates);
      error = result.error;
    } else {
      const result = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      error = result.error;
    }

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
