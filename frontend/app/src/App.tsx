import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { fetchHealth, fetchVisitorCount, sendChatMessage } from "./api";
import { useActiveSection, useTheme } from "./hooks";
import { certifications, education, experience, navigation, professionalSummary, projects, skillGroups } from "./portfolio";
import type { ChatMessage, Project, ThemePreference } from "./portfolio";
import { attachTilt, useCaseStudyMotion, usePortfolioMotion, useProjectStory, useTraceMotion } from "./motion";

const CHAT_STORAGE_KEY = "jeysibn_chat_history";
const cloudDiagramUrl = new URL("../../assets/architectural-diagram-cloudbacked-portfolio.svg", import.meta.url).href;
const homelabDiagramUrl = "https://raw.githubusercontent.com/Jeysibn/homelab-gitops/main/docs/Architecture.png";

function App() {
  const project = projects.find((item) => location.pathname.endsWith(`${item.id}.html`));
  return project ? <CaseStudy project={project} /> : <Home />;
}

function Home() {
  const active = useActiveSection(navigation.map((item) => item.id));
  const { preference, setPreference } = useTheme();
  const scope = useRef<HTMLDivElement>(null);
  usePortfolioMotion(scope);
  return <div className="app-shell" ref={scope}><a className="skip-link" href="#main-content">Skip to main content</a><Header active={active} preference={preference} onThemeChange={setPreference} /><main id="main-content"><Hero /><Projects /><About /><Experience /><Skills /><Credentials /><Resume /><Contact /></main><Footer /><ChatWidget /><PrintResume /></div>;
}

function Header({ active, preference, onThemeChange }: { active: string; preference: ThemePreference; onThemeChange: (value: ThemePreference) => void }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const current = nav.current?.querySelector<HTMLElement>("[aria-current]");
    if (!nav.current || !current) return;
    nav.current.style.setProperty("--nav-x", `${current.offsetLeft}px`);
    nav.current.style.setProperty("--nav-w", `${current.offsetWidth}`);
  }, [active]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, [open]);
  return <header className="site-header"><div className="header-inner"><a className="wordmark" href="#top" aria-label="Jerome Ibon, home">JI<span aria-hidden="true">/</span></a><nav ref={nav} className="desktop-nav" aria-label="Primary navigation">{navigation.map((item) => <a key={item.id} href={`#${item.id}`} aria-current={active === item.id ? "location" : undefined}>{item.label}</a>)}<i className="nav-indicator" aria-hidden="true" /></nav><div className="header-actions"><ThemeControl value={preference} onChange={onThemeChange} /><button ref={trigger} type="button" className="icon-button menu-button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <CloseIcon /> : <MenuIcon />}</button></div></div><div id="mobile-menu" className="mobile-menu" hidden={!open}><nav aria-label="Mobile navigation">{navigation.map((item) => <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)}>{item.label}</a>)}</nav></div></header>;
}

function ThemeControl({ value, onChange }: { value: ThemePreference; onChange: (value: ThemePreference) => void }) {
  const dark = value === "dark";
  const toggle = () => {
    const update = () => onChange(dark ? "light" : "dark");
    const transitionDocument = document as Document & { startViewTransition?: (callback: () => void) => void };
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && transitionDocument.startViewTransition) transitionDocument.startViewTransition(update);
    else update();
  };
  return <button type="button" className="theme-button" aria-label={`Use ${dark ? "light" : "dark"} theme`} onClick={toggle}>{dark ? <SunIcon /> : <MoonIcon />}<span>{dark ? "Light" : "Dark"}</span></button>;
}

function Hero() {
  return <section id="top" className="hero" aria-labelledby="hero-title"><div className="hero-inner"><div className="hero-identity"><p className="hero-role" data-hero-support>Cloud Support · DevOps · Cloud Engineering</p><h1 id="hero-title" aria-label="Jerome Christian Ibon"><span className="motion-mask hero-name-row"><span data-hero-line data-axis="x">Jerome</span></span><span className="motion-mask hero-name-row is-offset"><span data-hero-line data-axis="y">Christian</span></span><span className="motion-mask hero-name-row"><span data-hero-line data-axis="lock">Ibon</span></span></h1><span className="hero-rule" aria-hidden="true" /></div><div className="hero-system"><InfrastructurePulse /><p className="system-caption" data-hero-support>Source → delivery → service → signals</p></div><div className="hero-copy"><p className="hero-statement" data-hero-support>I build cloud systems that are automated, observable, and meant to be operated.</p><p className="hero-context" data-hero-support>Computer Engineering graduate combining enterprise technical support with hands-on cloud infrastructure, delivery automation, and Kubernetes projects.</p><p className="availability" data-hero-support><span aria-hidden="true" />Open to entry-level opportunities</p><div className="action-row" data-hero-support><a className="button primary" href="#projects">View selected work</a><a className="button secondary" href="#contact">Contact</a><a className="text-link" href="./resume.pdf">Résumé <DownloadIcon /></a><a className="text-link" href="https://github.com/Jeysibn" target="_blank" rel="noreferrer">GitHub <ExternalIcon /></a></div><div data-hero-support><LiveProof /></div></div><a className="scroll-cue" href="#projects" data-hero-support><span>Scroll to trace the work</span><i aria-hidden="true" /></a></div><span className="handoff-line" aria-hidden="true" /></section>;
}

function InfrastructurePulse() {
  return <svg className="infrastructure-pulse" viewBox="0 0 620 250" aria-hidden="true"><path className="pulse-route pulse-path" pathLength="1" d="M30 126H158C206 126 196 52 246 52H374C420 52 414 126 462 126H590" /><path className="pulse-path branch" pathLength="1" d="M246 52V198H462" /><g className="pulse-node" transform="translate(20 108)"><rect width="82" height="36" /><text x="41" y="23">browser</text></g><g className="pulse-node" transform="translate(220 34)"><rect width="104" height="36" /><text x="52" y="23">functions</text></g><g className="pulse-node pulse-destination" transform="translate(462 108)"><rect width="108" height="36" /><text x="54" y="23">observability</text></g><g className="pulse-node" transform="translate(220 180)"><rect width="104" height="36" /><text x="52" y="23">delivery</text></g><circle className="pulse-packet" r="5" cx="0" cy="0" /></svg>;
}

function LiveProof() {
  const [status, setStatus] = useState("Checking live API");
  useEffect(() => { const c = new AbortController(); fetchHealth(c.signal).then(() => setStatus("Azure Functions API is responding")).catch(() => setStatus("Live status unavailable")); return () => c.abort(); }, []);
  return <p className="live-proof" aria-live="polite"><span>Behind this site</span>{status}</p>;
}

function Section({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return <section id={id} className="section" data-motion-section={id} aria-labelledby={`${id}-title`}><div className="section-heading"><h2 id={`${id}-title`}>{title}</h2><p>{intro}</p></div>{children}</section>;
}

function projectDiagramAlt(project: Project) {
  return project.id === "cloud-portfolio"
    ? "Architecture of the portfolio across GitHub Pages, Azure Functions, Cosmos DB, observability, Terraform, and GitHub Actions."
    : "Architecture of the current single-node K3s GitOps homelab on Proxmox.";
}

function Projects() {
  const [active, setActive] = useState(0);
  const scope = useRef<HTMLDivElement>(null);
  const visual = useRef<HTMLDivElement>(null);
  useProjectStory(scope, setActive);
  useEffect(() => visual.current ? attachTilt(visual.current) : undefined, [active]);
  return <Section id="projects" title="Selected work" intro="Two personal systems that show how I provision infrastructure, automate delivery, and leave evidence for operators."><div className="project-story" ref={scope}><div className="project-narratives">{projects.map((project, index) => <article className={`project-narrative ${active === index ? "is-active" : ""}`} key={project.id} data-project-index={index}><p className="project-category">Field note {String(index + 1).padStart(2, "0")} · {project.category}</p><h3>{project.title}</h3><div className="project-mobile-artifact"><img src={project.id === "cloud-portfolio" ? cloudDiagramUrl : homelabDiagramUrl} alt={projectDiagramAlt(project)} loading={index ? "lazy" : "eager"} width={project.id === "cloud-portfolio" ? 1600 : 2048} height={project.id === "cloud-portfolio" ? 960 : 1152} /></div><p>{project.purpose}</p><ul className="signal-list">{project.outcomes.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul><p className="technology-line">{project.technologies.join(" · ")}</p><div className="project-links"><a href={`./${project.id}.html`}>Read case study <ArrowIcon /></a><a href={project.repositoryUrl} target="_blank" rel="noreferrer">Repository <ExternalIcon /></a></div></article>)}</div><aside className="project-stage" aria-live="polite"><div className="project-stage-frame" ref={visual} tabIndex={0}><div className="project-stage-meta"><span>{String(active + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span><strong>{projects[active].title}</strong></div>{projects.map((project, index) => <img className={active === index ? "is-active" : ""} key={project.id} src={project.id === "cloud-portfolio" ? cloudDiagramUrl : homelabDiagramUrl} alt={active === index ? projectDiagramAlt(project) : ""} aria-hidden={active !== index} loading={index ? "lazy" : "eager"} width={project.id === "cloud-portfolio" ? 1600 : 2048} height={project.id === "cloud-portfolio" ? 960 : 1152} />)}<span className="stage-progress" aria-hidden="true"><i style={{ transform: `scaleX(${(active + 1) / projects.length})` }} /></span></div></aside></div></Section>;
}

function About() {
  const principles = [["Automate repeatable work", "Put routine provisioning and delivery in version-controlled workflows."], ["Observe before guessing", "Use health signals, logs, metrics, and traces to investigate behavior."], ["Design for recovery", "Prefer reproducible configuration, small failure boundaries, and usable runbooks."], ["Keep systems understandable", "Document ownership and tradeoffs so the next action is clear."]];
  return <Section id="about" title="Engineering approach" intro="Support work taught me that a system matters most when somebody has to understand it under pressure."><div className="about-layout"><div className="about-copy"><p>That experience pulled me toward cloud and DevOps work: provisioning with Terraform, delivering through GitHub Actions and GitOps, operating Kubernetes, and instrumenting services so failures leave useful evidence.</p><p>I am early in my engineering career. These projects show the habits I am building now and the direction I want to deepen with an experienced team.</p></div><div className="principle-list">{principles.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div></div></Section>;
}

function Experience() {
  return <Section id="experience" title="Experience" intro="Enterprise support and IT operations are the practical foundation behind my infrastructure work."><div className="experience-list">{experience.map((item) => <article className="experience-row" key={item.role}><div className="experience-meta"><time>{item.period}</time><span>{item.location}</span></div><div><h3>{item.role}</h3><p className="organization">{item.organization}</p><p>{item.summary}</p><ul>{item.highlights.map((point) => <li key={point}>{point}</li>)}</ul></div></article>)}</div></Section>;
}

function Skills() {
  const capabilityNotes = [
    "Provision and operate compute across public cloud, virtualization, and homelab environments.",
    "Package workloads and manage declarative application state in Kubernetes.",
    "Turn infrastructure and delivery changes into reviewable, repeatable workflows.",
    "Collect the signals needed to investigate health, latency, and failure.",
    "Work across operating systems, identity, connectivity, DNS, and remote access.",
    "Automate routine operations and support secure technical investigation.",
  ];
  return <Section id="skills" title="Capabilities" intro="An operational view of the stack: what each capability enables, followed by the tools I have used to practice it."><div className="capability-stack">{skillGroups.map((group, index) => <article className="capability-row" key={group.label}><div className="capability-index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div><div className="capability-name"><h3>{group.label}</h3><span className="capability-signal" aria-hidden="true"><i /></span></div><p className="capability-note">{capabilityNotes[index]}</p><p className="capability-tools">{group.items.join(" · ")}</p></article>)}</div></Section>;
}

function Credentials() {
  return <section className="section" aria-labelledby="credentials-title"><div className="section-heading"><h2 id="credentials-title">Education &amp; credentials</h2><p>Formal study and compact credibility signals, with current study stated separately.</p></div><div className="credential-layout"><article className="education"><p className="section-label">Education</p><h3>{education.degree}</h3><p>{education.school} · {education.location}</p><time>{education.period}</time><p>Thesis: {education.thesis}</p></article><div className="credentials"><p className="section-label">Earned</p><ul>{certifications.map((item) => <li key={item}>{item}</li>)}</ul><p className="section-label studying">Currently studying</p><p>HashiCorp Certified: Terraform Associate (004)</p></div></div></section>;
}

function Resume() {
  return <Section id="resume" title="Résumé" intro="A concise on-page summary, with the PDF one action away."><div className="resume-panel"><div><p className="section-label">Jerome Christian V. Ibon</p><h3>Cloud Support · DevOps · Cloud Engineering</h3><p>{professionalSummary}</p></div><div className="resume-actions"><a className="button primary" href="./resume.pdf">Download PDF <DownloadIcon /></a><button className="button secondary" type="button" onClick={() => print()}>Print summary <PrintIcon /></button></div></div></Section>;
}

function Contact() {
  return <Section id="contact" title="Contact" intro="I’m open to entry-level Cloud Support, DevOps, Cloud Engineering, Platform, and Infrastructure opportunities."><div className="contact-layout"><p className="contact-statement">If the work here is relevant to your team, email is the simplest way to start a conversation.</p><div className="contact-links"><ContactLink label="Email" value="jeysibn@gmail.com" href="mailto:jeysibn@gmail.com" /><ContactLink label="LinkedIn" value="jeromeibon" href="https://www.linkedin.com/in/jeromeibon" external /><ContactLink label="GitHub" value="Jeysibn" href="https://github.com/Jeysibn" external /></div></div></Section>;
}
function ContactLink({ label, value, href, external = false }: { label: string; value: string; href: string; external?: boolean }) { return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}><span>{label}</span><strong>{value}</strong>{external ? <ExternalIcon /> : <ArrowIcon />}</a>; }

type TraceKey = "request" | "persist" | "deliver" | "observe";
const traces: Record<TraceKey, [string, string, string]> = {
  request: ["Request", "Browser → Functions", "The static React frontend calls three anonymous HTTPS routes: health, visitor count, and the portfolio assistant."],
  persist: ["Persist", "Functions → Cosmos DB", "Cosmos DB stores the counter, hashed visitor identifiers, and temporary assistant rate-limit records with TTL cleanup."],
  deliver: ["Deliver", "GitHub → Pages and Azure", "Path-specific workflows publish the frontend separately and deploy the backend with short-lived Azure OIDC authentication."],
  observe: ["Observe", "Functions → Application Insights", "Request, latency, failure, exception, and structured event telemetry flows into Application Insights and Log Analytics."],
};

function CaseStudy({ project }: { project: Project }) {
  const { preference, setPreference } = useTheme(); const cloud = project.id === "cloud-portfolio";
  useCaseStudyMotion();
  useEffect(() => { document.title = `${project.title} | Jerome Ibon`; }, [project.title]);
  return <><a className="skip-link" href="#case-content">Skip to case study</a><header className="case-header"><a className="wordmark" href="./index.html" aria-label="Jerome Ibon, home">JI<span aria-hidden="true">/</span></a><a href="./index.html#projects">Back to selected work</a><ThemeControl value={preference} onChange={setPreference} /></header><main id="case-content" className="case-main"><header className="case-masthead"><p className="project-category">{project.category} · Personal project</p><h1>{project.title}</h1><p>{project.summary}</p><div className="action-row"><a className="button primary" href={project.repositoryUrl} target="_blank" rel="noreferrer">View repository <ExternalIcon /></a><a className="button secondary" href="./index.html#contact">Contact Jerome</a></div></header>{cloud ? <SystemTrace /> : <figure className="case-artifact"><a href={homelabDiagramUrl} target="_blank" rel="noreferrer" aria-label="Open the homelab architecture diagram at full size"><img src={homelabDiagramUrl} alt="Architecture of the current single-node K3s homelab, including GitHub Actions validation, Argo CD, networking, storage, DNS, and observability." width="2048" height="1152" loading="lazy" /></a><figcaption>Repository architecture artifact. K3s is single-node and the Raspberry Pi provides remote access through Tailscale. The diagram’s Calico placement is stale: current implementation documents Calico as bootstrap-owned before Argo CD.</figcaption></figure>}<div className="case-layout"><nav className="case-index" aria-label="Case study contents">{["context", "architecture", "delivery", "operations", "tradeoffs"].map((id) => <a key={id} href={`#${id}`}>{id[0].toUpperCase() + id.slice(1)}</a>)}</nav><article className="case-article">{cloud ? <CloudStory /> : <HomelabStory />}</article></div></main><Footer /></>;
}

function SystemTrace() {
  const [active, setActive] = useState<TraceKey>("request");
  useTraceMotion(active);
  const mobileNodes = active === "deliver" ? ["GitHub", "Actions + OIDC", "Pages + Azure"] : active === "persist" ? ["Browser", "Azure Functions", "Cosmos DB"] : active === "observe" ? ["Azure Functions", "Telemetry", "App Insights"] : ["Browser", "Azure Functions", "API response"];
  return <figure className={`system-trace trace-${active}`}><figcaption>Explore one real path through the live portfolio system.</figcaption><div className="trace-controls" aria-label="Architecture paths">{(Object.keys(traces) as TraceKey[]).map((key) => <button type="button" key={key} aria-pressed={active === key} onClick={() => setActive(key)}>{traces[key][0]}</button>)}</div><svg className="trace-diagram" viewBox="0 0 1000 430" role="img" aria-labelledby="trace-title trace-desc"><title id="trace-title">Cloud-backed portfolio architecture</title><desc id="trace-desc">GitHub Actions deploys React to GitHub Pages and Python APIs to Azure Functions. The browser calls Functions, which connects to Cosmos DB, an AI provider, and Application Insights.</desc><Node x={40} y={170} a="Browser" b="React + Vite" /><Node x={270} y={40} a="GitHub" b="Actions + OIDC" /><Node x={270} y={300} a="GitHub Pages" b="Static frontend" /><Node x={525} y={170} a="Azure Functions" b="Python v2 APIs" wide /><Node x={785} y={45} a="Cosmos DB" b="TTL records" /><Node x={785} y={178} a="AI provider" b="Server-side only" /><Node x={785} y={311} a="App Insights" b="Log Analytics" /><path className="path deliver" d="M355 124V300M440 82H612V170M440 82H485V342H440" /><path className="path request" d="M190 212H525M700 218H785" /><path className="path persist" d="M700 194C748 194 744 82 785 82" /><path className="path observe" d="M700 236C748 236 744 348 785 348" /></svg><div className="trace-mobile-map" aria-hidden="true"><span>{mobileNodes[0]}</span><i>→</i><span>{mobileNodes[1]}</span><i>→</i><span>{mobileNodes[2]}</span></div><a className="diagram-link" href={cloudDiagramUrl} target="_blank" rel="noreferrer">Open full system map <ExternalIcon /></a><div className="trace-note" aria-live="polite"><p>{traces[active][0]} path</p><h2>{traces[active][1]}</h2><p>{traces[active][2]}</p></div></figure>;
}
function Node({ x, y, a, b, wide = false }: { x: number; y: number; a: string; b: string; wide?: boolean }) { const width = wide ? 175 : 170; return <g className="trace-node"><rect x={x} y={y} width={width} height="84"/><text x={x + width / 2} y={y + 34}>{a}</text><text x={x + width / 2} y={y + 60}>{b}</text></g>; }
function Story({ id, title, children }: { id: string; title: string; children: ReactNode }) { return <section id={id}><h2>{title}</h2>{children}</section>; }

function CloudStory() { return <><Story id="context" title="A portfolio treated as a service"><p>The goal was to move beyond static hosting and use a small personal site to practice the lifecycle of a cloud service: provision it, deliver it, observe it, and verify it after deployment.</p><p>The public frontend must stay inexpensive and fast, while visitor and assistant features require server-side state and secrets.</p></Story><Story id="architecture" title="Static at the edge, dynamic behind an API"><p>Vite builds React and TypeScript for GitHub Pages. Anonymous HTTPS calls reach a Python Azure Functions app with separate health, visitor-count, and assistant routes. Cosmos DB persists visitor data and rate-limit state; the AI credential remains server-side.</p><p>The health route deliberately checks worker liveness only. It does not claim that Cosmos DB or the AI provider is healthy.</p></Story><Story id="delivery" title="Delivery follows the changed layer"><p>Frontend, backend, and Terraform workflows deploy independently by path. Pull requests typecheck and build the frontend, run backend tests and dependency checks, and create an authenticated Terraform plan. Production Azure workflows use GitHub-issued OIDC tokens instead of a reusable client secret.</p><p>Backend delivery follows package deployment with health and visitor API checks because successful upload does not prove runtime readiness.</p></Story><Story id="operations" title="Failures should leave evidence"><p>Application Insights and Log Analytics collect request, latency, failure, exception, and structured application events. Correlation identifiers support investigation without intentionally logging raw IP addresses, prompts, responses, secrets, or connection strings.</p><p>The visitor route hashes client IPs before persistence. Temporary visitor and chat rate-limit records use TTL cleanup.</p></Story><Story id="tradeoffs" title="Small system, explicit boundaries"><p>GitHub Pages keeps static delivery simple, while Azure Functions avoids an idle application server. This split creates a CORS boundary and two release paths, so configuration and post-deployment verification matter.</p><p>The project is a personal learning system; it does not claim enterprise traffic, uptime, or measured business impact.</p></Story></>; }

function HomelabStory() { return <><Story id="context" title="A reproducible place to practice operations"><p>This active personal homelab uses a repurposed laptop running Proxmox VE. The current Kubernetes environment is one K3s server node. A Raspberry Pi 4B provides remote access through Tailscale; it is not currently a Kubernetes node.</p><p>An earlier experiment used an Ubuntu Server laptop and Raspberry Pi as two K3s nodes. That mixed-architecture setup exposed image and workload compatibility constraints.</p></Story><Story id="architecture" title="Bootstrap first, reconciliation second"><p>Terraform provisions the virtual machine. Bootstrap scripts configure networking, install K3s and Calico, verify cluster networking, and only then install Argo CD. Calico is bootstrap-owned because Argo CD cannot operate until a working CNI exists.</p><p>Argo CD uses App-of-Apps and ordered sync waves for storage, ingress, DNS, observability, and workloads.</p></Story><Story id="delivery" title="Changes are checked before reconciliation"><p>GitHub Actions validates shell scripts and YAML, renders Helm templates, and checks Kubernetes schemas. After merge, Argo CD detects the desired-state change and reconciles from main.</p></Story><Story id="operations" title="A DNS failure became an acceptance test"><p>During a September 2026 bootstrap, pod routing and TCP ClusterIP traffic worked while UDP DNS through CoreDNS failed. Investigation traced it to a broad Calico UDP NOTRACK rule interacting with kube-proxy iptables service NAT.</p><p>For the single-node topology, disabling overlay encapsulation removed the rule. Bootstrap now requires an acceptance test covering pod routing, service traffic, internal DNS, and external DNS before Argo CD installation.</p></Story><Story id="tradeoffs" title="Single-node means honest limits"><p>Longhorn and GitOps improve repeatability and operational practice, but a single-node cluster does not provide workload or storage high availability. Future multi-node work must re-evaluate encapsulation instead of copying the single-node Calico setting.</p><p>The repository documents a rebuild path, recovery utilities, service ownership, and troubleshooting evidence. These demonstrate operating habits rather than a production availability claim.</p></Story></>; }

type ChatUiMessage = ChatMessage & { error?: boolean };
function loadChat(): ChatUiMessage[] { try { const value = JSON.parse(sessionStorage.getItem(CHAT_STORAGE_KEY) || "[]"); return Array.isArray(value) ? value.slice(-20) : []; } catch { return []; } }
function ChatWidget() {
  const [open, setOpen] = useState(false), [closing, setClosing] = useState(false), [messages, setMessages] = useState<ChatUiMessage[]>(loadChat), [input, setInput] = useState(""), [sending, setSending] = useState(false); const trigger = useRef<HTMLButtonElement>(null), field = useRef<HTMLInputElement>(null), closeTimer = useRef<number>(0); const id = useId();
  const close = () => { if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); return; } setClosing(true); closeTimer.current = window.setTimeout(() => { setOpen(false); setClosing(false); trigger.current?.focus(); }, 160); };
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  useEffect(() => { if (!open) return; if (matchMedia("(min-width: 681px)").matches) field.current?.focus(); const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); }; addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey); }, [open]);
  async function submit(event: FormEvent) { event.preventDefault(); const content = input.trim(); if (!content || sending) return; const history = messages.filter((m) => !m.error).map(({ role, content }) => ({ role, content })); const user: ChatMessage = { role: "user", content }; setMessages((v) => [...v, user]); setInput(""); setSending(true); try { const reply = await sendChatMessage(content, history); const next = [...history, user, { role: "assistant" as const, content: reply }].slice(-20); setMessages(next); sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next)); } catch { setMessages((v) => [...v, { role: "assistant", content: "The assistant is unavailable right now. Please try again shortly.", error: true }]); } finally { setSending(false); } }
  return <aside className="chat-widget" aria-label="Portfolio assistant">{open && <div id={id} className={`chat-panel${closing ? " is-closing" : ""}`}><header><div><strong>Ask about my work</strong><span>Portfolio-specific assistant</span></div><button type="button" className="icon-button" onClick={close} aria-label="Close assistant"><CloseIcon /></button></header><div className="chat-messages" role="log" aria-live="polite">{!messages.length && <p>Ask about my experience, projects, skills, or how this site is engineered.</p>}{messages.map((m, i) => <p key={`${i}-${m.content.slice(0, 12)}`} className={`message ${m.role}${m.error ? " error" : ""}`}>{m.content}</p>)}{sending && <p className="message assistant">Thinking…</p>}</div><form onSubmit={submit}><label htmlFor="chat-input">Your question</label><div><input ref={field} id="chat-input" name="question" value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} autoComplete="off" spellCheck={false} /><button type="submit" aria-label="Send question" disabled={sending}><SendIcon /></button></div></form></div>}<button ref={trigger} type="button" className="chat-trigger" aria-expanded={open && !closing} aria-controls={id} onClick={() => open ? close() : (setClosing(false), setOpen(true))}><ChatIcon /><span>{open && !closing ? "Close assistant" : "Ask about my work"}</span></button></aside>;
}

function Footer() { const [count, setCount] = useState("Checking"); useEffect(() => { const c = new AbortController(); fetchVisitorCount(c.signal).then((v) => setCount(v.toLocaleString())).catch(() => setCount("Unavailable")); return () => c.abort(); }, []); return <footer><div><p><strong>Jerome Ibon</strong><span>Cloud &amp; DevOps engineering portfolio</span></p><p aria-live="polite"><span>Visitors</span><strong>{count}</strong></p></div></footer>; }
function PrintResume() { return <article className="print-resume"><h1>Jerome Christian V. Ibon</h1><p>Cloud Support | DevOps | Cloud Engineering</p><p>Malolos, Bulacan, Philippines | jeysibn@gmail.com | linkedin.com/in/jeromeibon | github.com/Jeysibn</p><h2>Professional summary</h2><p>{professionalSummary}</p><h2>Experience</h2>{experience.map((item) => <section key={item.role}><h3>{item.role} — {item.organization}</h3><p>{item.period} | {item.location}</p><ul>{item.highlights.map((point) => <li key={point}>{point}</li>)}</ul></section>)}<h2>Projects</h2>{projects.map((project) => <section key={project.id}><h3>{project.title}</h3><p>{project.summary}</p></section>)}<h2>Education &amp; credentials</h2><p>{education.degree}, {education.school}, {education.period}</p><ul>{certifications.map((item) => <li key={item}>{item}</li>)}</ul></article>; }
function Icon({ children }: { children: ReactNode }) { return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>; }
function ExternalIcon() { return <Icon><path d="M14 5h5v5M11 13l8-8M19 13v6H5V5h6" /></Icon>; } function ArrowIcon() { return <Icon><path d="M5 12h14M14 7l5 5-5 5" /></Icon>; } function DownloadIcon() { return <Icon><path d="M12 3v12M7 10l5 5 5-5M5 20h14" /></Icon>; } function PrintIcon() { return <Icon><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z" /></Icon>; } function MenuIcon() { return <Icon><path d="M4 7h16M4 12h16M4 17h16" /></Icon>; } function CloseIcon() { return <Icon><path d="M6 6l12 12M18 6 6 18" /></Icon>; } function SunIcon() { return <Icon><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2"/></Icon>; } function MoonIcon() { return <Icon><path d="M20 15.5A8 8 0 0 1 8.5 4 8 8 0 1 0 20 15.5z"/></Icon>; } function ChatIcon() { return <Icon><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></Icon>; } function SendIcon() { return <Icon><path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/></Icon>; }
export default App;
