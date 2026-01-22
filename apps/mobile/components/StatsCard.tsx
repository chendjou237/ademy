import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { AppText, Card } from './ui';

interface StatsCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color }) => {
  const { theme } = useTheme();

  return (
    <Card style={[styles.container, { width: '48%', marginBottom: 8 }]} padding="md">
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.colors[color]}20` }]}>
          <Ionicons
            name={icon}
            size={24}
            color={theme.colors[color]}
          />
        </View>

        <View style={styles.textContainer}>
          <AppText variant="h3" color="text">
            {value}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {title}
          </AppText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
});
