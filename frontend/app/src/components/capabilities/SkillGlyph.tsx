const glyphs: Record<string, string> = {
  Azure: "AZ",
  AWS: "AWS",
  "Oracle Cloud Infrastructure": "OCI",
  "VMware vSphere": "VM",
  Proxmox: "PX",
  "Kubernetes (k3s)": "K8",
  Docker: "DK",
  Helm: "HM",
  Terraform: "TF",
  "GitHub Actions": "GA",
  "Argo CD": "AR",
  Git: "GT",
  YAML: "YML",
  "Azure Application Insights": "AI",
  "Log Analytics": "LA",
  Prometheus: "PM",
  Grafana: "GF",
  Linux: "LX",
  "Windows Server": "WS",
  "Active Directory": "AD",
  "TCP/IP": "IP",
  DNS: "DNS",
  VPN: "VPN",
  SSH: "SSH",
  RDP: "RDP",
  Python: "PY",
  Bash: "SH",
  PowerShell: "PS",
  "Trend Vision One": "TV",
  Jira: "JR",
  ITIL: "IT",
};

export function SkillGlyph({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="34" height="34" />
      <path d="M7 27h22M10 9h16" />
      <text x="18" y="21" textAnchor="middle">
        {glyphs[name] ?? name.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  );
}
