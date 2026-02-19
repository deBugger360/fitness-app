"use client";

/**
 * useWebTheme — bridges next-themes ↔ @repo/ui design tokens for web.
 *
 * Problem: Web uses `next-themes` (class-based dark mode, SSR-safe) while
 * mobile uses `@repo/ui` ThemeProvider. This hook unifies the API:
 * both platforms can call `theme.colors.primary` identically.
 *
 * Usage:
 *   const { theme, isDark, setMode } = useWebTheme();
 *   // theme.colors.primary === '#4f46e5' (light) or '#818cf8' (dark)
 */

import { useTheme as useNextTheme } from 'next-themes';
import { lightTheme, darkTheme, AppTheme, ThemeMode } from '@repo/ui';

export interface WebThemeResult {
    theme: AppTheme;
    isDark: boolean;
    /** 'light' | 'dark' | 'system' */
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    /** true while next-themes is resolving (SSR hydration) */
    isLoading: boolean;
}

export function useWebTheme(): WebThemeResult {
    const { resolvedTheme, theme: rawTheme, setTheme, systemTheme } = useNextTheme();

    const isDark = resolvedTheme === 'dark';
    const theme = isDark ? darkTheme : lightTheme;

    const mode: ThemeMode = (rawTheme === 'dark' || rawTheme === 'light')
        ? rawTheme
        : 'system';

    const setMode = (newMode: ThemeMode) => setTheme(newMode);

    // isLoading: next-themes hasn't resolved yet (e.g. SSR)
    const isLoading = !resolvedTheme;

    return { theme, isDark, mode, setMode, isLoading };
}
