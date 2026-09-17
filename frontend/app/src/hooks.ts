import { useEffect, useState } from "react";

import type { ThemePreference } from "./portfolio";

const THEME_STORAGE_KEY = "color-theme";

function getInitialTheme(): ThemePreference {
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    // Storage may be unavailable in privacy-restricted browser contexts.
  }
  if (stored === "light" || stored === "dark") return stored;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function useTheme() {
  const [preference, setPreference] =
    useState<ThemePreference>(getInitialTheme);
  const effectiveTheme = preference;

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
    document.documentElement.style.colorScheme = effectiveTheme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // The theme still applies for the current session when storage is blocked.
    }

    const themeColor = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (themeColor) {
      themeColor.content = effectiveTheme === "dark" ? "#10130f" : "#eee9de";
    }
  }, [effectiveTheme, preference]);

  return { preference, effectiveTheme, setPreference };
}

export function useActiveSection(sectionIds: readonly string[]) {
  const [activeSection, setActiveSection] = useState("");
  const sectionKey = sectionIds.join("\u0000");

  useEffect(() => {
    let frame = 0;
    const stableSectionIds = sectionKey ? sectionKey.split("\u0000") : [];

    const resolveSections = () =>
      stableSectionIds
        .map((id) => {
          const anchor = document.getElementById(id);
          const section = anchor?.closest<HTMLElement>("section") ?? anchor;
          return section ? { id, section } : null;
        })
        .filter(
          (item): item is { id: string; section: HTMLElement } => item !== null,
        );

    const updateActiveSection = () => {
      const sections = resolveSections();
      if (!sections.length) {
        setActiveSection("");
        return;
      }

      const headerHeight =
        document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
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
  }, [sectionKey]);

  return activeSection;
}
