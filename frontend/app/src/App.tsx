const navItems = [
  ["About", "about"],
  ["Skills", "skills"],
  ["Experience", "experience"],
  ["Projects", "projects"],
  ["Resume", "resume"],
  ["Contact", "contact"],
] as const;

const skills = [
  ["Cloud", "Azure · AWS · OCI"],
  ["Infrastructure", "Terraform · Docker · Kubernetes"],
  ["Delivery", "GitHub Actions · Argo CD · Git"],
  ["Observability", "Application Insights · Prometheus · Grafana"],
] as const;

const projects = [
  {
    number: "01",
    title: "Cloud-Backed Portfolio",
    summary:
      "Production-style serverless portfolio with infrastructure as code, CI/CD, observability, deployment verification, and an AI-powered assistant.",
    stack: "Azure Functions · Cosmos DB · Terraform · GitHub Actions",
  },
  {
    number: "02",
    title: "Kubernetes GitOps Homelab",
    summary:
      "A self-healing Kubernetes environment built around declarative infrastructure, GitOps delivery, and operational visibility.",
    stack: "K3s · Argo CD · Terraform · Prometheus · Grafana",
  },
] as const;

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-50 border-b border-white/8 bg-[color:var(--bg)]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <a href="#top" className="font-mono text-sm font-semibold tracking-[0.18em] text-cyan-300">
            JEYSIBN
          </a>
          <nav aria-label="Primary navigation" className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            {navItems.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto grid min-h-[82vh] max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.25fr_0.75fr] md:px-8">
          <div className="reveal max-w-3xl">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.24em] text-cyan-300">Cloud / DevOps Engineer</p>
            <h1 className="text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.05em] text-white sm:text-6xl md:text-7xl">
              I build reliable cloud infrastructure and automate the path to production.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              I design production-style systems around infrastructure as code, CI/CD, Kubernetes, observability, and practical cloud operations.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#projects" className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200">
                Explore my work ↓
              </a>
              <a href="https://github.com/Jeysibn" target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-white/5">
                GitHub ↗
              </a>
            </div>
          </div>

          <aside className="reveal rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-cyan-950/20" aria-label="Portfolio system status">
            <div className="mb-5 flex items-center justify-between border-b border-white/8 pb-4 font-mono text-xs text-slate-400">
              <span>$ portfolio status</span>
              <span className="text-emerald-300">LIVE</span>
            </div>
            <dl className="space-y-4 font-mono text-sm">
              <Status label="Environment" value="Production" />
              <Status label="API health" value="Healthy" healthy />
              <Status label="CI/CD" value="Passing" healthy />
              <Status label="IaC" value="Terraform managed" />
              <Status label="Telemetry" value="Application Insights" />
            </dl>
          </aside>
        </section>

        <Section id="about" eyebrow="01 / ABOUT" title="Engineering systems that are easier to deploy, observe, and recover.">
          <div className="grid gap-8 text-lg leading-8 text-slate-300 md:grid-cols-2">
            <p>I started in hands-on technical support and infrastructure troubleshooting, where reliability problems are impossible to hide behind diagrams.</p>
            <p>That pushed me toward cloud automation, infrastructure as code, Kubernetes, GitOps, and observability—building systems to be predictable before incidents happen.</p>
          </div>
        </Section>

        <Section id="skills" eyebrow="02 / TOOLKIT" title="A practical toolkit for cloud delivery and operations.">
          <div className="grid gap-x-12 gap-y-8 md:grid-cols-2">
            {skills.map(([label, value]) => (
              <div key={label} className="border-t border-white/10 pt-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-300">{label}</p>
                <p className="mt-3 text-lg text-slate-200">{value}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="experience" eyebrow="03 / EXPERIENCE" title="From troubleshooting production issues to designing for reliability.">
          <div className="space-y-10 border-l border-white/10 pl-6">
            <Timeline date="2025–2026" role="Technical Support Engineer" org="TrendAI" description="Enterprise endpoint-security SaaS support, cloud troubleshooting, incident reproduction, and customer-facing technical resolution." />
            <Timeline date="2025" role="IT Helpdesk Intern" org="Philippine Transmarine Carriers" description="Windows support, identity and access assistance, networking troubleshooting, asset operations, and workstation lifecycle work." />
          </div>
        </Section>

        <Section id="projects" eyebrow="04 / SELECTED WORK" title="Projects presented as engineering case studies, not just technology lists.">
          <div className="space-y-5">
            {projects.map((project) => (
              <article key={project.number} className="group grid gap-6 rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 md:grid-cols-[80px_1fr] md:p-8">
                <p className="font-mono text-sm text-cyan-300">{project.number}</p>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white">{project.title}</h3>
                  <p className="mt-4 max-w-3xl leading-7 text-slate-300">{project.summary}</p>
                  <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-slate-400">{project.stack}</p>
                  <button type="button" className="mt-6 text-sm font-semibold text-cyan-300 transition group-hover:translate-x-1">View case study →</button>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="resume" eyebrow="05 / RESUME" title="Cloud Support and DevOps, backed by hands-on infrastructure work.">
          <div className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/[0.025] p-7 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xl font-semibold text-white">Jerome Christian V. Ibon</p>
              <p className="mt-2 text-slate-400">Cloud · Kubernetes · GitOps · Infrastructure Automation</p>
            </div>
            <button type="button" onClick={() => window.print()} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:bg-white/5">Print / Save PDF</button>
          </div>
        </Section>

        <Section id="contact" eyebrow="06 / CONTACT" title="Let’s build something reliable.">
          <div className="flex flex-wrap gap-4 text-lg">
            <a className="text-cyan-300 hover:text-cyan-200" href="mailto:jeysibn@gmail.com">Email ↗</a>
            <a className="text-cyan-300 hover:text-cyan-200" href="https://github.com/Jeysibn" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a className="text-cyan-300 hover:text-cyan-200" href="https://linkedin.com/in/jeromeibon" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          </div>
        </Section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-white/10 px-5 py-8 font-mono text-xs text-slate-500 md:flex-row md:justify-between md:px-8">
        <span>Built with React + TypeScript</span>
        <span>Infrastructure managed with Terraform</span>
      </footer>
    </div>
  );
}

function Status({ label, value, healthy = false }: { label: string; value: string; healthy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={healthy ? "text-emerald-300" : "text-slate-200"}>{healthy ? "● " : ""}{value}</dd>
    </div>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-white/8">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <p className="mb-5 font-mono text-xs uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>
        <h2 className="mb-12 max-w-4xl text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl md:text-5xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}

function Timeline({ date, role, org, description }: { date: string; role: string; org: string; description: string }) {
  return (
    <article className="relative">
      <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-[var(--bg)] bg-cyan-300" />
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">{date}</p>
      <h3 className="mt-2 text-xl font-semibold text-white">{role}</h3>
      <p className="mt-1 text-cyan-300">{org}</p>
      <p className="mt-4 max-w-3xl leading-7 text-slate-300">{description}</p>
    </article>
  );
}

export default App;
