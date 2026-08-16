export type ThemePreference = "system" | "light" | "dark";

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
  title: string;
  category: string;
  summary: string;
  purpose: string;
  outcomes: string[];
  highlights: string[];
  technologies: string[];
  repositoryUrl: string;
  architectureUrl?: string;
  architectureAlt?: string;
}

export const navigation = [
  { label: "About", id: "about" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Skills", id: "skills" },
  { label: "Resume", id: "resume" },
  { label: "Contact", id: "contact" },
] as const;

export const skillGroups: SkillGroup[] = [
  {
    label: "Cloud & virtualization",
    items: ["Azure", "AWS", "Oracle Cloud Infrastructure", "VMware vSphere", "Proxmox"],
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
    items: ["Azure Application Insights", "Log Analytics", "Prometheus", "Grafana"],
  },
  {
    label: "Systems & networking",
    items: ["Linux", "Windows Server", "Active Directory", "TCP/IP", "DNS", "VPN", "SSH", "RDP"],
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
    title: "Cloud-Backed Portfolio",
    category: "Serverless cloud platform",
    summary:
      "A production-style portfolio that treats a personal website like a real service: infrastructure as code, automated delivery, serverless APIs, observability, deployment verification, and an AI assistant.",
    purpose:
      "Move beyond static hosting and demonstrate practical DevOps engineering through a small, cost-conscious system that is automated, observable, and reproducible.",
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
      "Milestone 6 adds a typed React + TypeScript experience without changing the backend contracts.",
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
    ],
    repositoryUrl: "https://github.com/Jeysibn/portfolio",
    architectureUrl:
      "https://raw.githubusercontent.com/Jeysibn/portfolio/main/frontend/assets/architectural-diagram-cloudbacked-portfolio.png",
    architectureAlt: "Architecture diagram for the cloud-backed portfolio",
  },
  {
    id: "homelab-gitops",
    title: "Homelab GitOps Environment",
    category: "Kubernetes & GitOps",
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
      "Multi-node k3s cluster across Raspberry Pi and repurposed x86 hardware.",
      "App-of-Apps GitOps structure with ordered application deployment.",
      "Automated DNS, TLS, persistent storage, and declarative workload management.",
      "Repository structure separates reusable Kubernetes manifests from environment-specific configuration.",
    ],
    technologies: ["K3s", "Argo CD", "Terraform", "Proxmox", "Helm", "GitHub Actions", "Prometheus", "Grafana"],
    repositoryUrl: "https://github.com/Jeysibn/homelab-gitops",
    architectureUrl: "https://raw.githubusercontent.com/Jeysibn/homelab-gitops/main/docs/Architecture.png",
    architectureAlt: "Architecture diagram for the Kubernetes GitOps homelab",
  },
];

export const certifications = [
  "Oracle Cloud Infrastructure (OCI) Foundations Associate",
  "Trend Vision One Server and Workload Protection Professional",
  "GitHub Foundations",
] as const;

export const education = {
  degree: "Bachelor of Science in Computer Engineering",
  school: "National University Baliwag",
  location: "Baliwag, Bulacan",
  period: "August 2021 – August 2025",
  thesis: "IoT Integrated Consultation System for Enhanced Student-Faculty Interaction",
} as const;

export const professionalSummary =
  "Computer Engineering graduate and OCI-certified engineer building production-style cloud and Kubernetes infrastructure from provisioning through GitOps delivery and observability. Brings enterprise SaaS technical-support experience in cloud-based security environments and is pursuing entry-level Cloud Support, DevOps, or Junior Site Reliability roles.";
