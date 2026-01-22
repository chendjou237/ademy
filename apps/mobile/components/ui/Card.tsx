import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  shadow = 'sm',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const paddingStyles = {
    none: 0,
    sm: theme.spacing.sm,
    md: theme.spacing.lg,
    lg: theme.spacing.xl,
  };

  const cardStyle = [
    {
      backgroundColor: theme?.colors?.surface || '#F5F5F5',
      borderRadius: theme?.radius?.lg || 12,
      padding: paddingStyles[padding] || 16,
    },
    theme?.shadows?.[shadow] || {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    style,
  ];

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};
