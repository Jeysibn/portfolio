const THEME_STORAGE_KEY = "color-theme";

type ThemeMode = "light" | "dark";

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

function improveServiceCopy() {
  const title = document.querySelector<HTMLElement>(".status-console-topline > span:first-child");
  if (title) title.textContent = "Production status";

  const note = document.querySelector<HTMLElement>(".status-note");
  if (note) {
    note.textContent =
      "Checks the deployed Azure Functions API when the page loads. Portfolio content remains available if the API cannot be reached.";
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

  improveServiceCopy();
  renderThemeButton(currentTheme());
}

function resolveNavigationTarget(destination: HTMLElement) {
  if (destination.tagName === "H2") return destination;
  return destination.querySelector<HTMLElement>(".section-heading h2, h2") ?? destination;
}

function centerElementInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top;
  const targetTop = absoluteTop - (window.innerHeight - rect.height) / 2;
  const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const clampedTop = Math.min(maxScrollTop, Math.max(0, targetTop));

  window.scrollTo({
    top: clampedTop,
    behavior: "smooth",
  });
}

function handleNavigation(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href?.startsWith("#") || href === "#") return false;

  const destination = document.querySelector<HTMLElement>(href);
  if (!destination) return false;

  const target = resolveNavigationTarget(destination);
  centerElementInViewport(target);
  window.history.replaceState(null, "", href);
  return true;
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

      const themeTrigger = target.closest(".theme-trigger");
      if (themeTrigger) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        toggleTheme();
        return;
      }

      const navigationLink = target.closest<HTMLAnchorElement>(".desktop-nav a, .mobile-nav a");
      if (navigationLink && handleNavigation(navigationLink)) {
        event.preventDefault();
      }
    },
    true,
  );
}
