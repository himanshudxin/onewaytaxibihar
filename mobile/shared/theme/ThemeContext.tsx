import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { Colors } from './colors';
import { StorageService } from '../services/storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeContextType {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  colors: typeof Colors.dark;
}

const THEME_STORAGE_KEY = 'otb_app_theme_mode';

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  setThemeMode: async () => {},
  isDark: true,
  colors: Colors.dark
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [activeScheme, setActiveScheme] = useState<'light' | 'dark'>(() => {
    return systemScheme === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    // 1. Load user's saved preference from Storage
    StorageService.getItem(THEME_STORAGE_KEY).then(saved => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeModeState(saved as ThemeMode);
        if (saved === 'light' || saved === 'dark') {
          setActiveScheme(saved);
        } else {
          const sys = Appearance.getColorScheme();
          setActiveScheme(sys === 'light' ? 'light' : 'dark');
        }
      }
    });

    // 2. React to dynamic OS-level appearance change
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        setActiveScheme(colorScheme === 'light' ? 'light' : 'dark');
      }
    });

    return () => sub.remove();
  }, [themeMode]);

  useEffect(() => {
    if (themeMode === 'system') {
      const current = Appearance.getColorScheme() || systemScheme;
      setActiveScheme(current === 'light' ? 'light' : 'dark');
    } else {
      setActiveScheme(themeMode);
    }
  }, [themeMode, systemScheme]);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await StorageService.setItem(THEME_STORAGE_KEY, mode);
    if (mode === 'system') {
      const current = Appearance.getColorScheme() || systemScheme;
      setActiveScheme(current === 'light' ? 'light' : 'dark');
    } else {
      setActiveScheme(mode);
    }
  };

  const isDark = activeScheme === 'dark';
  const colors = useMemo(() => (isDark ? Colors.dark : Colors.light), [isDark]);

  const value = useMemo(
    () => ({
      themeMode,
      setThemeMode,
      isDark,
      colors
    }),
    [themeMode, isDark, colors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
