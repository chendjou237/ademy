import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppText } from './AppText';

interface BadgeProps extends ViewProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'md',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.radius.sm,
    },
    md: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.md,
    },
  };

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
    },
    success: {
      backgroundColor: theme.colors.success,
    },
    warning: {
      backgroundColor: theme.colors.warning,
    },
    error: {
      backgroundColor: theme.colors.error,
    },
    neutral: {
      backgroundColor: theme.colors.border,
    },
  };

  const getTextColor = () => {
    return variant === 'neutral' ? 'text' : 'textInverse';
  };

  const badgeStyle = [
    {
      alignSelf: 'flex-start' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    sizeStyles[size],
    variantStyles[variant],
    style,
  ];

  return (
    <View style={badgeStyle} {...props}>
      <AppText
        variant={size === 'sm' ? 'caption' : 'bodySmall'}
        color={getTextColor()}
      >
        {children}
      </AppText>
    </View>
  );
};
