import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

function setText(selector: string, text: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((element) => {
    if (element.textContent?.trim() !== text) {
      element.textContent = text;
    }
  });
}

function ensureResumeDownloadAction() {
  const header = document.querySelector<HTMLElement>(".resume-preview-header");
  const printButton = header?.querySelector<HTMLButtonElement>("button.button-secondary");

  if (!header || !printButton || header.querySelector("[data-resume-download]")) return;

  const downloadLink = document.createElement("a");
  downloadLink.href = "./resume.pdf";
  downloadLink.download = "Jerome-Ibon-Resume.pdf";
  downloadLink.className = "button button-primary";
  downloadLink.dataset.resumeDownload = "true";
  downloadLink.setAttribute("aria-label", "Download Jerome Ibon resume as PDF");
  downloadLink.innerHTML = `Download resume (PDF)
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>`;

  printButton.before(downloadLink);
}

function applyTierOneContentFixes() {
  setText(".availability-detail", "Cloud · DevOps · Cloud Engineering");
  setText(
    ".hero-intro",
    "I’m Jerome, a Computer Engineering graduate focused on Cloud, DevOps, and Cloud Engineering. I turn infrastructure, delivery, and operations into version-controlled systems instead of manual checklists.",
  );
  setText(
    ".hero-opportunity",
    "I’m currently open to entry-level Cloud Support, DevOps, and Cloud Engineering opportunities.",
  );
  setText(
    ".resume-preview-header h3 + p",
    "Cloud Support · DevOps · Cloud Engineering · Kubernetes · GitOps · Infrastructure Automation",
  );
  setText(
    ".contact-intro h3",
    "Let’s talk about Cloud, DevOps, Cloud Engineering, or the infrastructure problem your team is trying to untangle.",
  );
  setText(
    ".contact-intro > p",
    "I’m interested in entry-level Cloud Support, DevOps, and Cloud Engineering roles where I can keep building production judgment alongside strong engineering teams.",
  );
  setText(".print-resume header p:first-of-type", "Cloud Support · DevOps · Cloud Engineering · Kubernetes · GitOps · Infrastructure Automation");

  document.querySelectorAll<HTMLElement>(".role-tags span").forEach((tag) => {
    if (tag.textContent?.trim() === "Junior SRE") {
      tag.textContent = "Cloud Engineering";
    }
  });

  ensureResumeDownloadAction();
}

function PortfolioApp() {
  useEffect(() => {
    applyTierOneContentFixes();

    const observer = new MutationObserver(() => applyTierOneContentFixes());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return <App />;
}

createRoot(root).render(
  <StrictMode>
    <PortfolioApp />
  </StrictMode>,
);
