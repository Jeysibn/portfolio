type ProjectEnhancement = {
  id: string;
  title: string;
  rowSelector: string;
  designChoices: Array<{ choice: string; reason: string }>;
};

const PROJECT_ENHANCEMENTS: ProjectEnhancement[] = [
  {
    id: "cloud-portfolio",
    title: "Cloud-Backed Portfolio",
    rowSelector: ".project-cloud-portfolio",
    designChoices: [
      {
        choice: "Serverless API instead of a long-running app server",
        reason:
          "The portfolio has bursty traffic, so Azure Functions keeps cost low while still supporting dynamic visitor and assistant features.",
      },
      {
        choice: "Terraform-managed cloud resources",
        reason:
          "Infrastructure changes stay reviewable, repeatable, and easier to recover than manual portal configuration.",
      },
      {
        choice: "OIDC-based GitHub Actions deployment",
        reason:
          "The pipeline can deploy without storing long-lived Azure credentials in repository secrets.",
      },
      {
        choice: "Application Insights telemetry",
        reason:
          "Health, latency, and failure signals make the project easier to operate like a real service rather than a static demo.",
      },
    ],
  },
  {
    id: "homelab-gitops",
    title: "Homelab GitOps Environment",
    rowSelector: ".project-homelab-gitops",
    designChoices: [
      {
        choice: "GitOps as the deployment control plane",
        reason:
          "Argo CD keeps the cluster aligned with Git so application state is visible, reviewable, and recoverable.",
      },
      {
        choice: "K3s for the cluster runtime",
        reason:
          "It keeps the lab lightweight enough for small hardware while still exposing practical Kubernetes operations.",
      },
      {
        choice: "CI validation before reconciliation",
        reason:
          "Rendering Helm templates and validating schemas catches configuration mistakes before they reach the cluster.",
      },
      {
        choice: "Prometheus and Grafana for visibility",
        reason:
          "Metrics make capacity, health, and workload behavior observable instead of relying on manual inspection alone.",
      },
    ],
  },
];

let started = false;

function projectHash(project: ProjectEnhancement) {
  return `#project-${project.id}`;
}

function projectFromHash() {
  if (!window.location.hash.startsWith("#project-")) return null;
  const id = window.location.hash.replace("#project-", "");
  return PROJECT_ENHANCEMENTS.find((project) => project.id === id) ?? null;
}

function softenApiStatus() {
  const heroStatus = document.querySelector<HTMLElement>(".hero-status");
  if (heroStatus) {
    heroStatus.querySelectorAll<HTMLElement>("span, dd").forEach((element) => {
      if (element.textContent?.trim() === "Unavailable") {
        element.textContent = "API not confirmed";
      }
    });

    const note = heroStatus.querySelector<HTMLElement>(".status-note");
    if (note) {
      note.textContent =
        "If the live API cannot be confirmed, the static portfolio still works while dynamic features retry on the next visit.";
    }
  }

  const visitorCount = document.querySelector<HTMLElement>(".visitor-count strong");
  if (visitorCount?.textContent?.trim() === "Unavailable") {
    visitorCount.textContent = "Not confirmed";
    visitorCount.title = "Visitor counter could not be confirmed.";
  }
}

function enhanceProjectRows() {
  PROJECT_ENHANCEMENTS.forEach((project) => {
    const row = document.querySelector<HTMLElement>(project.rowSelector);
    if (!row) return;

    row.id = `project-${project.id}`;

    if (!row.dataset.deepLinkEnabled) {
      row.dataset.deepLinkEnabled = "true";
      row.addEventListener(
        "click",
        () => {
          const nextHash = projectHash(project);
          if (window.location.hash !== nextHash) {
            window.history.pushState(null, "", nextHash);
          }
        },
        { capture: true },
      );
    }

    const copy = row.querySelector<HTMLElement>(".project-copy");
    if (copy && !copy.querySelector("[data-project-reasoning-cue]")) {
      const cue = document.createElement("span");
      cue.className = "text-action";
      cue.dataset.projectReasoningCue = "true";
      cue.setAttribute("aria-hidden", "true");
      cue.textContent = "View project reasoning →";
      copy.appendChild(cue);
    }
  });
}

function openProjectFromHash() {
  const project = projectFromHash();
  if (!project) return;

  const dialogIsOpen = Boolean(document.querySelector(".case-dialog[open]"));
  if (dialogIsOpen) return;

  const row = document.querySelector<HTMLElement>(project.rowSelector);
  row?.click();
}

function enhanceProjectDialog() {
  const panel = document.querySelector<HTMLElement>(".case-panel");
  if (!panel) return;

  const title = panel.querySelector<HTMLElement>(".case-header h2")?.textContent?.trim();
  const project = PROJECT_ENHANCEMENTS.find((item) => item.title === title);
  if (!project) return;

  if (!panel.querySelector("[data-tier-two-rationale]")) {
    const section = document.createElement("div");
    section.className = "case-section";
    section.dataset.tierTwoRationale = "true";

    const heading = document.createElement("h3");
    heading.textContent = "Why I built it this way";

    const list = document.createElement("ul");
    project.designChoices.forEach((item) => {
      const li = document.createElement("li");
      const strong = document.createElement("strong");
      strong.textContent = `${item.choice}:`;
      li.append(strong, ` ${item.reason}`);
      list.appendChild(li);
    });

    section.append(heading, list);

    const outcomesSection = Array.from(panel.querySelectorAll<HTMLElement>(".case-section")).find(
      (item) => item.querySelector("h3")?.textContent?.trim() === "Operating outcomes",
    );
    outcomesSection?.before(section);
  }

  if (!panel.querySelector("[data-tier-two-deep-link]")) {
    const repositoryLink = panel.querySelector<HTMLAnchorElement>(".case-repository");
    if (!repositoryLink) return;

    const deepLink = document.createElement("a");
    deepLink.className = "button button-secondary case-repository";
    deepLink.href = projectHash(project);
    deepLink.dataset.tierTwoDeepLink = "true";
    deepLink.setAttribute("aria-label", `Direct link to ${project.title}`);
    deepLink.textContent = "Project deep link ↗";

    repositoryLink.after(deepLink);
  }
}

function improveChatFallback() {
  const intro = document.querySelector<HTMLElement>(".chat-messages .chat-message-assistant:first-child");
  const fallbackNote =
    " If the live assistant is unavailable, the project and resume sections still contain the key details.";
  if (intro && !intro.textContent?.includes("live assistant is unavailable")) {
    intro.textContent = `${intro.textContent}${fallbackNote}`;
  }

  document.querySelectorAll<HTMLElement>(".chat-message-error").forEach((message) => {
    if (message.dataset.fallbackImproved) return;
    message.dataset.fallbackImproved = "true";
    message.textContent =
      "The live assistant is temporarily unavailable, but the portfolio content is still available. Open the project cards for architecture and design decisions, use the Resume section for the PDF, or contact me directly at jeysibn@gmail.com.";
  });
}

function applyTierTwoEnhancements() {
  softenApiStatus();
  enhanceProjectRows();
  enhanceProjectDialog();
  improveChatFallback();
}

export function startTierTwoEnhancements() {
  if (started) return;
  started = true;

  const run = () => {
    applyTierTwoEnhancements();
    openProjectFromHash();
  };

  window.addEventListener("hashchange", run);
  window.requestAnimationFrame(run);

  const observer = new MutationObserver(applyTierTwoEnhancements);
  observer.observe(document.body, { childList: true, subtree: true });
}
