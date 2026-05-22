import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

/**
 * Reads the stored theme from localStorage synchronously.
 * Wrapped in try/catch to handle private browsing or quota errors.
 * Returns null if unavailable or invalid.
 */
function getStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
  }
  return null;
}

/**
 * Persists theme to localStorage. Silently fails if unavailable.
 */
function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
  }
}

/**
 * Applies or removes the .dark class on document.documentElement.
 * Called synchronously during initialization to prevent flash.
 */
function applyThemeClass(theme: Theme): void {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Read localStorage synchronously before first render to prevent flash
    if (switchable) {
      const stored = getStoredTheme();
      const resolved = stored ?? defaultTheme;
      // Apply .dark class immediately during initialization (<100ms)
      applyThemeClass(resolved);
      return resolved;
    }
    // Non-switchable: apply the default theme class immediately
    applyThemeClass(defaultTheme);
    return defaultTheme;
  });

  useEffect(() => {
    // Keep .dark class in sync when theme changes after initial render
    applyThemeClass(theme);

    if (switchable) {
      persistTheme(theme);
    }
  }, [theme, switchable]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
