import { useEffect, useRef, useState } from "react";
import type { ThemePreference } from "../portfolio";
import { navigation } from "../portfolio";
import { VisitorCounter } from "./PortfolioAssistant";

export function SiteHeader({
  activeSection,
  theme,
  onTheme,
}: {
  activeSection: string;
  theme: ThemePreference;
  onTheme: (t: ThemePreference) => void;
}) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navToggleRef = useRef<HTMLButtonElement>(null);
  const cycle = () => onTheme(theme === "dark" ? "light" : "dark");

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      navToggleRef.current?.focus();
    };
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [open]);

  return (
    <header className="site-header" ref={headerRef}>
      <a className="wordmark" href="#top" aria-label="Jerome Ibon, home">
        <span>JI</span>
        <small>Jeysibn</small>
      </a>
      <nav
        id="primary-nav"
        className={open ? "site-nav is-open" : "site-nav"}
        aria-label="Primary navigation"
      >
        {navigation.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={activeSection === item.id ? "location" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-tools">
        <button
          className="theme-switch"
          type="button"
          onClick={cycle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          <span aria-hidden="true" />
          {theme}
        </button>
        <button
          ref={navToggleRef}
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Jerome Christian Ibon</p>
      <p>React + TypeScript · Terraform-managed Azure backend</p>
      <VisitorCounter />
    </footer>
  );
}
