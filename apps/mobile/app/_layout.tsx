import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../contexts/AuthContext';
import { I18nProvider } from '../contexts/I18nContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(trainer)" />
              <Stack.Screen name="(learner)" />
              <Stack.Screen
                name="demo"
                options={{
                  headerShown: true,
                  title: 'Design System Demo',
                  presentation: 'modal'
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </NavigationThemeProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}
