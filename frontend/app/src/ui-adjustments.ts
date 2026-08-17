const THEME_STORAGE_KEY = "color-theme";

type ThemeMode = "light" | "dark";

const SUN_ICON = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="12" r="4" />
  <path d="M12 2v2" />
  <path d="M12 20v2" />
  <path d="M4.93 4.93l1.41 1.41" />
  <path d="M17.66 17.66l1.41 1.41" />
  <path d="M2 12h2" />
  <path d="M20 12h2" />
  <path d="M4.93 19.07l1.41-1.41" />
  <path d="M17.66 6.34l1.41-1.41" />
</svg>`;

const MOON_ICON = `
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M21 12.79A8.5 8.5 0 1 1 11.21 3 6.7 6.7 0 0 0 21 12.79z" />
</svg>`;

function systemTheme(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function storedTheme(): ThemeMode {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : systemTheme();
}

function renderThemeButton(theme: ThemeMode) {
  const trigger = document.querySelector<HTMLButtonElement>(".theme-trigger");
  if (!trigger) return;

  trigger.innerHTML = theme === "dark" ? MOON_ICON : SUN_ICON;
  trigger.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  trigger.setAttribute("title", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  trigger.removeAttribute("aria-expanded");
  trigger.removeAttribute("aria-controls");
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.content = theme === "dark" ? "#07111d" : "#f4f7f9";
  }

  renderThemeButton(theme);
}

function currentTheme(): ThemeMode {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function toggleTheme() {
  applyTheme(currentTheme() === "dark" ? "light" : "dark");
}

function setCredentialsAnchor() {
  const credentials = document.querySelector<HTMLElement>(".credentials-section");
  if (credentials && !credentials.id) {
    credentials.id = "credentials";
  }
}

function updateStaticCopy() {
  setCredentialsAnchor();

  const availabilityDetail = document.querySelector<HTMLElement>(".availability-pill .availability-detail");
  if (availabilityDetail) {
    availabilityDetail.textContent = "Cloud Support · DevOps · Cloud Engineering";
  }

  const resumeIntro = document.querySelector<HTMLElement>("#resume .section-intro");
  if (resumeIntro) {
    resumeIntro.textContent = "Everything important is visible here. Download the PDF directly, or review the on-page resume details below.";
  }

  renderThemeButton(currentTheme());
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
