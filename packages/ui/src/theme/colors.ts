
// Tailwind-inspired colors
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
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
    },
    amber: {
        50: '#fffbeb',
        100: '#fef3c7',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
    },
    red: {
        50: '#fef2f2',
        100: '#fee2e2',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
    },
};

export const lightTheme = {
    dark: false,
    colors: {
        background: palette.slate[50], // f8fafc
        card: '#ffffff',
        text: palette.slate[900],
        textSecondary: palette.slate[500],
        border: palette.slate[200],
        primary: palette.indigo[600],
        primaryLight: palette.indigo[100],
        success: palette.emerald[500],
        successLight: palette.emerald[100],
        warning: palette.amber[500],
        warningLight: palette.amber[100],
        error: palette.red[500],
        errorLight: palette.red[100],
        tint: palette.indigo[600],
        tabBar: '#ffffff',
    }
};

export const darkTheme = {
    dark: true,
    colors: {
        background: palette.slate[950], // Very dark slate
        card: palette.slate[900],
        text: palette.slate[100],
        textSecondary: palette.slate[400],
        border: palette.slate[800],
        primary: palette.indigo[400], // Brighter for dark mode
        primaryLight: 'rgba(99, 102, 241, 0.2)',
        success: palette.emerald[400],
        successLight: 'rgba(52, 211, 153, 0.2)',
        warning: palette.amber[400],
        warningLight: 'rgba(251, 191, 36, 0.2)',
        error: palette.red[400],
        errorLight: 'rgba(248, 113, 113, 0.2)',
        tint: palette.indigo[400],
        tabBar: palette.slate[900],
    }
};

export type AppTheme = typeof lightTheme;
