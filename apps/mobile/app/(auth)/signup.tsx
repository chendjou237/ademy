import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText, Button, Card, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function SignupScreen() {
  const { theme } = useTheme();
  const { t } = useI18n();
  const { signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'trainer' | 'learner'>('learner');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);

    if (error) {
      Alert.alert('Erreur d\'inscription', error.message);
    } else {
      Alert.alert('Succès', 'Compte créé avec succès!');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <AppText
            variant="h1"
            color="primary"
            align="center"
            style={{ fontSize: 32, fontWeight: 'bold', color: '#0070F0' }}
          >
            Ademy
          </AppText>
          <AppText
            variant="h3"
            color="text"
            align="center"
            style={{
              marginTop: theme.spacing.sm,
              fontSize: 20,
              fontWeight: '600',
              color: '#222222'
            }}
          >
            {t('auth.createAccount')}
          </AppText>
        </View>

        <Card style={styles.card}>
          <Input
            label={t('auth.fullName')}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Votre nom complet"
          />

          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="votre@email.com"
            style={{ marginTop: theme.spacing.lg }}
          />

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            style={{ marginTop: theme.spacing.lg }}
          />

          <View style={{ marginTop: theme.spacing.lg }}>
            <AppText variant="bodySmall" color="text" style={{ marginBottom: theme.spacing.xs }}>
              {t('auth.role')}
            </AppText>
            <View style={[styles.pickerContainer, { borderColor: theme.colors.border }]}>
              <Picker
                selectedValue={role}
                onValueChange={setRole}
                style={{ color: theme.colors.text }}
              >
                <Picker.Item label={t('auth.learner')} value="learner" />
                <Picker.Item label={t('auth.trainer')} value="trainer" />
              </Picker>
            </View>
          </View>

          <Button
            onPress={handleSignup}
            loading={loading}
            style={{ marginTop: theme.spacing.xl }}
          >
            {t('auth.signUp')}
          </Button>

          <Button
            variant="ghost"
            onPress={() => router.push('/(auth)/login' as any)}
            style={{ marginTop: theme.spacing.lg }}
          >
            {t('auth.alreadyHaveAccount')} {t('auth.signIn')}
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
