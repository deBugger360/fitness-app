
// ─────────────────────────────────────────────────────────────────────────────
// Primitive Palette
// Tailwind-inspired color scale — the raw building blocks.
// ─────────────────────────────────────────────────────────────────────────────
export const palette = {
    slate: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
    },
    indigo: {
        50: '#eef2ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1',
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
    },
    emerald: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
    },
    amber: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
    },
    red: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
    },
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Semantic Tokens — Light Mode
// These are the values both web (CSS vars) and mobile (StyleSheet) consume.
// ─────────────────────────────────────────────────────────────────────────────
export const lightTheme = {
    dark: false as const,
    colors: {
        // Surfaces
        background: palette.slate[50],
        card: palette.white,
        popover: palette.white,

        // Text
        text: palette.slate[900],
        textSecondary: palette.slate[500],
        textMuted: palette.slate[400],

        // Brand
        primary: palette.indigo[600],
        primaryLight: palette.indigo[100],
        primaryForeground: palette.white,

        // Semantic
        success: palette.emerald[500],
        successLight: palette.emerald[100],
        successForeground: palette.white,

        warning: palette.amber[500],
        warningLight: palette.amber[100],
        warningForeground: palette.white,

        error: palette.red[500],
        errorLight: palette.red[100],
        errorForeground: palette.white,

        // Structural
        border: palette.slate[200],
        input: palette.slate[200],
        ring: palette.indigo[500],
        separator: palette.slate[100],

        // Navigation
        tint: palette.indigo[600],
        tabBar: palette.white,
        tabBarInactive: palette.slate[400],

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.4)',
        glass: 'rgba(255, 255, 255, 0.7)',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Semantic Tokens — Dark Mode
// ─────────────────────────────────────────────────────────────────────────────
export const darkTheme = {
    dark: true as const,
    colors: {
        // Surfaces
        background: palette.slate[950],
        card: palette.slate[900],
        popover: palette.slate[800],

        // Text
        text: palette.slate[50],
        textSecondary: palette.slate[400],
        textMuted: palette.slate[500],

        // Brand — brighter for dark backgrounds
        primary: palette.indigo[400],
        primaryLight: 'rgba(99, 102, 241, 0.15)',
        primaryForeground: palette.slate[900],

        // Semantic
        success: palette.emerald[400],
        successLight: 'rgba(52, 211, 153, 0.15)',
        successForeground: palette.slate[900],

        warning: palette.amber[400],
        warningLight: 'rgba(251, 191, 36, 0.15)',
        warningForeground: palette.slate[900],

        error: palette.red[400],
        errorLight: 'rgba(248, 113, 113, 0.15)',
        errorForeground: palette.slate[900],

        // Structural
        border: palette.slate[800],
        input: palette.slate[800],
        ring: palette.indigo[400],
        separator: palette.slate[800],

        // Navigation
        tint: palette.indigo[400],
        tabBar: palette.slate[900],
        tabBarInactive: palette.slate[500],

        // Overlays
        overlay: 'rgba(0, 0, 0, 0.6)',
        glass: 'rgba(15, 23, 42, 0.7)',
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Spacing & Shape Tokens
// ─────────────────────────────────────────────────────────────────────────────
export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
} as const;

export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    full: 9999,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Typography Tokens
// ─────────────────────────────────────────────────────────────────────────────
export const fontSize = {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 40,
} as const;

export const fontWeight = {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
};

export const lineHeight = {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Shadow Tokens (React Native format)
// ─────────────────────────────────────────────────────────────────────────────
export const shadows = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
    },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Font Family Tokens
// Web uses Geist (loaded by Next.js) with system fallbacks.
// Mobile uses the platform system font stack.
// Both apps share the same semantic names; the value differs per platform.
// ─────────────────────────────────────────────────────────────────────────────
export const fontFamily = {
    /**
     * Primary sans-serif — Geist on web, system on mobile.
     * On web, `var(--font-geist-sans)` is injected by Next.js; this string
     * is used as the React Native value only.
     */
    sans: 'System',         // RN: system font. Web: overridden by CSS var.
    mono: 'Courier New',    // RN: monospace. Web: Geist Mono via CSS var.
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Composite Typography Scale
// Single object grouping all typographic design decisions.
// ─────────────────────────────────────────────────────────────────────────────
export const typography = {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Theme Type Exports
// ─────────────────────────────────────────────────────────────────────────────
export type AppTheme = typeof lightTheme | typeof darkTheme;
export type ThemeColors = typeof lightTheme.colors;
export type Spacing = typeof spacing;
export type FontSize = typeof fontSize;
export type FontWeight = typeof fontWeight;
export type Typography = typeof typography;
export type Shadows = typeof shadows;

