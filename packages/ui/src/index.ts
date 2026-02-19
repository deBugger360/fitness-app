/**
 * @repo/ui — Shared Design System
 *
 * Exports:
 * - Color tokens (palette, lightTheme, darkTheme)
 * - Spacing, radius, shadow tokens
 * - Typography scale (fontFamily, fontSize, fontWeight, lineHeight)
 * - ThemeProvider, useTheme, useThemeColors (universal — RN + React DOM)
 * - CSS variable utilities (for web)
 */

// Design tokens
export {
    palette,
    lightTheme,
    darkTheme,
    spacing,
    radius,
    fontSize,
    fontWeight,
    fontFamily,
    lineHeight,
    shadows,
    typography,
} from './theme/colors';

// Type exports
export type {
    AppTheme,
    ThemeColors,
    Spacing,
    FontSize,
    FontWeight,
    Typography,
    Shadows,
} from './theme/colors';

// Context / hooks (universal: React Native + React DOM)
export {
    ThemeProvider,
    useTheme,
    useThemeColors,
} from './theme/ThemeContext';

export type {
    ThemeMode,
    ThemeContextType,
} from './theme/ThemeContext';

// Web-only: CSS variable utilities
export {
    lightColorVars,
    darkColorVars,
    radiusVars,
    spacingVars,
    lightCssVars,
    darkCssVars,
    LIGHT_CSS_VARS_BLOCK,
    DARK_CSS_VARS_BLOCK,
    SYSTEM_DARK_CSS_VARS_BLOCK,
    getThemeVars,
} from './theme/cssVariables';
