import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: theme.radius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      ...theme.shadows.sm,
    };

    const sizeStyles = {
      sm: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: theme.spacing['2xl'],
        paddingVertical: theme.spacing.lg,
        minHeight: 52,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderWidth: 0,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
        borderWidth: 0,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
    };

    const styles = [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
    ];

    if (fullWidth) {
      styles.push({ width: '100%' as const });
    }

    if (disabled || loading) {
      styles.push({ opacity: 0.6 });
    }

    return styles;
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return 'textInverse';
      case 'outline':
        return 'primary';
      case 'ghost':
        return 'text';
      default:
        return 'textInverse';
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={theme.colors[getTextColor()]}
          style={{ marginRight: theme.spacing.sm }}
        />
      )}
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: theme?.colors?.[getTextColor()] || '#FFFFFF'
      }}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};
