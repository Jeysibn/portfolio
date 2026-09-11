import { useState } from "react";
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
  const cycle = () =>
    onTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark");
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="Jerome Ibon, home">
        <span>JI</span>
        <small>Infrastructure engineer</small>
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
          aria-label={`Theme: ${theme}. Change theme`}
        >
          <span aria-hidden="true" />
          {theme}
        </button>
        <button
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
