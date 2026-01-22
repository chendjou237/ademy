import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppText } from './AppText';

interface ProgressBarProps extends ViewProps {
  progress: number; // 0-100
  showLabel?: boolean;
  height?: number;
  color?: 'primary' | 'secondary' | 'success';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = false,
  height = 8,
  color = 'primary',
  style,
  ...props
}) => {
  const { theme } = useTheme();

  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[{ width: '100%' }, style]} {...props}>
      {showLabel && (
        <AppText
          variant="caption"
          color="textSecondary"
          style={{ marginBottom: theme.spacing.xs }}
        >
          {Math.round(clampedProgress)}%
        </AppText>
      )}
      <View
        style={{
          height,
          backgroundColor: theme.colors.borderLight,
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${clampedProgress}%`,
            backgroundColor: theme.colors[color],
            borderRadius: height / 2,
          }}
        />
      </View>
    </View>
  );
};
