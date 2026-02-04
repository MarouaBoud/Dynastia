/**
 * Theme Provider
 *
 * Provides theme context to the entire app with light/dark mode support.
 * Uses React Context for theme access and AsyncStorage for persistence.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { useColorScheme, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, tokens } from './tokens';

// =============================================================================
// Types
// =============================================================================

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  // Backgrounds
  background: string;
  backgroundSecondary: string;
  card: string;
  cardElevated: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Accent
  accent: string;
  accentLight: string;

  // Semantic
  success: string;
  warning: string;
  error: string;

  // UI Elements
  border: string;
  borderLight: string;
  divider: string;
  icon: string;
  iconMuted: string;

  // Specific
  inputBackground: string;
  buttonDisabled: string;

  // Budget buckets
  savings: string;
  bills: string;
  lifestyle: string;
}

interface Theme {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  tokens: typeof tokens;
}

interface ThemeContextType {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// =============================================================================
// Color Schemes
// =============================================================================

const lightColors: ThemeColors = {
  // Backgrounds
  background: colors.neutral[50],
  backgroundSecondary: colors.neutral[100],
  card: colors.neutral[0],
  cardElevated: colors.neutral[0],

  // Text
  text: colors.neutral[900],
  textSecondary: colors.neutral[700],
  textMuted: colors.neutral[500],
  textInverse: colors.neutral[0],

  // Primary
  primary: colors.primary[500],
  primaryLight: colors.primary[100],
  primaryDark: colors.primary[700],

  // Accent
  accent: colors.accent[500],
  accentLight: colors.accent[100],

  // Semantic
  success: colors.success[500],
  warning: colors.warning[500],
  error: colors.error[500],

  // UI Elements
  border: colors.neutral[200],
  borderLight: colors.neutral[100],
  divider: colors.neutral[200],
  icon: colors.neutral[600],
  iconMuted: colors.neutral[400],

  // Specific
  inputBackground: colors.neutral[100],
  buttonDisabled: colors.neutral[300],

  // Budget buckets
  savings: colors.buckets.savings,
  bills: colors.buckets.bills,
  lifestyle: colors.buckets.lifestyle,
};

const darkColors: ThemeColors = {
  // Backgrounds
  background: '#1A1D1E',
  backgroundSecondary: '#242829',
  card: '#2A2F31',
  cardElevated: '#323839',

  // Text
  text: colors.neutral[50],
  textSecondary: colors.neutral[200],
  textMuted: colors.neutral[400],
  textInverse: colors.neutral[900],

  // Primary
  primary: colors.primary[400],
  primaryLight: 'rgba(91, 123, 111, 0.2)',
  primaryDark: colors.primary[300],

  // Accent
  accent: colors.accent[400],
  accentLight: 'rgba(201, 168, 108, 0.2)',

  // Semantic
  success: '#5CB88A',
  warning: '#E5B94D',
  error: '#E57373',

  // UI Elements
  border: '#3D4445',
  borderLight: '#323839',
  divider: '#3D4445',
  icon: colors.neutral[300],
  iconMuted: colors.neutral[500],

  // Specific
  inputBackground: '#242829',
  buttonDisabled: '#3D4445',

  // Budget buckets
  savings: '#5CB88A',
  bills: '#5B9BD5',
  lifestyle: '#A78BFA',
};

// =============================================================================
// Context
// =============================================================================

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@dynastia_theme_mode';

// =============================================================================
// Provider
// =============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  };

  // Determine if dark mode is active
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  // Build theme object
  const theme = useMemo<Theme>(
    () => ({
      mode: themeMode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      tokens,
    }),
    [themeMode, isDark]
  );

  const contextValue = useMemo(
    () => ({
      theme,
      setThemeMode,
      toggleTheme,
    }),
    [theme]
  );

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hook for just the colors
export function useColors(): ThemeColors {
  const { theme } = useTheme();
  return theme.colors;
}

// Convenience hook for checking dark mode
export function useIsDarkMode(): boolean {
  const { theme } = useTheme();
  return theme.isDark;
}

export default ThemeProvider;
