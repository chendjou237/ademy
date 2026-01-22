import { colors, Colors } from './colors';
import { radius, Radius, shadows, Shadows, spacing, Spacing } from './spacing';
import { typography, Typography } from './typography';

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: Shadows;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: {
    ...colors,
    background: colors.dark.background,
    surface: colors.dark.surface,
    surfaceLight: colors.dark.surfaceLight,
    text: colors.dark.text,
    textSecondary: colors.dark.textSecondary,
    textLight: colors.dark.textLight,
    border: colors.dark.border,
    borderLight: colors.dark.borderLight,
  },
  typography,
  spacing,
  radius,
  shadows,
  isDark: true,
};

export * from './colors';
export * from './spacing';
export * from './typography';
