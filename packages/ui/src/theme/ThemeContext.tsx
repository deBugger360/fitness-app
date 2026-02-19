
import React, { createContext, useContext, useState } from 'react';
import { lightTheme, darkTheme, AppTheme } from './colors';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
    theme: AppTheme;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

// ─── Platform Hook ────────────────────────────────────────────────────────────

/**
 * Platform-agnostic system color scheme detection.
 *
 * - React Native: uses the built-in `useColorScheme` hook.
 * - Web / other environments: reads `window.matchMedia` directly,
 *   so we never import `react-native` in a web bundle.
 */
function useSystemScheme(): 'light' | 'dark' {
    // Detect RN at runtime — avoids importing react-native in web bundles.
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { useColorScheme } = require('react-native');
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const scheme = useColorScheme();
        return scheme === 'dark' ? 'dark' : 'light';
    } catch {
        // Web fallback — read from matchMedia
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
        }
        return 'light';
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    mode: 'system',
    setMode: () => { },
    isDark: false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * ThemeProvider — universal (React Native + React DOM).
 *
 * Wraps any subtree with shared design tokens.
 * On web, apply dark class to <html> based on `isDark` separately
 * (next-themes handles this at the layout level).
 *
 * Usage:
 *   // Mobile (App.js)
 *   <ThemeProvider><App /></ThemeProvider>
 *
 *   // Web — ThemeProvider provides the JS token context;
 *   // next-themes in layout.tsx drives the CSS class.
 */
export const ThemeProvider = ({
    children,
    defaultMode = 'system',
}: {
    children: React.ReactNode;
    defaultMode?: ThemeMode;
}) => {
    const systemScheme = useSystemScheme();
    const [mode, setMode] = useState<ThemeMode>(defaultMode);

    const resolvedScheme = mode === 'system' ? systemScheme : mode;
    const isDark = resolvedScheme === 'dark';
    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, mode, setMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * useTheme — access the current theme tokens and toggle function.
 *
 * Works identically in React Native and React DOM.
 *
 * @example
 *   const { theme, isDark, setMode } = useTheme();
 *   style={{ color: theme.colors.primary }}
 */
export const useTheme = () => useContext(ThemeContext);

/**
 * useThemeColors — convenience hook that returns just the color tokens.
 *
 * @example
 *   const colors = useThemeColors();
 *   <View style={{ backgroundColor: colors.background }} />
 */
export const useThemeColors = () => useContext(ThemeContext).theme.colors;
