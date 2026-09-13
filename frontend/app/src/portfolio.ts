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
  title: string;
  category: string;
  summary: string;
  purpose: string;
  outcomes: string[];
  highlights: string[];
  technologies: string[];
  repositoryUrl: string;
  architectureFlows: Array<{
    label: string;
    nodes: string[];
  }>;
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
      "React + TypeScript provides the recruiter-facing control surface without changing the backend contracts.",
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
    architectureFlows: [
      {
        label: "Runtime request",
        nodes: [
          "Visitor",
          "React / Vite",
          "Azure Functions",
          "Cosmos DB",
          "AI provider",
          "Application Insights",
        ],
      },
      {
        label: "Delivery path",
        nodes: [
          "Git",
          "GitHub Actions",
          "OIDC",
          "Azure infrastructure",
          "GitHub Pages",
        ],
      },
    ],
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
      "Single-node k3s server on a Terraform-provisioned Ubuntu VM in Proxmox.",
      "App-of-Apps GitOps structure with ordered application deployment.",
      "Declarative Calico networking, MetalLB, Traefik ingress, DNS, TLS, Longhorn storage, and workloads.",
      "Repository structure separates reusable Kubernetes manifests from environment-specific configuration.",
    ],
    technologies: [
      "K3s",
      "Argo CD",
      "Terraform",
      "Proxmox",
      "Helm",
      "GitHub Actions",
      "Prometheus",
      "Grafana",
    ],
    repositoryUrl: "https://github.com/Jeysibn/homelab-gitops",
    architectureFlows: [
      {
        label: "Provision & reconcile",
        nodes: ["Terraform", "Proxmox", "k3s", "Argo CD", "Workloads"],
      },
      {
        label: "Observe",
        nodes: ["Workloads", "Prometheus", "Grafana"],
      },
    ],
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
