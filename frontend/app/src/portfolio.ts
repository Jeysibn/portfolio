export type ThemePreference = "light" | "dark";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface ExperienceItem {
  role: string;
  organization: string;
  location: string;
  period: string;
  summary: string;
  highlights: string[];
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  category: string;
  status: string;
  repositoryUrl: string;
  liveUrl?: string;
  preview: {
    summary: string;
    primaryOutcome: string;
    flow: {
      label: string;
      nodes: string[];
    };
    technologies: string[];
  };
  details: {
    summary: string;
    purpose: string;
    outcomes: string[];
    highlights: string[];
    technologies: string[];
    architectureFlows: Array<{
      label: string;
      nodes: string[];
    }>;
  };
  architecture: {
    diagrams: Array<{
      id: string;
      title: string;
      svg: string;
      description: string;
      summary: string[];
    }>;
  };
}

export interface Certification {
  name: string;
  issuer?: string;
  status: "earned" | "in-progress";
}

export const navigation = [
  { label: "Projects", id: "projects" },
  { label: "Experience", id: "experience" },
  { label: "Skills", id: "skills" },
  { label: "Certifications", id: "credentials-title" },
  { label: "Principles", id: "about" },
  { label: "Resume", id: "resume" },
  { label: "Contact", id: "contact" },
] as const;

export const skillGroups: SkillGroup[] = [
  {
    label: "Cloud & virtualization",
    items: [
      "Azure",
      "AWS",
      "Oracle Cloud Infrastructure",
      "VMware vSphere",
      "Proxmox",
    ],
  },
  {
    label: "Containers & orchestration",
    items: ["Kubernetes (k3s)", "Docker", "Helm"],
  },
  {
    label: "Infrastructure & delivery",
    items: ["Terraform", "GitHub Actions", "Argo CD", "Git", "YAML"],
  },
  {
    label: "Observability",
    items: [
      "Azure Application Insights",
      "Log Analytics",
      "Prometheus",
      "Grafana",
    ],
  },
  {
    label: "Systems & networking",
    items: [
      "Linux",
      "Windows Server",
      "Active Directory",
      "TCP/IP",
      "DNS",
      "VPN",
      "SSH",
      "RDP",
    ],
  },
  {
    label: "Scripting, security & tools",
    items: ["Python", "Bash", "PowerShell", "Trend Vision One", "Jira", "ITIL"],
  },
];

export const experience: ExperienceItem[] = [
  {
    role: "Technical Support Engineer, Endpoint Security SaaS",
    organization: "TrendAI",
    location: "Pasig City",
    period: "August 2025 – February 2026",
    summary:
      "Enterprise technical support across endpoint-security SaaS, hybrid Windows/Linux environments, networking, and cloud infrastructure.",
    highlights: [
      "Resolved 80+ enterprise technical cases across network, system, and cloud infrastructure issues while working within SLA expectations.",
      "Provisioned AWS environments including EC2, VPCs, security groups, subnets, and routing to reproduce customer scenarios.",
      "Completed 640 hours of new-engineer training spanning enterprise networking, server administration, VMware vSphere, Azure fundamentals, and AWS fundamentals.",
      "Produced customer-facing technical resolutions that also served as precise case documentation.",
    ],
  },
  {
    role: "IT Helpdesk Intern",
    organization: "Philippine Transmarine Carriers",
    location: "Makati City",
    period: "March 2025 – May 2025",
    summary:
      "Hands-on IT operations under senior staff supervision, focused on endpoint lifecycle, identity support, networking, and asset management.",
    highlights: [
      "Assisted with Active Directory accounts, user access controls, network connectivity, and VPN troubleshooting.",
      "Performed secure Windows workstation reformatting and redeployment following enterprise data-handling procedures.",
      "Tracked IT assets and assisted with RAM and SSD upgrades that extended workstation lifecycle.",
    ],
  },
];

export const projects: Project[] = [
  {
    id: "cloud-portfolio",
    slug: "cloud-portfolio",
    title: "Cloud-Backed Portfolio",
    shortTitle: "Cloud Portfolio",
    category: "Serverless cloud platform",
    status: "Live system · source-controlled",
    repositoryUrl: "https://github.com/Jeysibn/portfolio",
    liveUrl: "https://jeysibn.github.io/",
    preview: {
      summary:
        "A React and TypeScript portfolio on GitHub Pages backed by Python 3.11 Azure Functions for health, visitor counting, and a provider-neutral AI assistant.",
      primaryOutcome:
        "Path-specific GitHub Actions publish the frontend and deploy Azure changes through OIDC, with post-deployment smoke checks.",
      flow: {
        label: "Runtime path",
        nodes: ["Visitor", "GitHub Pages", "Azure Functions", "Cosmos DB", "Telemetry"],
      },
      technologies: ["React", "TypeScript", "Azure Functions", "Terraform", "GitHub Actions"],
    },
    details: {
      summary:
        "A portfolio that treats a personal website like a real service: infrastructure as code, automated delivery, serverless APIs, observability, deployment verification, and an AI assistant.",
      purpose:
        "Move beyond static hosting and demonstrate practical Cloud and DevOps engineering through a small, cost-conscious system that is automated, observable, and reproducible.",
      outcomes: [
        "Serverless backend avoids idle application-server cost while keeping dynamic visitor and AI capabilities.",
        "Terraform manages Azure infrastructure and keeps production configuration reviewable in Git.",
        "GitHub Actions validates changes, authenticates to Azure with OIDC, deploys by path, and verifies backend health after deployment.",
        "Application Insights and Log Analytics provide request, failure, latency, exception, and structured operational telemetry.",
      ],
      highlights: [
        "Azure Functions Python v2 API with dedicated health, visitor-counter, and AI-assistant routes.",
        "Cosmos DB persistence with hashed visitor identifiers and TTL-based cleanup for rate-limit records.",
        "Remote Terraform state, protected production workflow, dependency auditing, and secret-safe OIDC deployment.",
        "The frontend keeps AI provider branding neutral while the provider secret remains backend-only.",
      ],
      technologies: [
        "React",
        "TypeScript",
        "Vite",
        "Azure Functions",
        "Cosmos DB",
        "Terraform",
        "GitHub Actions",
        "Application Insights",
        "Log Analytics",
      ],
      architectureFlows: [
        {
          label: "Runtime request",
          nodes: ["Visitor", "GitHub Pages", "Azure Functions", "Cosmos DB", "AI provider", "Application Insights"],
        },
        {
          label: "Delivery path",
          nodes: ["Git", "GitHub Actions", "OIDC", "Azure infrastructure", "GitHub Pages"],
        },
      ],
    },
    architecture: {
      diagrams: [
        {
          id: "portfolio-runtime",
          title: "Runtime architecture",
          svg: "/architecture/portfolio/runtime.svg",
          description:
            "Container-level view of visitor traffic through GitHub Pages and Azure Functions, including state, the external AI provider, and Azure-native telemetry.",
          summary: [
            "Visitors load the React and TypeScript application from GitHub Pages, then call the Python Azure Function over CORS-enabled HTTPS.",
            "The Function App exposes health, visitor-counter, and portfolio-assistant routes; Cosmos DB stores counter and rate-limit state.",
            "Application Insights sends request and exception telemetry to the dedicated Log Analytics workspace.",
          ],
        },
        {
          id: "portfolio-delivery",
          title: "Delivery & infrastructure",
          svg: "/architecture/portfolio/delivery.svg",
          description:
            "Path-specific delivery view showing validation, GitHub Pages publication, Azure OIDC deployment, Terraform provisioning, and post-deployment verification.",
          summary: [
            "Pull requests validate the frontend, backend, dependencies, and Terraform plan before production changes are merged.",
            "Frontend artifacts are published to the dedicated Pages repository; backend packages and Terraform changes reach Azure through federated OIDC.",
            "Terraform state remains in a separate Azure Storage backend, while backend deployment finishes with health and visitor API smoke checks.",
          ],
        },
      ],
    },
  },
  {
    id: "homelab-gitops",
    slug: "homelab-gitops",
    title: "Homelab GitOps Environment",
    shortTitle: "Homelab GitOps",
    category: "Kubernetes & GitOps",
    status: "Single-node topology · active lab",
    repositoryUrl: "https://github.com/Jeysibn/homelab-gitops",
    preview: {
      summary:
        "A single-node k3s environment on a Terraform-provisioned Proxmox VM, with Calico bootstrap, Argo CD convergence, LAN ingress, storage, DNS, and observability.",
      primaryOutcome:
        "Bootstrap gates Argo CD on working Calico and cluster-network acceptance checks before App-of-Apps reconciliation from main.",
      flow: {
        label: "Provision → converge",
        nodes: ["Terraform", "Proxmox VM", "k3s + Calico", "Argo CD", "Platform services"],
      },
      technologies: ["Terraform", "Proxmox", "k3s", "Calico", "Argo CD"],
    },
    details: {
      summary:
        "A self-managed Kubernetes environment built around declarative infrastructure, GitOps delivery, continuous validation, and operational visibility.",
      purpose:
        "Build a practical environment where infrastructure and application state can be reproduced from code while reducing configuration drift and manual deployment work.",
      outcomes: [
        "Terraform automates virtual-machine provisioning on Proxmox.",
        "Argo CD reconciles Git-defined application state and supports self-healing delivery workflows.",
        "CI quality gates render Helm templates, validate Kubernetes schemas, and catch configuration problems before deployment.",
        "Prometheus and Grafana provide operational visibility across the cluster and workloads.",
      ],
      highlights: [
        "Single-node k3s server on a Terraform-provisioned Ubuntu VM in Proxmox.",
        "Calico is bootstrap-owned and overlay encapsulation is disabled for the current single-node topology.",
        "App-of-Apps GitOps structure with ordered application deployment.",
        "Declarative MetalLB, Traefik ingress, Pi-hole, Unbound, Longhorn, Prometheus, Loki, Alloy, and Grafana services.",
      ],
      technologies: [
        "K3s",
        "Calico",
        "Argo CD",
        "Terraform",
        "Proxmox",
        "Helm",
        "GitHub Actions",
        "MetalLB",
        "Longhorn",
        "Prometheus",
        "Grafana",
      ],
      architectureFlows: [
        {
          label: "Provision & reconcile",
          nodes: ["Terraform", "Proxmox", "Ubuntu VM", "k3s + Calico", "Argo CD", "Workloads"],
        },
        {
          label: "LAN request",
          nodes: ["LAN client", "Pi-hole / Unbound", "MetalLB / Traefik", "k3s workloads", "Longhorn / telemetry"],
        },
      ],
    },
    architecture: {
      diagrams: [
        {
          id: "homelab-system",
          title: "Primary system architecture",
          svg: "/architecture/homelab/system.svg",
          description:
            "Container-level view of LAN traffic entering a single-node k3s cluster and the networking, storage, workload, and observability services operating inside it.",
          summary: [
            "Pi-hole and Unbound provide LAN and recursive DNS; MetalLB exposes service addresses and Traefik routes HTTP and HTTPS traffic.",
            "The current cluster is one k3s server on an Ubuntu virtual machine provisioned in Proxmox, with Calico providing pod networking.",
            "Longhorn supplies persistent volumes, while Prometheus, Loki, Alloy, and Grafana provide metrics, logs, collection, and visualization.",
          ],
        },
        {
          id: "homelab-gitops",
          title: "GitOps & provisioning flow",
          svg: "/architecture/homelab/gitops.svg",
          description:
            "Delivery view showing GitHub validation, Terraform access through Tailscale, Proxmox provisioning, host bootstrap, and Argo CD reconciliation from main.",
          summary: [
            "GitHub Actions validates shell, YAML, rendered Helm applications, Kubernetes schemas, and Terraform before changes progress.",
            "Terraform uses the bpg/proxmox provider through Tailscale and keeps remote state in the HCP Terraform workspace.",
            "Bootstrap installs k3s, Calico, network acceptance tests, and Argo CD; the root application then reconciles ordered Helm and manifest waves from main.",
          ],
        },
      ],
    },
  },
  {
    id: "monikey",
    slug: "monikey",
    title: "MoniKey",
    shortTitle: "MoniKey",
    category: "Privacy-first personal finance",
    status: "Active engineering · deployment gaps documented",
    repositoryUrl: "https://github.com/Jeysibn/monikey",
    preview: {
      summary:
        "A self-hosted personal finance application with a React frontend, Fastify API, PostgreSQL ledger, and a separate worker for durable background work.",
      primaryOutcome:
        "Authoritative money stays exact across the boundary: PostgreSQL BIGINT backs decimal minor-unit strings, while worker jobs use durable PostgreSQL scheduling.",
      flow: {
        label: "Application runtime",
        nodes: ["Browser", "nginx / React", "Fastify API", "PostgreSQL", "Worker"],
      },
      technologies: ["React 19", "TypeScript", "Fastify 5", "Prisma 6", "PostgreSQL"],
    },
    details: {
      summary:
        "A privacy-first, self-hosted personal finance application covering transactions, accounts, budgets, goals, recurring bills, reports, imports, reconciliation, crypto, and security controls without treating every adapter as an enabled workflow.",
      purpose:
        "Build a finance system where ledger correctness, explicit user review, local-first boundaries, and operational recovery matter more than a simplistic expense-tracker model.",
      outcomes: [
        "Authoritative money values remain PostgreSQL BIGINT and cross the JSON boundary as decimal minor-unit strings rather than relying on floating-point ledger arithmetic.",
        "The separate worker claims durable PostgreSQL jobs with FOR UPDATE SKIP LOCKED, retries failed work, recovers stale locks, and records terminal dead states.",
        "Bounded local-first behavior covers cached snapshots, receipt Blobs, pending create intentions, explicit replay/discard choices, and browser Tesseract OCR suggestions.",
        "The repository publishes application and migration images, while the external GitOps repository owns manifests, ingress, secrets, rollout policy, and backup scheduling.",
      ],
      highlights: [
        "React 19/Vite frontend served by nginx and a Fastify 5 API backed by Prisma and PostgreSQL 18.",
        "Argon2id passwords, hashed random session tokens, HttpOnly/SameSite cookies, origin enforcement, rate limiting, request IDs, and redacted logs.",
        "Optional adapter boundaries cover FX, crypto quotes, OCR, AI insights, object storage, email, and bank imports; provider configuration and user review remain required.",
        "Current deployment documentation still records mutable image references, HTTP/development configuration, and missing backup wiring as deployment-owner work.",
      ],
      technologies: [
        "React 19",
        "TypeScript",
        "Vite",
        "Fastify 5",
        "Prisma 6",
        "PostgreSQL 18",
        "Docker / Compose",
        "nginx",
        "IndexedDB",
      ],
      architectureFlows: [
        {
          label: "Application runtime",
          nodes: ["Browser", "nginx / React", "Fastify API", "PostgreSQL", "Worker"],
        },
        {
          label: "Durable background work",
          nodes: ["Worker tick", "worker_jobs", "SKIP LOCKED claim", "Processor", "Retry / dead"],
        },
      ],
    },
    architecture: {
      diagrams: [
        {
          id: "monikey-system",
          title: "Application runtime architecture",
          svg: "/architecture/monikey/system.svg",
          description:
            "Runtime view of the self-hosted MoniKey application: nginx serves the React frontend, the Fastify API owns requests and adapters, PostgreSQL stores authoritative state, and a separate worker runs durable maintenance jobs.",
          summary: [
            "The browser reaches the React application through nginx; same-origin /api/v1 requests are proxied to the Fastify API.",
            "Fastify uses Prisma/PostgreSQL for authenticated finance state and exposes provider-neutral adapter seams for optional FX, quote, OCR, AI, object storage, email, and bank workflows.",
            "The API and worker share the backend codebase and database; PostgreSQL remains authoritative for the ledger and for background job state.",
          ],
        },
        {
          id: "monikey-delivery",
          title: "Durable processing & delivery boundary",
          svg: "/architecture/monikey/delivery.svg",
          description:
            "Focused view of MoniKey's PostgreSQL-backed worker lifecycle and the handoff from repository-owned images to externally owned GitOps deployment configuration.",
          summary: [
            "A worker tick finds due rows in worker_jobs and claims them with FOR UPDATE SKIP LOCKED so concurrent work does not duplicate a job.",
            "Processors persist success, retry/backoff, stale-lock recovery, or terminal dead states in PostgreSQL; no message broker is used for this worker scheduler.",
            "GitHub Actions publishes application and migration images, but the homelab GitOps repository still owns deployment consumption and has documented digest, security, and backup gaps.",
          ],
        },
      ],
    },
  },
  {
    id: "noc-report",
    slug: "noc-report",
    title: "NOC Report Builder",
    shortTitle: "NOC Report",
    category: "Operations evidence & AI workflow",
    status: "Active development",
    repositoryUrl: "https://github.com/Jeysibn/noc-report",
    preview: {
      summary:
        "An evolving NOC report builder that turns shift-scoped incidents and frozen evidence into validated analysis and deterministic web/DOCX reports.",
      primaryOutcome:
        "Claude supplies narrative reasoning; application-owned composition derives mandatory evidence coverage and report order from a frozen ReportSnapshot.",
      flow: {
        label: "Daily report path",
        nodes: ["Operator", "React web", "FastAPI", "Job / RabbitMQ", "Bridge / sandbox", "ReportDocument"],
      },
      technologies: ["React", "FastAPI", "PostgreSQL", "MinIO", "RabbitMQ"],
    },
    details: {
      summary:
        "An actively evolving NOC report builder with React and TypeScript, a FastAPI backend, evidence-aware domain models, a host-side Claude Code Bridge, sandboxed skill execution, and renderer-neutral report documents.",
      purpose:
        "Make operational reporting traceable: evidence is frozen and provenance is preserved, AI is bounded to narrative reasoning, and deterministic application code owns mandatory report facts and composition.",
      outcomes: [
        "The API models shifts, incidents, evidence, OCR, jobs, analysis runs, reports, search, analytics, RBAC, and administration around a frozen report snapshot.",
        "Transactional outbox rows are committed with jobs before dispatch to RabbitMQ; the host-side bridge consumes jobs and runs Claude skills inside a Docker sandbox.",
        "The canonical Daily Report keeps Claude's plan narrative-only while Report Composition derives alert/log coverage, ordering, provenance, and required evidence from the frozen snapshot.",
        "A renderer-neutral ReportDocument feeds both the web preview and DOCX output, so presentation formats share the same composed semantic document.",
      ],
      highlights: [
        "React/Vite/Tailwind/Vitest frontend and FastAPI routes for auth/RBAC, shifts, incidents, evidence, OCR, jobs, analysis, reports, search, analytics, and administration.",
        "PostgreSQL stores domain state and provenance; MinIO stores evidence/report/job artifacts; RabbitMQ carries durable job messages.",
        "SkillSnapshot hashes, schema validation, object-reference allow-lists, job leases, retry/dead-letter controls, and bounded AI usage protect execution identity and evidence boundaries.",
        "Current skills include log-triage-summary and daily-alert-report; the repository remains an active engineering project rather than a production claim.",
      ],
      technologies: [
        "React",
        "TypeScript",
        "FastAPI",
        "PostgreSQL",
        "MinIO",
        "RabbitMQ",
        "Claude Code Bridge",
        "Docker Sandbox",
      ],
      architectureFlows: [
        {
          label: "Application runtime",
          nodes: ["Operator", "React web", "FastAPI", "PostgreSQL / MinIO", "Web preview / DOCX"],
        },
        {
          label: "Evidence → analysis → report",
          nodes: ["Frozen evidence", "Job + outbox", "RabbitMQ", "Bridge / sandbox", "Report Composition", "ReportDocument"],
        },
      ],
    },
    architecture: {
      diagrams: [
        {
          id: "noc-report-system",
          title: "Application & evidence architecture",
          svg: "/architecture/noc-report/system.svg",
          description:
            "Container-level view of the NOC Report Builder application, its evidence and persistence boundaries, and the report presentation surfaces.",
          summary: [
            "Operators use the React web application to access FastAPI endpoints for shifts, incidents, evidence, analysis, reports, search, analytics, and administration.",
            "PostgreSQL stores domain state, provenance, jobs, snapshots, and report metadata; MinIO stores immutable evidence and generated artifacts.",
            "The composed semantic ReportDocument is consumed by both the web preview and the DOCX adapter, keeping presentation separate from report policy.",
          ],
        },
        {
          id: "noc-report-pipeline",
          title: "Evidence → AI analysis → report pipeline",
          svg: "/architecture/noc-report/ai-report-pipeline.svg",
          description:
            "Sequence-oriented delivery view showing transactional job creation, RabbitMQ dispatch, host-side bridge execution in a Docker sandbox, validated results, and deterministic report composition.",
          summary: [
            "The API freezes the report snapshot and commits the Job plus OutboxEvent together; the outbox dispatcher publishes only after the transaction is durable.",
            "RabbitMQ carries references rather than evidence bytes; the host-side Claude Code Bridge resolves the exact SkillSnapshot and runs it in a constrained Docker sandbox.",
            "Validated results are persisted, then application-owned Report Composition materializes mandatory evidence and narrative into ReportDocument for web and DOCX output.",
          ],
        },
      ],
    },
  },
];

export const certifications: Certification[] = [
  {
    name: "Oracle Cloud Infrastructure (OCI) Foundations Associate",
    issuer: "Oracle",
    status: "earned",
  },
  {
    name: "Trend Vision One Server and Workload Protection Professional",
    issuer: "Trend Micro",
    status: "earned",
  },
  { name: "GitHub Foundations", issuer: "GitHub", status: "earned" },
  {
    name: "HashiCorp Certified: Terraform Associate (004)",
    issuer: "HashiCorp",
    status: "in-progress",
  },
];

export const education = {
  degree: "Bachelor of Science in Computer Engineering",
  school: "National University Baliwag",
  location: "Baliwag, Bulacan",
  period: "August 2021 – August 2025",
  thesis:
    "IoT Integrated Consultation System for Enhanced Student-Faculty Interaction",
} as const;

export const professionalSummary =
  "Computer Engineering graduate and OCI-certified engineer building production-style cloud and Kubernetes infrastructure from provisioning through GitOps delivery and observability. Brings enterprise SaaS technical-support experience in cloud-based security environments and is pursuing entry-level Cloud Support, DevOps, and Cloud Engineering roles.";
