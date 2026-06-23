"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextType | null>(null);

const THEME_STORAGE_KEY = "theme";
const THEME_CHANGE_EVENT = "theme-change";

function readStoredTheme(defaultTheme: Theme): Theme {
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return defaultTheme;
}

function subscribeTheme(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener(THEME_CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const theme = React.useSyncExternalStore(
    subscribeTheme,
    () => readStoredTheme(defaultTheme),
    () => defaultTheme
  );

  const setTheme = React.useCallback((next: Theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
