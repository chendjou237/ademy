import React from 'react';
import { Text, TextProps } from 'react-native';

interface AppTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'textLight' | 'textInverse' | 'success' | 'error' | 'warning';
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = 'text',
  align = 'left',
  style,
  children,
  ...props
}) => {
  // Simple fallback colors
  const getColor = () => {
    switch (color) {
      case 'primary': return '#0070F0';
      case 'secondary': return '#00C27A';
      case 'text': return '#222222';
      case 'textSecondary': return '#666666';
      case 'textLight': return '#999999';
      case 'textInverse': return '#FFFFFF';
      case 'success': return '#00C27A';
      case 'error': return '#FF4444';
      case 'warning': return '#FF9500';
      default: return '#222222';
    }
  };

  // Simple fallback typography
  const getTypography = () => {
    switch (variant) {
      case 'h1': return { fontSize: 32, fontWeight: 'bold' as const };
      case 'h2': return { fontSize: 24, fontWeight: 'bold' as const };
      case 'h3': return { fontSize: 20, fontWeight: '600' as const };
      case 'h4': return { fontSize: 18, fontWeight: '600' as const };
      case 'body': return { fontSize: 16, fontWeight: 'normal' as const };
      case 'bodySmall': return { fontSize: 14, fontWeight: 'normal' as const };
      case 'caption': return { fontSize: 12, fontWeight: 'normal' as const };
      case 'button': return { fontSize: 16, fontWeight: '600' as const };
      default: return { fontSize: 16, fontWeight: 'normal' as const };
    }
  };

  const textStyle = [
    getTypography(),
    { color: getColor() },
    { textAlign: align },
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};
