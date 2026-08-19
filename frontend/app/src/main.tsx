import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./ui-adjustments.css";

const THEME_STORAGE_KEY = "color-theme";
const CHAT_STORAGE_KEY = "jeysibn_chat_history";
const CHAT_SUGGESTIONS = [
  "Is Jerome qualified for a junior DevOps role?",
  "What projects best demonstrate Jerome's skills?",
  "How does Jerome use Terraform and Kubernetes?",
] as const;

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

function updateStaticCopy() {
  setCredentialsAnchor();

  const availabilityDetail = document.querySelector<HTMLElement>(".availability-pill .availability-detail");
  if (availabilityDetail) {
    availabilityDetail.textContent = "Entry-level Cloud & DevOps roles";
  }

  const heroTitle = document.querySelector<HTMLElement>("#hero-title");
  if (heroTitle) {
    heroTitle.textContent = "Jerome Christian Ibon";
    heroTitle.style.maxWidth = "18ch";
  }

  const heroIntro = document.querySelector<HTMLElement>(".hero-intro");
  if (heroIntro) {
    heroIntro.textContent = "Cloud Support · DevOps · Cloud Engineering";
    heroIntro.style.maxWidth = "none";
    heroIntro.style.color = "var(--text)";
    heroIntro.style.fontWeight = "600";
  }

  const heroOpportunity = document.querySelector<HTMLElement>(".hero-opportunity");
  if (heroOpportunity) {
    heroOpportunity.textContent = "Computer Engineering graduate building cloud infrastructure, automated delivery pipelines, Kubernetes environments, and observable systems.";
  }

  const resumeIntro = document.querySelector<HTMLElement>("#resume .section-intro");
  if (resumeIntro) {
    resumeIntro.textContent = "Everything important is visible here. Download the PDF directly, or review the on-page resume details below.";
  }

  renderThemeButton(currentTheme());
}

function hasChatHistory() {
  try {
    const stored = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return false;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function setReactInputValue(input: HTMLInputElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  valueSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function installChatSuggestions() {
  if (hasChatHistory() || document.querySelector(".chat-suggestions")) return;

  const form = document.querySelector<HTMLFormElement>(".chat-form");
  const input = document.querySelector<HTMLInputElement>("#chat-input");
  if (!form || !input) return;

  const suggestions = document.createElement("div");
  suggestions.className = "chat-suggestions";
  suggestions.setAttribute("aria-label", "Suggested questions about Jerome");

  const label = document.createElement("span");
  label.className = "chat-suggestions-label";
  label.textContent = "Try asking";
  suggestions.append(label);

  for (const prompt of CHAT_SUGGESTIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chat-suggestion";
    button.textContent = prompt;
    button.addEventListener("click", () => {
      setReactInputValue(input, prompt);
      suggestions.remove();
      input.focus({ preventScroll: true });
    });
    suggestions.append(button);
  }

  form.before(suggestions);
}

function resolveNavigationSection(destination: HTMLElement) {
  return destination.closest<HTMLElement>("section") ?? destination;
}

function scrollSectionIntoView(section: HTMLElement) {
  const headerHeight = document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
  const rect = section.getBoundingClientRect();
  const absoluteTop = window.scrollY + rect.top;
  const targetTop = Math.max(0, absoluteTop - headerHeight - 18);

  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });
}

function handleNavigation(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href?.startsWith("#") || href === "#") return false;

  const destination = document.querySelector<HTMLElement>(href);
  if (!destination) return false;

  scrollSectionIntoView(resolveNavigationSection(destination));
  window.history.replaceState(null, "", href);
  return true;
}

function originalArchitectureUrl(previewUrl: string) {
  try {
    const url = new URL(previewUrl, window.location.href);
    if (url.hostname !== "wsrv.nl") return previewUrl;
    return url.searchParams.get("url") || previewUrl;
  } catch {
    return previewUrl;
  }
}

function loadOriginalArchitectureForZoom() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const image = document.querySelector<HTMLImageElement>(".image-zoom-content");
      if (!image) return;

      const previewUrl = image.getAttribute("src") || image.src;
      const originalUrl = originalArchitectureUrl(previewUrl);
      if (originalUrl !== previewUrl) {
        image.src = originalUrl;
      }
    });
  });
}

applyTheme(storedTheme());

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

const appRoot = createRoot(root);

flushSync(() => {
  appRoot.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

// Apply the remaining static compatibility adjustments in the same browser task as
// the initial React commit so stale source copy can never be painted between frames.
updateStaticCopy();
installChatSuggestions();

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

    const architectureLink = target.closest(".architecture-link");
    if (architectureLink) {
      loadOriginalArchitectureForZoom();
      return;
    }

    const navigationLink = target.closest<HTMLAnchorElement>(".desktop-nav a, .mobile-nav a");
    if (navigationLink && handleNavigation(navigationLink)) {
      event.preventDefault();
    }
  },
  true,
);