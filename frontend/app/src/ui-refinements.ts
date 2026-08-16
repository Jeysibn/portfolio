import { skillGroups } from "./portfolio";

const sectionTitles: Record<string, string> = {
  "about-title": "About",
  "experience-title": "Experience",
  "projects-title": "Projects",
  "skills-title": "Skills & Tools",
  "credentials-title": "Education & Certifications",
  "resume-title": "Resume",
  "contact-title": "Contact",
};

const manilaTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

type SkillDetail = {
  summary: string;
  practice: string;
  itemDescriptions: Record<string, string>;
};

const skillDetails: Record<string, SkillDetail> = {
  "Cloud & virtualization": {
    summary:
      "Cloud platforms and virtualization are where I practice provisioning, networking, identity, cost-aware architecture, and reproducible environments.",
    practice:
      "This group connects directly to the Azure-backed portfolio, AWS troubleshooting environments, OCI foundations, and the Proxmox/VMware lab work behind my infrastructure practice.",
    itemDescriptions: {
      Azure: "Serverless application hosting, monitoring, storage, identity, and infrastructure automation for the portfolio platform.",
      AWS: "EC2, VPC, subnets, routing, and security groups used to reproduce and troubleshoot customer scenarios.",
      "Oracle Cloud Infrastructure": "Cloud foundations covering core OCI services, architecture, security, pricing, and operational concepts.",
      "VMware vSphere": "Virtualization fundamentals used in enterprise infrastructure training and lab-based systems administration.",
      Proxmox: "Homelab virtualization platform used as the infrastructure layer for automated Kubernetes node provisioning.",
    },
  },
  "Containers & orchestration": {
    summary:
      "I use containers to make workloads portable and orchestration to turn deployment, scheduling, and recovery into repeatable platform behavior.",
    practice:
      "My main hands-on environment is a k3s homelab where application state, Helm configuration, and cluster operations are managed declaratively.",
    itemDescriptions: {
      "Kubernetes (k3s)": "Lightweight Kubernetes used for multi-node homelab workloads, declarative deployment, service operation, and GitOps practice.",
      Docker: "Container packaging and local runtime workflows for keeping application dependencies consistent across environments.",
      Helm: "Templating and release configuration for Kubernetes workloads, including CI rendering and validation before deployment.",
    },
  },
  "Infrastructure & delivery": {
    summary:
      "This is the automation layer: infrastructure as code, version-controlled delivery, GitOps reconciliation, and repeatable configuration.",
    practice:
      "Terraform and GitHub Actions are central to the portfolio deployment path, while Argo CD and Helm drive the declarative delivery model in the homelab.",
    itemDescriptions: {
      Terraform: "Infrastructure as code for provisioning and reviewing cloud and homelab resources through version-controlled changes.",
      "GitHub Actions": "CI/CD workflows for typechecking, testing, Terraform validation, deployment, OIDC authentication, and smoke verification.",
      "Argo CD": "GitOps reconciliation for keeping Kubernetes application state aligned with the desired configuration stored in Git.",
      Git: "Source control foundation for code review, branching, infrastructure changes, and deployment history.",
      YAML: "Configuration format used across CI/CD workflows, Kubernetes manifests, Helm values, and automation definitions.",
    },
  },
  Observability: {
    summary:
      "Observability gives me evidence before assumptions: health signals, logs, metrics, dashboards, and operational context for troubleshooting.",
    practice:
      "The Azure portfolio uses Application Insights and Log Analytics, while the Kubernetes homelab uses Prometheus and Grafana for infrastructure and workload visibility.",
    itemDescriptions: {
      "Azure Application Insights": "Application telemetry for requests, failures, latency, exceptions, and production behavior in the serverless portfolio.",
      "Log Analytics": "Centralized Azure log querying and retention used alongside Application Insights for operational investigation.",
      Prometheus: "Metrics collection for Kubernetes and workload monitoring in the homelab environment.",
      Grafana: "Dashboards and visualization for turning collected metrics into useful operational views.",
    },
  },
  "Systems & networking": {
    summary:
      "Reliable cloud work still depends on strong systems and networking fundamentals: operating systems, identity, name resolution, connectivity, and remote administration.",
    practice:
      "These skills come from enterprise support, helpdesk work, cloud scenario reproduction, and hands-on lab administration across Windows and Linux environments.",
    itemDescriptions: {
      Linux: "Command-line administration, service troubleshooting, scripting, networking, and server operations across cloud and lab environments.",
      "Windows Server": "Server administration fundamentals used in enterprise training and support-oriented infrastructure work.",
      "Active Directory": "Account, access, and identity administration experience from enterprise helpdesk operations.",
      "TCP/IP": "Core networking model used when diagnosing connectivity, routing, addressing, and application communication issues.",
      DNS: "Name-resolution troubleshooting and configuration across cloud, enterprise, and homelab environments.",
      VPN: "Remote connectivity troubleshooting with attention to routing, access, and endpoint configuration.",
      SSH: "Secure remote administration for Linux hosts, cloud instances, and homelab systems.",
      RDP: "Remote Windows administration and troubleshooting for endpoint and server environments.",
    },
  },
  "Scripting, security & tools": {
    summary:
      "These tools support the operational work around the platform: automation, troubleshooting, security operations, case management, and repeatable support workflows.",
    practice:
      "Python and shell scripting support automation, while Trend Vision One, Jira, and ITIL practices connect the technical work to structured enterprise operations.",
    itemDescriptions: {
      Python: "Backend and automation language used for Azure Functions and practical scripting tasks.",
      Bash: "Linux shell automation for repeatable administration, validation, and developer workflows.",
      PowerShell: "Windows-focused scripting and administration for systems and support workflows.",
      "Trend Vision One": "Enterprise security platform experience from endpoint-security SaaS technical support and workload-protection training.",
      Jira: "Issue and case workflow tracking used to organize technical investigation and communication.",
      ITIL: "Service-management concepts that support structured incident handling, documentation, and operational ownership.",
    },
  },
};

let cleanupInstalledRefinements: (() => void) | null = null;

function applyShortSectionTitles() {
  Object.entries(sectionTitles).forEach(([id, title]) => {
    const heading = document.getElementById(id);
    if (heading && heading.textContent !== title) heading.textContent = title;
  });
}

function removeRedundantSectionIntros() {
  ["experience", "projects"].forEach((sectionId) => {
    document.querySelector(`#${sectionId} .section-heading .section-intro`)?.remove();
  });
  document.querySelector(".credentials-layout > div:first-child .section-intro")?.remove();
}

function removeCertificationGuides() {
  document.querySelector(".credential-subheading > p:last-child")?.remove();
  document.querySelectorAll(".cert-hover-hint").forEach((element) => element.remove());
}

function ensureManilaClock() {
  const monitorSummary = document.querySelector<HTMLElement>(".monitor-summary");
  if (!monitorSummary) return null;

  let clock = monitorSummary.querySelector<HTMLElement>(".monitor-local-time");
  if (clock) return clock;

  clock = document.createElement("div");
  clock.className = "monitor-local-time";
  clock.setAttribute("aria-label", "Current time in Manila, Philippines");

  const label = document.createElement("span");
  label.textContent = "Manila";

  const value = document.createElement("strong");
  value.className = "monitor-local-time-value";

  clock.append(label, value);
  monitorSummary.append(clock);
  return clock;
}

function updateManilaClock() {
  const clock = ensureManilaClock();
  const value = clock?.querySelector<HTMLElement>(".monitor-local-time-value");
  if (value) value.textContent = manilaTimeFormatter.format(new Date());
}

function ensureScrollPatternLayer() {
  const shell = document.querySelector<HTMLElement>(".site-shell");
  if (!shell || shell.querySelector(".scroll-pattern-layer")) return;

  const layer = document.createElement("div");
  layer.className = "scroll-pattern-layer";
  layer.setAttribute("aria-hidden", "true");
  shell.prepend(layer);
}

function createCloseButton(label: string) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "inspection-close";
  button.setAttribute("aria-label", label);
  button.textContent = "×";
  return button;
}

function ensureImageZoomDialog() {
  let dialog = document.querySelector<HTMLDialogElement>(".image-zoom-dialog");
  if (dialog) return dialog;

  dialog = document.createElement("dialog");
  dialog.className = "image-zoom-dialog";

  const frame = document.createElement("div");
  frame.className = "image-zoom-frame";
  const close = createCloseButton("Close architecture diagram");
  const image = document.createElement("img");
  image.className = "image-zoom-content";
  const caption = document.createElement("p");
  caption.className = "image-zoom-caption";

  frame.append(close, image, caption);
  dialog.append(frame);
  document.body.append(dialog);

  close.addEventListener("click", () => dialog?.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog?.close();
  });
  return dialog;
}

function openImageZoom(source: HTMLImageElement) {
  const dialog = ensureImageZoomDialog();
  const image = dialog.querySelector<HTMLImageElement>(".image-zoom-content");
  const caption = dialog.querySelector<HTMLElement>(".image-zoom-caption");
  if (!image || !caption) return;

  image.src = source.currentSrc || source.src;
  image.alt = source.alt;
  caption.textContent = source.alt || "Architecture diagram";
  if (!dialog.open) dialog.showModal();
}

function installArchitectureZoomDelegation() {
  const handleArchitectureClick = (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest<HTMLAnchorElement>(".architecture-link");
    if (!link) return;

    const image = link.querySelector<HTMLImageElement>("img");
    if (!image) return;

    event.preventDefault();
    openImageZoom(image);
  };

  document.addEventListener("click", handleArchitectureClick);
  return () => document.removeEventListener("click", handleArchitectureClick);
}

function ensureSkillDialog() {
  let dialog = document.querySelector<HTMLDialogElement>(".skill-detail-dialog");
  if (dialog) return dialog;

  dialog = document.createElement("dialog");
  dialog.className = "skill-detail-dialog";
  document.body.append(dialog);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog?.close();
  });
  return dialog;
}

function openSkillDialog(groupLabel: string) {
  const group = skillGroups.find((item) => item.label === groupLabel);
  const detail = skillDetails[groupLabel];
  if (!group || !detail) return;

  const dialog = ensureSkillDialog();
  dialog.replaceChildren();
  const panel = document.createElement("article");
  panel.className = "skill-detail-panel";
  const close = createCloseButton("Close skill details");
  close.addEventListener("click", () => dialog.close());

  const eyebrow = document.createElement("p");
  eyebrow.className = "skill-detail-eyebrow";
  eyebrow.textContent = "CAPABILITY DETAIL";
  const title = document.createElement("h2");
  title.textContent = group.label;
  const summary = document.createElement("p");
  summary.className = "skill-detail-summary";
  summary.textContent = detail.summary;
  const practice = document.createElement("p");
  practice.className = "skill-detail-practice";
  practice.textContent = detail.practice;
  const list = document.createElement("div");
  list.className = "skill-detail-list";

  group.items.forEach((item) => {
    const entry = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = item;
    const description = document.createElement("p");
    description.textContent = detail.itemDescriptions[item] || "Used as part of my cloud, DevOps, support, and infrastructure workflows.";
    entry.append(name, description);
    list.append(entry);
  });

  panel.append(close, eyebrow, title, summary, practice, list);
  dialog.append(panel);
  if (!dialog.open) dialog.showModal();
}

function bindSkillCards() {
  document.querySelectorAll<HTMLElement>(".skill-card").forEach((card) => {
    if (card.dataset.detailBound === "true") return;
    const label = card.querySelector<HTMLElement>("h3")?.textContent?.trim();
    if (!label) return;

    card.dataset.detailBound = "true";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `View details for ${label}`);
    card.addEventListener("click", () => openSkillDialog(label));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openSkillDialog(label);
    });
  });
}

function installContinuousScrollMotion() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return () => undefined;

  const reactiveSelector = [
    ".section-heading",
    ".timeline-item",
    ".project-row",
    ".skill-card",
    ".education-block",
    ".cert-card",
    ".resume-preview",
    ".contact-panel",
  ].join(",");

  const elements = Array.from(document.querySelectorAll<HTMLElement>(reactiveSelector));
  elements.forEach((element) => element.classList.add("scroll-reactive"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => entry.target.classList.toggle("is-in-view", entry.isIntersecting));
    },
    { threshold: 0.08, rootMargin: "8% 0px 8% 0px" },
  );
  elements.forEach((element) => observer.observe(element));

  let frame = 0;
  const update = () => {
    const viewportHeight = Math.max(window.innerHeight, 1);
    const scrollable = Math.max(document.documentElement.scrollHeight - viewportHeight, 1);
    const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));

    document.documentElement.style.setProperty("--page-scroll", `${window.scrollY}`);
    document.documentElement.style.setProperty("--page-progress", progress.toFixed(4));
    document.documentElement.style.setProperty("--pattern-y", `${(-window.scrollY * 0.18).toFixed(2)}px`);
    document.documentElement.style.setProperty("--pattern-x", `${(window.scrollY * 0.07).toFixed(2)}px`);
    document.documentElement.style.setProperty("--pattern-rotate", `${(progress * 7 - 3.5).toFixed(2)}deg`);

    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const phase = Math.max(-1.25, Math.min(1.25, (center - viewportHeight / 2) / viewportHeight));
      const motionY = phase * -12;
      const motionRotate = phase * 0.22;
      element.style.setProperty("--viewport-phase", phase.toFixed(4));
      element.style.setProperty("--motion-y", `${motionY.toFixed(2)}px`);
      element.style.setProperty("--motion-rotate", `${motionRotate.toFixed(3)}deg`);
    });
  };

  const requestUpdate = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
  };
}

function installRefinements(attempt = 0) {
  const appReady = document.getElementById("about-title") && document.querySelector(".monitor-summary");

  if (!appReady && attempt < 30) {
    window.setTimeout(() => installRefinements(attempt + 1), 50);
    return;
  }

  cleanupInstalledRefinements?.();
  applyShortSectionTitles();
  removeRedundantSectionIntros();
  removeCertificationGuides();
  ensureScrollPatternLayer();
  updateManilaClock();
  bindSkillCards();

  const stopArchitectureZoom = installArchitectureZoomDelegation();
  const stopScrollMotion = installContinuousScrollMotion();
  const clockTimer = window.setInterval(updateManilaClock, 1_000);

  cleanupInstalledRefinements = () => {
    window.clearInterval(clockTimer);
    stopArchitectureZoom();
    stopScrollMotion();
  };
}

window.requestAnimationFrame(() => installRefinements());
