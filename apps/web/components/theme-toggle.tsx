"use client";

import { useEffect, useState, useTransition } from "react";

import { THEME_STORAGE_KEY, type ThemeMode, resolveThemeMode } from "@/lib/theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const rootTheme = resolveThemeMode(document.documentElement.dataset.theme) ?? "light";
    setTheme(rootTheme);

    function handleStorage(event: StorageEvent) {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }

      const nextTheme = resolveThemeMode(event.newValue);

      if (!nextTheme) {
        return;
      }

      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
      setTheme(nextTheme);
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  if (!theme) {
    return null;
  }

  return (
    <div aria-label="Color theme" className="theme-toggle" role="group">
      {(["light", "dark"] as const).map((option) => (
        <button
          key={option}
          aria-pressed={theme === option}
          className="theme-toggle__button"
          data-active={theme === option}
          disabled={isPending && theme === option}
          onClick={() => {
            if (option === theme) {
              return;
            }

            applyTheme(option);
            startTransition(() => {
              setTheme(option);
            });
          }}
          type="button"
        >
          {option === "light" ? "Light" : "Dark"}
        </button>
      ))}
    </div>
  );
}
