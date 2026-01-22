import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { DEMO_CREDENTIALS, isDemoMode } from '../services/demoService';
import { AppText, Button, Card } from './ui';

interface DemoCredentialsProps {
  onCredentialSelect: (email: string, password: string) => void;
}

export const DemoCredentials: React.FC<DemoCredentialsProps> = ({ onCredentialSelect }) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  if (!isDemoMode()) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button
        variant="outline"
        onPress={() => setIsVisible(!isVisible)}
        style={[styles.toggleButton, { borderColor: theme.colors.primary }]}
      >
        <AppText variant="button" color="primary">
          {isVisible ? 'Masquer' : 'Comptes de démo'}
        </AppText>
      </Button>

      {isVisible && (
        <Card style={[styles.credentialsCard, { backgroundColor: theme.colors.surface }]}>
          <AppText variant="h4" color="text" style={{ marginBottom: theme.spacing.md }}>
            Comptes de démonstration
          </AppText>

          <View style={styles.credentialItem}>
            <AppText variant="bodySmall" color="textSecondary">
              Formateur
            </AppText>
            <AppText variant="body" color="text">
              {DEMO_CREDENTIALS.trainer.email}
            </AppText>
            <AppText variant="bodySmall" color="textLight">
              Mot de passe: {DEMO_CREDENTIALS.trainer.password}
            </AppText>
            <Button
              variant="primary"
              size="sm"
              onPress={() => onCredentialSelect(DEMO_CREDENTIALS.trainer.email, DEMO_CREDENTIALS.trainer.password)}
              style={{ marginTop: theme.spacing.sm }}
            >
              Utiliser ce compte
            </Button>
          </View>

          <View style={[styles.credentialItem, { marginTop: theme.spacing.lg }]}>
            <AppText variant="bodySmall" color="textSecondary">
              Apprenant
            </AppText>
            <AppText variant="body" color="text">
              {DEMO_CREDENTIALS.learner.email}
            </AppText>
            <AppText variant="bodySmall" color="textLight">
              Mot de passe: {DEMO_CREDENTIALS.learner.password}
            </AppText>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => onCredentialSelect(DEMO_CREDENTIALS.learner.email, DEMO_CREDENTIALS.learner.password)}
              style={{ marginTop: theme.spacing.sm }}
            >
              Utiliser ce compte
            </Button>
          </View>

          <View style={[styles.demoNote, { backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning }]}>
            <AppText variant="caption" color="warning">
              ⚠️ Mode démonstration activé - Données fictives
            </AppText>
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  toggleButton: {
    marginBottom: 8,
  },
  credentialsCard: {
    padding: 16,
  },
  credentialItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  demoNote: {
    marginTop: 16,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
  },
});
