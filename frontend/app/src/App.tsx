import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { fetchHealth, fetchVisitorCount, sendChatMessage } from "./api";
import { useActiveSection, useTheme } from "./hooks";
import {
  certifications,
  education,
  experience,
  navigation,
  professionalSummary,
  projects,
  skillGroups,
} from "./portfolio";
import type { ChatMessage, Project, ThemePreference } from "./portfolio";

const sectionIds = navigation.map((item) => item.id);
const CHAT_STORAGE_KEY = "jeysibn_chat_history";

function App() {
  const activeSection = useActiveSection(sectionIds);
  const { preference, setPreference } = useTheme();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <div className="site-shell">
        <Header
          activeSection={activeSection}
          themePreference={preference}
          onThemeChange={setPreference}
        />

        <main id="top">
          <Hero />
          <About />
          <Experience />
          <Projects onOpenProject={setSelectedProject} />
          <Skills />
          <Credentials />
          <Resume />
          <Contact />
        </main>

        <Footer />
        <ChatWidget />
        <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />
      </div>

      <PrintResume />
    </>
  );
}

function Header({
  activeSection,
  themePreference,
  onThemeChange,
}: {
  activeSection: string;
  themePreference: ThemePreference;
  onThemeChange: (preference: ThemePreference) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#top" className="wordmark" aria-label="Jeysibn home" onClick={() => setMenuOpen(false)}>
          Jeysibn<span aria-hidden="true">/</span>
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? "nav-link nav-link-active" : "nav-link"}
              aria-current={activeSection === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeSelect value={themePreference} onChange={onThemeChange} />
          <button
            type="button"
            className="icon-button mobile-menu-button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <div id="mobile-navigation" className={menuOpen ? "mobile-nav mobile-nav-open" : "mobile-nav"}>
        <nav aria-label="Mobile navigation">
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={activeSection === item.id ? "mobile-nav-link mobile-nav-link-active" : "mobile-nav-link"}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function ThemeSelect({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (preference: ThemePreference) => void;
}) {
  return (
    <label className="theme-control">
      <SunMoonIcon />
      <span className="sr-only">Color theme</span>
      <select
        value={value}
        aria-label="Color theme"
        onChange={(event) => onChange(event.target.value as ThemePreference)}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}

function Hero() {
  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 id="hero-title">I build cloud systems that are easier to ship, observe, and recover.</h1>
          <p className="hero-intro">
            I’m Jerome, a Computer Engineering graduate focused on Cloud, DevOps, and reliability engineering. I turn infrastructure, delivery, and operations into version-controlled systems instead of manual checklists.
          </p>
          <div className="hero-actions">
            <a href="#projects" className="button button-primary">
              Explore engineering work <ArrowDownIcon />
            </a>
            <a href="https://github.com/Jeysibn" target="_blank" rel="noreferrer" className="button button-secondary">
              GitHub <ExternalIcon />
            </a>
          </div>
        </div>

        <SystemStatus />
      </div>
    </section>
  );
}

function SystemStatus() {
  const [state, setState] = useState<"checking" | "healthy" | "degraded">("checking");
  const [version, setVersion] = useState<string>("—");

  useEffect(() => {
    const controller = new AbortController();

    fetchHealth(controller.signal)
      .then((health) => {
        setState("healthy");
        setVersion(health.version);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("degraded");
      });

    return () => controller.abort();
  }, []);

  const stateLabel = state === "checking" ? "Checking" : state === "healthy" ? "Operational" : "Unavailable";

  return (
    <aside className="status-console hero-status" aria-label="Live portfolio service status">
      <div className="status-console-topline">
        <span>Live service check</span>
        <span className={`service-state service-state-${state}`}>
          <span className="state-dot" aria-hidden="true" /> {stateLabel}
        </span>
      </div>
      <dl className="status-list">
        <StatusRow label="API" value="Azure Functions" />
        <StatusRow label="Health" value={stateLabel} emphasis={state === "healthy"} />
        <StatusRow label="Release" value={version} />
        <StatusRow label="Delivery" value="GitHub Actions" />
        <StatusRow label="Infrastructure" value="Terraform" />
        <StatusRow label="Telemetry" value="Application Insights" />
      </dl>
      <p className="status-note">Health is checked against the production API when this page loads.</p>
    </aside>
  );
}

function StatusRow({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={emphasis ? "status-value-good" : undefined}>{value}</dd>
    </div>
  );
}

function About() {
  const principles = [
    ["Automate the repeatable", "CI/CD and infrastructure as code replace fragile manual steps."],
    ["Observe before guessing", "Health checks, logs, metrics, and traces make behavior measurable."],
    ["Design for recovery", "Small blast radius, reproducible configuration, and clear runbooks reduce incident friction."],
    ["Keep cost visible", "Serverless and free-tier-aware choices keep experimentation sustainable."],
  ] as const;

  return (
    <Section id="about" title="Reliability started for me at the troubleshooting desk.">
      <div className="about-layout">
        <div className="prose-column">
          <p>
            Supporting real users taught me that infrastructure diagrams only matter when the system still makes sense under pressure. Manual fixes may solve one incident, but they don’t scale into reliable operations.
          </p>
          <p>
            That pushed me toward DevOps and cloud engineering: provisioning with Terraform, delivering through GitHub Actions and GitOps, operating Kubernetes, and instrumenting services so failures leave evidence.
          </p>
        </div>

        <div className="principles-list" aria-label="Engineering principles">
          {principles.map(([title, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Experience() {
  return (
    <Section
      id="experience"
      title="Experience shaped around diagnosis, communication, and operational ownership."
      intro="My background combines enterprise technical support with self-directed infrastructure engineering—useful context for building systems that are both operable and understandable."
    >
      <div className="timeline">
        {experience.map((item) => (
          <article key={`${item.organization}-${item.role}`} className="timeline-item">
            <div className="timeline-meta">
              <time>{item.period}</time>
              <span>{item.location}</span>
            </div>
            <div className="timeline-content">
              <h3>{item.role}</h3>
              <p className="timeline-org">{item.organization}</p>
              <p className="timeline-summary">{item.summary}</p>
              <ul>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Projects({ onOpenProject }: { onOpenProject: (project: Project) => void }) {
  return (
    <Section
      id="projects"
      title="Selected systems, explained as engineering decisions."
      intro="The technology list matters less than the operating model: what problem the system solves, how change reaches production, what happens when it fails, and how the cost stays controlled."
    >
      <div className="project-list">
        {projects.map((project, index) => (
          <article key={project.id} className={index % 2 ? "project-row project-row-reverse" : "project-row"}>
            <div className="project-visual" aria-hidden="true">
              <div className="project-diagram">
                <span className="diagram-node">Git</span>
                <span className="diagram-line" />
                <span className="diagram-node diagram-node-accent">Automation</span>
                <span className="diagram-line" />
                <span className="diagram-node">Runtime</span>
              </div>
            </div>

            <div className="project-copy">
              <p className="project-category">{project.category}</p>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <div className="technology-line" aria-label="Project technologies">
                {project.technologies.slice(0, 5).map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
              <button type="button" className="text-action" onClick={() => onOpenProject(project)} aria-haspopup="dialog">
                Read the case study <ArrowRightIcon />
              </button>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Skills() {
  return (
    <Section
      id="skills"
      title="A toolkit built around delivery and operations, not badge collecting."
      intro="These are the technologies I use across cloud projects, labs, troubleshooting, automation, and deployment workflows."
    >
      <dl className="skills-table">
        {skillGroups.map((group) => (
          <div key={group.label} className="skill-row">
            <dt>{group.label}</dt>
            <dd>
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

function Credentials() {
  return (
    <section className="credentials-section" aria-labelledby="credentials-title">
      <div className="section-inner credentials-layout">
        <div>
          <h2 id="credentials-title">Education & credentials</h2>
          <p className="section-intro">Formal foundations paired with continuous hands-on infrastructure work.</p>
        </div>

        <div className="credentials-content">
          <article className="education-block">
            <p className="detail-label">Education</p>
            <h3>{education.degree}</h3>
            <p>{education.school} · {education.location}</p>
            <p>{education.period}</p>
            <p className="thesis">Thesis: {education.thesis}</p>
          </article>

          <article className="certification-block">
            <p className="detail-label">Certifications</p>
            <ul>
              {certifications.map((certification) => (
                <li key={certification}>{certification}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function Resume() {
  return (
    <Section
      id="resume"
      title="The short version: cloud support instincts, DevOps execution."
      intro={professionalSummary}
    >
      <div className="resume-strip">
        <div>
          <h3>Jerome Christian V. Ibon</h3>
          <p>Cloud Support · DevOps · Kubernetes · GitOps · Infrastructure Automation</p>
        </div>
        <button type="button" className="button button-secondary" onClick={() => window.print()}>
          Print / save full resume <PrintIcon />
        </button>
      </div>
    </Section>
  );
}

function Contact() {
  return (
    <Section id="contact" title="If the work is about making systems clearer and more reliable, I’d like to hear about it.">
      <div className="contact-layout">
        <p>
          I’m interested in entry-level Cloud Support, DevOps, and Junior Site Reliability opportunities where I can keep building production judgment alongside strong engineering teams.
        </p>
        <div className="contact-links">
          <a href="mailto:jeysibn@gmail.com">Email <ExternalIcon /></a>
          <a href="https://linkedin.com/in/jeromeibon" target="_blank" rel="noreferrer">LinkedIn <ExternalIcon /></a>
          <a href="https://github.com/Jeysibn" target="_blank" rel="noreferrer">GitHub <ExternalIcon /></a>
        </div>
      </div>
    </Section>
  );
}

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="content-section" aria-labelledby={`${id}-title`}>
      <div className="section-inner">
        <div className="section-heading">
          <h2 id={`${id}-title`}>{title}</h2>
          {intro ? <p className="section-intro">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (project && !dialog.open) {
      dialog.showModal();
    } else if (!project && dialog.open) {
      dialog.close();
    }
  }, [project]);

  return (
    <dialog
      ref={dialogRef}
      className="case-dialog"
      aria-labelledby="case-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {project ? (
        <article className="case-panel">
          <div className="case-header">
            <div>
              <p className="project-category">{project.category}</p>
              <h2 id="case-dialog-title">{project.title}</h2>
              <p>{project.summary}</p>
            </div>
            <button type="button" className="icon-button" aria-label="Close case study" onClick={onClose} autoFocus>
              <CloseIcon />
            </button>
          </div>

          {project.architectureUrl ? (
            <a className="architecture-link" href={project.architectureUrl} target="_blank" rel="noreferrer">
              <img src={project.architectureUrl} alt={project.architectureAlt || `${project.title} architecture`} loading="lazy" />
              <span>Open architecture diagram <ExternalIcon /></span>
            </a>
          ) : null}

          <div className="case-section">
            <h3>Why it exists</h3>
            <p>{project.purpose}</p>
          </div>

          <div className="case-section">
            <h3>Operating outcomes</h3>
            <ul>
              {project.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>

          <div className="case-section">
            <h3>Engineering highlights</h3>
            <ul>
              {project.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>

          <div className="case-section">
            <h3>Technology</h3>
            <div className="technology-cloud">
              {project.technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </div>

          <a className="button button-primary case-repository" href={project.repositoryUrl} target="_blank" rel="noreferrer">
            View repository <ExternalIcon />
          </a>
        </article>
      ) : null}
    </dialog>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <strong>Jeysibn</strong>
          <span>React + TypeScript frontend · Terraform-managed Azure backend</span>
        </div>
        <VisitorCounter />
      </div>
    </footer>
  );
}

function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    fetchVisitorCount(controller.signal)
      .then((value) => setCount(value))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFailed(true);
      });

    return () => controller.abort();
  }, []);

  return (
    <p className="visitor-count" aria-live="polite" title={failed ? "Visitor counter is temporarily unavailable" : undefined}>
      <span>Visitors</span>
      <strong>{failed ? "Unavailable" : count === null ? "Checking…" : count.toLocaleString()}</strong>
    </p>
  );
}

type ChatUiMessage = ChatMessage & { error?: boolean };

function loadChatHistory(): ChatUiMessage[] {
  try {
    const stored = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (message): message is ChatMessage =>
          typeof message === "object" &&
          message !== null &&
          "role" in message &&
          (message.role === "user" || message.role === "assistant") &&
          "content" in message &&
          typeof message.content === "string",
      )
      .slice(-20);
  } catch {
    return [];
  }
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatUiMessage[]>(loadChatHistory);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
    }
  }, [messages, open, sending]);

  useEffect(() => () => requestRef.current?.abort(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;

    const history = messages.filter((item) => !item.error).map(({ role, content }) => ({ role, content }));
    const userMessage: ChatMessage = { role: "user", content: message };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const reply = await sendChatMessage(message, history, controller.signal);
      const assistantMessage: ChatMessage = { role: "assistant", content: reply };
      const persisted = [...history, userMessage, assistantMessage].slice(-20);

      setMessages(persisted);
      window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(persisted));
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const detail = error instanceof Error ? error.message : "The assistant could not be reached.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `I couldn’t complete that request. ${detail} Please try again.`,
          error: true,
        },
      ]);
    } finally {
      setSending(false);
      requestRef.current = null;
    }
  }

  return (
    <div className="chat-widget">
      <div className={open ? "chat-panel chat-panel-open" : "chat-panel"} aria-hidden={!open}>
        <div className="chat-header">
          <div>
            <strong>Portfolio assistant</strong>
            <span>Azure Functions · provider-neutral AI</span>
          </div>
          <button type="button" className="icon-button" aria-label="Close assistant" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div ref={messagesRef} className="chat-messages" role="log" aria-live="polite" aria-label="Assistant conversation">
          <div className="chat-message chat-message-assistant">
            Ask about my experience, projects, technical stack, or how this portfolio is engineered.
          </div>
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
              className={`chat-message chat-message-${message.role}${message.error ? " chat-message-error" : ""}`}
            >
              {message.content}
            </div>
          ))}
          {sending ? <div className="chat-message chat-message-assistant chat-typing">Assistant is thinking<span aria-hidden="true">…</span></div> : null}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <label htmlFor="chat-input" className="sr-only">Ask the portfolio assistant</label>
          <input
            id="chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about a project…"
            maxLength={500}
            disabled={sending}
            autoComplete="off"
          />
          <button type="submit" className="chat-send" disabled={sending || !input.trim()} aria-label="Send message">
            <SendIcon />
          </button>
        </form>
      </div>

      <button
        type="button"
        className="chat-trigger"
        aria-label={open ? "Close portfolio assistant" : "Open portfolio assistant"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <ChatIcon />
        <span>Ask about Jerome</span>
      </button>
    </div>
  );
}

function PrintResume() {
  return (
    <article className="print-resume">
      <header>
        <h1>Jerome Christian V. Ibon</h1>
        <p>Cloud Support & DevOps · Kubernetes · GitOps · Infrastructure Automation</p>
        <p>Malolos, Bulacan, Philippines · jeysibn@gmail.com · +63 991 408 9619</p>
        <p>linkedin.com/in/jeromeibon · github.com/Jeysibn</p>
      </header>

      <PrintSection title="Professional summary">
        <p>{professionalSummary}</p>
      </PrintSection>

      <PrintSection title="Technical skills">
        <dl className="print-skills">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <dt>{group.label}</dt>
              <dd>{group.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </PrintSection>

      <PrintSection title="Professional experience">
        {experience.map((item) => (
          <div key={`${item.organization}-print`} className="print-entry">
            <div className="print-entry-heading">
              <strong>{item.role}</strong>
              <span>{item.period}</span>
            </div>
            <p>{item.organization} · {item.location}</p>
            <ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
          </div>
        ))}
      </PrintSection>

      <PrintSection title="Projects / home lab">
        <div className="print-entry">
          <strong>Production-Style Kubernetes Home Lab</strong>
          <ul>
            {projects[1].highlights.slice(0, 3).map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        </div>
        <div className="print-entry">
          <strong>Cloud-Backed Portfolio</strong>
          <ul>
            {projects[0].highlights.slice(0, 3).map((highlight) => <li key={highlight}>{highlight}</li>)}
          </ul>
        </div>
      </PrintSection>

      <PrintSection title="Education">
        <div className="print-entry">
          <div className="print-entry-heading">
            <strong>{education.degree}</strong>
            <span>{education.period}</span>
          </div>
          <p>{education.school} · {education.location}</p>
          <p>Thesis: {education.thesis}</p>
        </div>
      </PrintSection>

      <PrintSection title="Certifications">
        <ul>{certifications.map((certification) => <li key={certification}>{certification}</li>)}</ul>
      </PrintSection>
    </article>
  );
}

function PrintSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Icon({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

function ArrowRightIcon() {
  return <Icon><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></Icon>;
}

function ArrowDownIcon() {
  return <Icon><path d="M12 5v14" /><path d="m7 14 5 5 5-5" /></Icon>;
}

function ExternalIcon() {
  return <Icon size={16}><path d="M14 5h5v5" /><path d="M10 14 19 5" /><path d="M19 13v6H5V5h6" /></Icon>;
}

function CloseIcon() {
  return <Icon><path d="m6 6 12 12" /><path d="M18 6 6 18" /></Icon>;
}

function MenuIcon() {
  return <Icon><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></Icon>;
}

function SunMoonIcon() {
  return <Icon size={16}><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.42 1.42" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /></Icon>;
}

function PrintIcon() {
  return <Icon><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></Icon>;
}

function ChatIcon() {
  return <Icon><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /><path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" /></Icon>;
}

function SendIcon() {
  return <Icon><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></Icon>;
}

export default App;
