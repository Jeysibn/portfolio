import type { ReactNode } from "react";
import type { SimpleIcon } from "simple-icons";
import {
  siArgo,
  siDocker,
  siGit,
  siGithubactions,
  siGnubash,
  siGrafana,
  siHelm,
  siJira,
  siKubernetes,
  siLinux,
  siPrometheus,
  siProxmox,
  siPython,
  siTerraform,
  siTrendmicro,
  siVmware,
  siYaml,
} from "simple-icons";

const brandIcons: Record<string, SimpleIcon> = {
  "VMware vSphere": siVmware,
  Proxmox: siProxmox,
  "Kubernetes (k3s)": siKubernetes,
  Docker: siDocker,
  Helm: siHelm,
  Terraform: siTerraform,
  "GitHub Actions": siGithubactions,
  "Argo CD": siArgo,
  Git: siGit,
  YAML: siYaml,
  Prometheus: siPrometheus,
  Grafana: siGrafana,
  Linux: siLinux,
  Python: siPython,
  Bash: siGnubash,
  "Trend Vision One": siTrendmicro,
  Jira: siJira,
};

const customIcons: Record<string, ReactNode> = {
  Azure: (
    <path
      className="solid-mark"
      d="M6 26 14.5 7h6L12 26Zm9.5 0 5.2-11.2L30 26Z"
    />
  ),
  AWS: (
    <>
      <path d="M8 22.5c5.8 3.7 13.5 4 20-.2" />
      <path d="m24.5 20 3.8 2.2-1 4" />
      <path d="M10 18.5 14 8l4 10.5M11.8 14h4.5M20 9v9.5h4.5c3 0 3-4.5 0-4.5H20" />
    </>
  ),
  "Oracle Cloud Infrastructure": (
    <path
      className="solid-mark"
      d="M11 10h14a8 8 0 0 1 0 16H11a8 8 0 0 1 0-16Zm.5 5a3 3 0 0 0 0 6h13a3 3 0 0 0 0-6Z"
    />
  ),
  PowerShell: (
    <>
      <path d="M7 9h22l-3 18H4Z" />
      <path d="m11 14 5 4-6 4M17 23h7" />
    </>
  ),
  "Azure Application Insights": (
    <>
      <path d="M12 21c-2-1.7-3.2-4-3.2-6.5a9.2 9.2 0 0 1 18.4 0c0 2.5-1.2 4.8-3.2 6.5l-1.4 1.3V25h-9.2v-2.7Z" />
      <path d="M14 29h8M18 3v3M5 15H2M34 15h-3" />
    </>
  ),
  "Log Analytics": (
    <>
      <path d="M7 28V13h4v15M15 28V8h4v20M23 28V17h4v11" />
      <circle cx="25" cy="10" r="5" />
      <path d="m29 14 4 4" />
    </>
  ),
  "Windows Server": (
    <path
      className="solid-mark"
      d="m6 9 11-1.5v9H6ZM19 7.2 30 5.5v11H19ZM6 18.5h11v9L6 26ZM19 18.5h11v11L19 27.8Z"
    />
  ),
  "Active Directory": (
    <>
      <circle cx="18" cy="8" r="3" />
      <circle cx="9" cy="27" r="3" />
      <circle cx="27" cy="27" r="3" />
      <path d="M18 11v7M9 24v-6h18v6" />
    </>
  ),
  "TCP/IP": (
    <>
      <rect x="5" y="8" width="10" height="8" />
      <rect x="21" y="20" width="10" height="8" />
      <path d="M15 12h9v5M21 24h-9v-5M21 14l3 3-3 3M15 16l-3 3 3 3" />
    </>
  ),
  DNS: (
    <>
      <circle cx="18" cy="18" r="12" />
      <path d="M6 18h24M18 6c4 4 4 20 0 24M18 6c-4 4-4 20 0 24" />
    </>
  ),
  VPN: (
    <>
      <path d="M18 5 29 9v8c0 7-4.5 11.5-11 14-6.5-2.5-11-7-11-14V9Z" />
      <path d="M13 18h10M18 13v10" />
    </>
  ),
  SSH: (
    <>
      <rect x="5" y="7" width="26" height="22" />
      <path d="m10 13 5 5-5 5M18 23h8" />
    </>
  ),
  RDP: (
    <>
      <rect x="5" y="7" width="18" height="14" />
      <rect x="13" y="15" width="18" height="14" />
      <path d="m17 11 3 3-3 3M19 25l-3-3 3-3" />
    </>
  ),
  ITIL: (
    <>
      <circle cx="18" cy="18" r="11" />
      <path d="M18 7v5M18 24v5M7 18h5M24 18h5M13 13l10 10M23 13 13 23" />
    </>
  ),
};

function BrandGlyph({ icon }: { icon: SimpleIcon }) {
  return (
    <path className="brand-mark" d={icon.path} transform="translate(6 6)" />
  );
}

export function SkillGlyph({ name }: { name: string }) {
  const brand = brandIcons[name];
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <rect className="glyph-frame" x="1" y="1" width="34" height="34" />
      <g className="glyph-mark">
        {brand ? <BrandGlyph icon={brand} /> : customIcons[name]}
      </g>
    </svg>
  );
}
