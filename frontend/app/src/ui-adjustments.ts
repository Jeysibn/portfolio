const THEME_STORAGE_KEY = "color-theme";

type ThemeMode = "light" | "dark";

function systemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme(): ThemeMode {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : systemTheme();
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.content = theme === "dark" ? "#07111d" : "#f4f7f9";
  }
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
  applyTheme(current === "dark" ? "light" : "dark");
}

function updateStaticCopy() {
  const availabilityDetail = document.querySelector<HTMLElement>(".availability-pill .availability-detail");
  if (availabilityDetail) {
    availabilityDetail.textContent = "Cloud Support · DevOps · Cloud Engineering";
  }

  const resumeIntro = document.querySelector<HTMLElement>("#resume .section-intro");
  if (resumeIntro) {
    resumeIntro.textContent = "Everything important is visible here. Download the PDF directly, or review the on-page resume details below.";
  }
}

export function normalizeThemePreference() {
  applyTheme(storedTheme());
}

export function startUiAdjustments() {
  window.requestAnimationFrame(updateStaticCopy);

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest(".theme-trigger");
      if (!trigger) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      toggleTheme();
    },
    true,
  );
}
