import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./ui-adjustments.css";

const CHAT_STORAGE_KEY = "jeysibn_chat_history";
const CHAT_SUGGESTIONS = [
  "Is Jerome qualified for a junior DevOps role?",
  "What projects best demonstrate Jerome's skills?",
  "How does Jerome use Terraform and Kubernetes?",
] as const;

// Theme is fully owned by React (see hooks.ts `useTheme` and App.tsx `ThemeSelect`).
// The only theme-related code outside React is the inline pre-mount script in
// index.html, which sets `data-theme` before the bundle loads so there is no
// flash of the wrong theme; it reads/writes the same `color-theme` localStorage
// key as `useTheme` and never touches the DOM after that.

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

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

installChatSuggestions();

document.addEventListener(
  "click",
  (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const navigationLink = target.closest<HTMLAnchorElement>(".desktop-nav a, .mobile-nav a");
    if (navigationLink && handleNavigation(navigationLink)) {
      event.preventDefault();
    }
  },
  true,
);
