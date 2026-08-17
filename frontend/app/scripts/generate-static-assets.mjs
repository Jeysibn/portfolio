import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const outputPath = resolve("public/resume.pdf");
mkdirSync(dirname(outputPath), { recursive: true });

function escapePdfText(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

const lines = [
  { text: "Jerome Christian V. Ibon", size: 20, bold: true },
  { text: "Cloud Support | DevOps | Cloud Engineering", size: 11 },
  { text: "Malolos, Bulacan, Philippines | jeysibn@gmail.com | linkedin.com/in/jeromeibon | github.com/Jeysibn", size: 9 },
  "",
  { text: "Professional Summary", size: 13, bold: true },
  { text: "Computer Engineering graduate and OCI-certified engineer building production-style cloud and Kubernetes infrastructure from provisioning through GitOps delivery and observability. Brings enterprise SaaS technical-support experience and is pursuing entry-level Cloud Support, DevOps, and Cloud Engineering roles.", size: 9 },
  "",
  { text: "Technical Skills", size: 13, bold: true },
  { text: "Cloud: Azure, AWS, Oracle Cloud Infrastructure, VMware vSphere, Proxmox", size: 9 },
  { text: "Delivery: Terraform, GitHub Actions, Argo CD, Git, YAML", size: 9 },
  { text: "Containers: Kubernetes/k3s, Docker, Helm", size: 9 },
  { text: "Observability: Application Insights, Log Analytics, Prometheus, Grafana", size: 9 },
  { text: "Systems: Linux, Windows Server, Active Directory, TCP/IP, DNS, VPN, SSH, RDP", size: 9 },
  "",
  { text: "Experience", size: 13, bold: true },
  { text: "Technical Support Engineer, Endpoint Security SaaS | TrendAI | Aug 2025 - Feb 2026", size: 10, bold: true },
  { text: "Resolved 80+ enterprise technical cases across network, system, and cloud infrastructure issues while working within SLA expectations.", size: 9 },
  { text: "Provisioned AWS environments including EC2, VPCs, security groups, subnets, and routing to reproduce customer scenarios.", size: 9 },
  { text: "Completed 640 hours of training across enterprise networking, server administration, VMware vSphere, Azure fundamentals, and AWS fundamentals.", size: 9 },
  { text: "IT Helpdesk Intern | Philippine Transmarine Carriers | Mar 2025 - May 2025", size: 10, bold: true },
  { text: "Assisted with Active Directory accounts, user access controls, network connectivity, VPN troubleshooting, endpoint redeployment, and IT assets.", size: 9 },
  "",
  { text: "Projects", size: 13, bold: true },
  { text: "Cloud-Backed Portfolio: React, TypeScript, Azure Functions, Cosmos DB, Terraform, GitHub Actions, Application Insights.", size: 9 },
  { text: "Homelab GitOps Environment: k3s, Argo CD, Terraform, Proxmox, Helm, GitHub Actions, Prometheus, Grafana.", size: 9 },
  "",
  { text: "Education & Certifications", size: 13, bold: true },
  { text: "Bachelor of Science in Computer Engineering | National University Baliwag | Aug 2021 - Aug 2025", size: 9 },
  { text: "Oracle Cloud Infrastructure Foundations Associate | Trend Vision One Server and Workload Protection Professional | GitHub Foundations", size: 9 },
];

const wrapped = [];
for (const entry of lines) {
  if (entry === "") {
    wrapped.push(entry);
    continue;
  }
  const words = entry.text.split(" ");
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > 112 && current) {
      wrapped.push({ ...entry, text: current });
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) wrapped.push({ ...entry, text: current });
}

let y = 790;
const commands = ["BT", "/F1 10 Tf"];
for (const entry of wrapped) {
  if (entry === "") {
    y -= 12;
    continue;
  }
  const font = entry.bold ? "F2" : "F1";
  commands.push(`/${font} ${entry.size} Tf 54 ${y} Td (${escapePdfText(entry.text)}) Tj`);
  commands.push(`-${54} -${y} Td`);
  y -= entry.size + 5;
}
commands.push("ET");

const stream = commands.join("\n");
const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
];

let pdf = "%PDF-1.4\n";
const offsets = [0];
for (let index = 0; index < objects.length; index += 1) {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
}
const xrefOffset = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
for (const offset of offsets.slice(1)) {
  pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

writeFileSync(outputPath, pdf, "binary");
console.log(`Generated ${outputPath}`);
