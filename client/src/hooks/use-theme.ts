import { useTheme as useThemeInternal } from '@/components/ThemeProvider';

/**
 * A hook that provides access to the current theme and a function to change it.
 * This is a simple re-export of the useTheme function from ThemeProvider
 * to keep the API consistent and provide a more semantic import path.
 * 
 * @returns An object containing the current theme and a function to change it.
 * @example
 * ```tsx
 * const { theme, setTheme } = useTheme();
 * 
 * // Check the current theme
 * console.log(theme); // 'light', 'dark', or 'system'
 * 
 * // Change the theme
 * setTheme('dark');
 * ```
 */
export const useTheme = useThemeInternal;
