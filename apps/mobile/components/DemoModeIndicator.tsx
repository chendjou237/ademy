import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { isDemoMode } from '../services/demoService';
import { AppText } from './ui';

export const DemoModeIndicator: React.FC = () => {
  const { theme } = useTheme();

  if (!isDemoMode()) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning }]}>
      <AppText variant="caption" color="warning">
        🚧 Mode Démonstration - Données fictives
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 8,
  },
});
