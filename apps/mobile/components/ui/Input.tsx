import React, { useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { AppText } from './AppText';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  fullWidth = true,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = [
    {
      borderWidth: 1,
      borderColor: error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      minHeight: 44,
    },
    fullWidth && { width: '100%' },
    style,
  ];

  return (
    <View style={fullWidth ? { width: '100%' } : undefined}>
      {label && (
        <AppText
          variant="bodySmall"
          color="text"
          style={{ marginBottom: theme.spacing.xs }}
        >
          {label}
        </AppText>
      )}
      <TextInput
        style={inputStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={theme.colors.textLight}
        {...props}
      />
      {(error || helperText) && (
        <AppText
          variant="caption"
          color={error ? 'error' : 'textSecondary'}
          style={{ marginTop: theme.spacing.xs }}
        >
          {error || helperText}
        </AppText>
      )}
    </View>
  );
};
