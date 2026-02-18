
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, AppTheme } from './colors';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: AppTheme;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: lightTheme,
    mode: 'system',
    setMode: () => { },
    isDark: false,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const systemScheme = useColorScheme();
    const [mode, setMode] = useState<ThemeMode>('system');

    // Determine actual theme based on mode setting and system preference
    const activeScheme = mode === 'system' ? systemScheme : mode;
    const isDark = activeScheme === 'dark';
    const theme = isDark ? darkTheme : lightTheme;

    // Persist preference logic would go here (e.g. AsyncStorage)
    // For now, simple state is enough for MVP

    return (
        <ThemeContext.Provider value={{ theme, mode, setMode, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
