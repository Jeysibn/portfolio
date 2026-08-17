import { useEffect, useState } from "react";

import type { ThemePreference } from "./portfolio";

const THEME_STORAGE_KEY = "color-theme";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(): ThemePreference {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : getSystemTheme();
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(getInitialTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

  const effectiveTheme = preference === "system" ? systemTheme : preference;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(media.matches ? "dark" : "light");

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
    document.documentElement.style.colorScheme = effectiveTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, effectiveTheme);

    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = effectiveTheme === "dark" ? "#07111d" : "#f4f7f9";
    }
  }, [effectiveTheme]);

  return { preference, effectiveTheme, setPreference };
}

export function useActiveSection(sectionIds: readonly string[]) {
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    let frame = 0;

    const resolveSections = () =>
      sectionIds
        .map((id) => {
          const anchor = document.getElementById(id);
          const section = anchor?.closest<HTMLElement>("section") ?? anchor;
          return section ? { id, section } : null;
        })
        .filter((item): item is { id: string; section: HTMLElement } => item !== null);

    const updateActiveSection = () => {
      const sections = resolveSections();
      if (!sections.length) {
        setActiveSection("");
        return;
      }

      const headerHeight = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
      const probe = headerHeight + Math.min(180, window.innerHeight * 0.28);

      const active = sections.find(({ section }) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= probe && rect.bottom > probe;
      });

      setActiveSection(active?.id ?? "");
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [sectionIds]);

  return activeSection;
}
