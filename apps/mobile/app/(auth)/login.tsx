import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DemoCredentials } from '@/components/DemoCredentials';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoCredentials = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Erreur de connexion', error.message);
    } else {
      // Force navigation to index which will handle role-based routing
      console.log('Login successful, forcing navigation to index');
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppText variant="h1" color="primary" align="center">
            Ademy
          </AppText>
          <AppText variant="h3" color="text" align="center" style={{ marginTop: 8 }}>
            Bienvenue de retour
          </AppText>
        </View>

        <DemoCredentials onCredentialSelect={handleDemoCredentials} />

        <Card style={styles.card}>
          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="votre@email.com"
          />

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            style={{ marginTop: theme.spacing.lg }}
          />

          <Button
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: theme.spacing.xl }}
          >
            Se connecter
          </Button>

          <Button
            variant="ghost"
            onPress={() => router.push('/(auth)/signup' as any)}
            style={{ marginTop: theme.spacing.lg }}
          >
            {t('auth.dontHaveAccount')} {t('auth.createAccount')}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    marginBottom: 32,
  },
  card: {
    marginHorizontal: 0,
  },
});
