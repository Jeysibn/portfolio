
import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { fetchVisitorCount, sendChatMessage } from "./api";
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
import type { ChatMessage, Project, SkillGroup, ThemePreference } from "./portfolio";
import { skillDetails } from "./skill-details";

const sectionIds = navigation.map((item) => item.id);
const CHAT_STORAGE_KEY = "jeysibn_chat_history";

const certificationDetails = [
  {
    name: certifications[0],
    provider: "Oracle",
    mark: "ORACLE",
    tone: "oracle",
    description:
      "Foundational validation of OCI services, cloud concepts, architecture, security, pricing, and support fundamentals.",
  },
  {
    name: certifications[1],
    provider: "TrendAI",
    mark: "TrendAI",
    tone: "trend",
    description:
      "Professional credential focused on protecting and operating server and workload environments with Trend Vision One.",
  },
  {
    name: certifications[2],
    provider: "GitHub",
    mark: "GitHub",
    tone: "github",
    description:
      "Covers Git and GitHub fundamentals, repositories, collaboration workflows, project management, and modern development practices.",
  },
  {
    name: "HashiCorp Certified: Terraform Associate (004)",
    provider: "IN PROGRESS",
    mark: "HashiCorp",
    tone: "hashicorp",
    description:
      "Currently studying for Terraform Associate (004), building on hands-on Terraform use across Azure infrastructure and Proxmox homelab provisioning.",
  },
] as const;

const skillCodes = ["CLOUD", "K8S", "CI/CD", "OBS", "NET", "OPS"] as const;

function useScrollReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);
}

function ScrollProgress() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };

    const requestUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div className="scroll-progress-track" aria-hidden="true">
      <div ref={progressRef} className="scroll-progress-bar" />
    </div>
  );
}

function App() {
  const activeSection = useActiveSection(sectionIds);
  const { preference, setPreference } = useTheme();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillGroup | null>(null);

  useScrollReveal();

  return (
    <>
      <div className="site-shell">
        <ScrollProgress />
        <Header
          activeSection={activeSection}
          themePreference={preference}
          onThemeChange={setPreference}
        />

        <main id="top">
          <Hero />
          <About />
          <Projects onOpenProject={setSelectedProject} />
          <Experience />
          <Skills onOpenSkill={setSelectedSkill} />
          <Credentials />
          <Resume />
          <Contact />
        </main>

        <Footer />
        <ChatWidget />
        <ProjectDialog project={selectedProject} onClose={() => setSelectedProject(null)} />
        <SkillDialog group={selectedSkill} onClose={() => setSelectedSkill(null)} />
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
  const [open, setOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const options: Array<{ value: ThemePreference; label: string }> = [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];
  const currentLabel = options.find((option) => option.value === value)?.label ?? "System";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !controlRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectTheme = (preference: ThemePreference) => {
    onChange(preference);
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  };

  return (
    <div ref={controlRef} className={open ? "theme-control theme-control-open" : "theme-control"}>
      <button
        ref={triggerRef}
        type="button"
        className="theme-trigger"
        aria-label={`Color theme: ${currentLabel}`}
        aria-expanded={open}
        aria-controls="theme-options"
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <SunMoonIcon />
        <span className="theme-trigger-label">{currentLabel}</span>
        <ThemeChevronIcon />
      </button>

      {open ? (
        <div id="theme-options" className="theme-options" role="group" aria-label="Choose color theme">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="theme-option"
              aria-pressed={value === option.value}
              onClick={() => selectTheme(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Hero() {
  return (
    <section className="hero-section hero-section-b" aria-labelledby="hero-title">
      <div className="hero-grid hero-grid-b">
        <div className="hero-copy hero-copy-b">
          <p className="hero-eyebrow-b">Portfolio — {new Date().getFullYear()}</p>
          <h1 id="hero-title" className="hero-title-b">
            Jerome
            <br />
            Christian
            <br />
            Ibon
          </h1>
          <p className="hero-role-b">Cloud Support · DevOps · Cloud Engineering</p>
          <p className="hero-opportunity">
            Computer Engineering graduate building cloud infrastructure, automated delivery pipelines, Kubernetes environments, and observable systems.
          </p>
          <div className="availability-pill availability-pill-b">
            <span className="availability-dot" aria-hidden="true" />
            <span>Open to opportunities</span>
            <span className="availability-detail">Entry-level Cloud &amp; DevOps roles</span>
          </div>
          <div className="hero-actions hero-actions-b">
            <a href="#contact" className="button button-primary">
              Contact me
            </a>
            <a href="https://github.com/Jeysibn" target="_blank" rel="noreferrer" className="button button-text">
              GitHub <ExternalIcon />
            </a>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <svg
      className="hero-illo-b"
      viewBox="0 0 240 260"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Line illustration of a cloud connected to two server nodes"
    >
      <path d="M60 210 C 60 150, 40 140, 55 90 C 65 55, 100 40, 120 60" />
      <circle cx="120" cy="60" r="16" />
      <path d="M60 210 L 60 236 M 100 214 L 100 240 M 40 214 L 30 236" />
      <path d="M20 168 h30 M18 180 h34" />
      <rect x="130" y="120" width="34" height="30" rx="2" />
      <rect x="176" y="150" width="34" height="30" rx="2" className="hero-illo-accent" />
      <rect x="130" y="180" width="34" height="30" rx="2" />
      <path d="M147 120 L 147 100 L 120 76" />
      <path d="M164 135 L 200 135 L 200 150" className="hero-illo-accent" />
    </svg>
  );
}

function ProjectIllustration({ id, className }: { id: string; className?: string }) {
  const classes = className ? `project-illo ${className}` : "project-illo";

  if (id === "homelab-gitops") {
    return (
      <svg
        className={classes}
        viewBox="0 0 240 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label="Line illustration of a git repository syncing to a small cluster of server nodes"
      >
        <rect x="16" y="70" width="52" height="40" rx="3" />
        <circle cx="42" cy="90" r="7" />
        <path d="M42 83 V 66 M 42 97 V 110" />
        <path d="M68 84 H 108" />
        <path d="M68 96 H 108" className="project-illo-accent" />
        <path d="M100 80 L 108 84 L 100 88 M 100 92 L 108 96 L 100 100" />
        <rect x="112" y="30" width="48" height="34" rx="3" />
        <rect x="112" y="72" width="48" height="34" rx="3" className="project-illo-accent" />
        <rect x="112" y="114" width="48" height="34" rx="3" />
        <path d="M108 47 H 112 M 108 89 H 112 M 108 131 H 112" />
        <path d="M160 47 H 200 M 160 89 H 200 M 160 131 H 200" />
        <path d="M200 30 V 148" />
      </svg>
    );
  }

  return (
    <svg
      className={classes}
      viewBox="0 0 220 180"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Line illustration of a browser connecting through an API to a database"
    >
      <rect x="14" y="24" width="72" height="48" rx="3" />
      <path d="M14 36 H 86" />
      <circle cx="24" cy="30" r="2" />
      <circle cx="32" cy="30" r="2" />
      <path d="M86 48 L 122 48" className="project-illo-accent" />
      <rect x="126" y="24" width="70" height="48" rx="3" className="project-illo-accent" />
      <path d="M50 72 L 50 100 L 122 100" />
      <rect x="94" y="104" width="52" height="46" rx="26" />
      <path d="M94 118 H 146 M 94 132 H 146" />
      <path d="M161 72 L 161 100 L 146 100" />
    </svg>
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
    <Section id="about" title="About">
      <div className="about-layout" data-reveal="">
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
    <Section id="experience" title="Experience">
      <div className="timeline">
        {experience.map((item) => (
          <article key={`${item.organization}-${item.role}`} className="timeline-item" data-reveal="">
            <div className="timeline-row">
              <h3>{item.role}</h3>
              <time>{item.period}</time>
            </div>
            <p className="timeline-meta">
              <span className="timeline-org">{item.organization}</span> · {item.location}
            </p>
            <p className="timeline-summary">{item.summary}</p>
            <ul>
              {item.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Projects({ onOpenProject }: { onOpenProject: (project: Project) => void }) {
  return (
    <Section id="projects" title="Projects">
      <div className="project-list">
        {projects.map((project) => (
          <article
            key={project.id}
            className={`project-row project-${project.id}`}
            data-reveal=""
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-label={`View ${project.title} project details`}
            onClick={() => onOpenProject(project)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" && event.key !== " ") return;
              event.preventDefault();
              onOpenProject(project);
            }}
          >
            <div className="project-visual">
              <ProjectIllustration id={project.id} />
            </div>

            <div className="project-copy">
              <p className="project-category">{project.category}</p>
              <div className="project-title-row">
                <h3>{project.title}</h3>
              </div>
              <p>{project.summary}</p>
              <div className="technology-line" aria-label="Project technologies">
                {project.technologies.slice(0, 5).map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Skills({ onOpenSkill }: { onOpenSkill: (group: SkillGroup) => void }) {
  return (
    <Section
      id="skills"
      title="Skills & Tools"
      intro="These are the technologies I use across cloud projects, labs, troubleshooting, automation, and deployment workflows."
    >
      <div className="skills-grid" aria-label="Technical skill groups">
        {skillGroups.map((group, index) => (
          <button
            key={group.label}
            type="button"
            className="skill-card"
            data-reveal=""
            aria-haspopup="dialog"
            onClick={() => onOpenSkill(group)}
          >
            <span className="skill-card-head">
              <span className="skill-code" aria-hidden="true">{skillCodes[index]}</span>
              <span>
                <span className="skill-card-index">0{index + 1}</span>
                <h3>{group.label}</h3>
              </span>
            </span>
            <span className="skill-chip-list">
              {group.items.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </Section>
  );
}

function Credentials() {
  return (
    <section className="credentials-section" aria-labelledby="credentials-title">
      <div className="section-inner credentials-layout">
        <div data-reveal="">
          <h2 id="credentials-title">Education &amp; Certifications</h2>
        </div>

        <div className="credentials-content">
          <article className="education-block" data-reveal="">
            <p className="detail-label">Education</p>
            <div className="education-heading">
              <span className="education-mark" aria-hidden="true">NU</span>
              <div>
                <h3>{education.degree}</h3>
                <p>{education.school} · {education.location}</p>
              </div>
            </div>
            <p className="education-period">{education.period}</p>
            <p className="thesis">Thesis: {education.thesis}</p>
          </article>

          <section className="certification-block" aria-labelledby="certifications-heading">
            <div className="credential-subheading" data-reveal="">
              <p className="detail-label">Certifications</p>
            </div>
            <div className="certification-grid">
              {certificationDetails.map((certification) => (
                <article
                  key={certification.name}
                  className={`cert-card cert-card-${certification.tone}`}
                  tabIndex={0}
                  data-reveal=""
                >
                  <div className="cert-card-topline">
                    <span className="cert-provider-mark" aria-hidden="true">{certification.mark}</span>
                    <span className="cert-provider">{certification.provider}</span>
                  </div>
                  <h3 id={certification.name === certifications[0] ? "certifications-heading" : undefined}>{certification.name}</h3>
                  <p className="cert-description">{certification.description}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function Resume() {
  return (
    <Section
      id="resume"
      title="Resume"
      intro="Everything important is visible here. Download the PDF directly, or review the on-page resume details below."
    >
      <article className="resume-preview" data-reveal="">
        <header className="resume-preview-header">
          <div>
            <p className="detail-label">Resume / CV</p>
            <h3>Jerome Christian V. Ibon</h3>
            <p>Cloud Support · DevOps · Cloud Engineering · Kubernetes · GitOps · Infrastructure Automation</p>
            <p className="resume-contact-line">Malolos, Bulacan, Philippines · jeysibn@gmail.com · linkedin.com/in/jeromeibon</p>
          </div>
          <div className="resume-actions">
            <a className="button button-primary" href="./resume.pdf" download="Jerome-Ibon-Resume.pdf">
              Download resume (PDF) <DownloadIcon />
            </a>
            <button type="button" className="button button-secondary" onClick={() => window.print()}>
              Print / save resume <PrintIcon />
            </button>
          </div>
        </header>

        <div className="resume-summary">
          <h3>Professional summary</h3>
          <p>{professionalSummary}</p>
        </div>

        <details className="resume-details">
          <summary>View full resume <span className="resume-disclosure-icon" aria-hidden="true" /></summary>
          <div className="resume-preview-grid">
          <div className="resume-main-column">
            <ResumePreviewSection title="Professional experience">
              {experience.map((item) => (
                <article key={`${item.organization}-resume`} className="resume-entry">
                  <div className="resume-entry-heading">
                    <div>
                      <h4>{item.role}</h4>
                      <p>{item.organization} · {item.location}</p>
                    </div>
                    <time>{item.period}</time>
                  </div>
                  <p>{item.summary}</p>
                  <ul>
                    {item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
                </article>
              ))}
            </ResumePreviewSection>

            <ResumePreviewSection title="Projects / home lab">
              {projects.map((project) => (
                <article key={`${project.id}-resume`} className="resume-entry">
                  <div className="resume-entry-heading">
                    <div>
                      <h4>{project.title}</h4>
                      <p>{project.category}</p>
                    </div>
                  </div>
                  <ul>
                    {project.highlights.slice(0, 3).map((highlight) => <li key={highlight}>{highlight}</li>)}
                  </ul>
                </article>
              ))}
            </ResumePreviewSection>
          </div>

          <aside className="resume-side-column">
            <ResumePreviewSection title="Technical skills">
              <div className="resume-skill-groups">
                {skillGroups.map((group) => (
                  <div key={`${group.label}-resume`}>
                    <h4>{group.label}</h4>
                    <p>{group.items.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </ResumePreviewSection>

            <ResumePreviewSection title="Education">
              <div className="resume-entry compact">
                <h4>{education.degree}</h4>
                <p>{education.school} · {education.location}</p>
                <p>{education.period}</p>
                <p>Thesis: {education.thesis}</p>
              </div>
            </ResumePreviewSection>

            <ResumePreviewSection title="Certifications">
              <ul className="resume-cert-list">
                {certifications.map((certification) => <li key={`${certification}-resume`}>{certification}</li>)}
              </ul>
            </ResumePreviewSection>
          </aside>
          </div>
        </details>
      </article>
    </Section>
  );
}

function ResumePreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="resume-preview-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Contact() {
  return (
    <Section id="contact" title="Contact">
      <div className="contact-panel" data-reveal="">
        <div className="contact-intro">
          <div className="contact-availability">
            <span className="availability-dot" aria-hidden="true" />
            <span>Open to opportunities</span>
          </div>
          <h3>I’m open to professional opportunities, collaborations, and meaningful conversations.</h3>
          <p>
            I’m interested in entry-level Cloud Support, DevOps, and Cloud Engineering roles where I can keep building production judgment alongside strong engineering teams.
          </p>
          <div className="role-tags" aria-label="Roles of interest">
            <span>Cloud Support</span>
            <span>DevOps</span>
            <span>Cloud Engineering</span>
          </div>
        </div>

        <div className="contact-actions" aria-label="Contact links">
          <a className="contact-action contact-action-primary" href="mailto:jeysibn@gmail.com">
            <span>
              <small>Best way to reach me</small>
              <strong>jeysibn@gmail.com</strong>
            </span>
            <ExternalIcon />
          </a>
          <a className="contact-action" href="https://linkedin.com/in/jeromeibon" target="_blank" rel="noreferrer">
            <span>
              <small>Professional profile</small>
              <strong>LinkedIn</strong>
            </span>
            <ExternalIcon />
          </a>
          <a className="contact-action" href="https://github.com/Jeysibn" target="_blank" rel="noreferrer">
            <span>
              <small>Code & infrastructure</small>
              <strong>GitHub</strong>
            </span>
            <ExternalIcon />
          </a>
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
        <div className="section-heading" data-reveal="">
          <h2 id={`${id}-title`}>{title}</h2>
          {intro ? <p className="section-intro">{intro}</p> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function ProjectDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
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

          <div className="case-architecture" aria-hidden="true">
            <ProjectIllustration id={project.id} className="case-architecture-illo" />
          </div>

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

function SkillDialog({ group, onClose }: { group: SkillGroup | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (group && !dialog.open) dialog.showModal();
    if (!group && dialog.open) dialog.close();
  }, [group]);

  const detail = group ? skillDetails[group.label] : null;

  return (
    <dialog
      ref={dialogRef}
      className="skill-detail-dialog"
      aria-labelledby="skill-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {group && detail ? (
        <article className="skill-detail-panel">
          <button type="button" className="inspection-close" aria-label="Close skill details" onClick={onClose} autoFocus>
            <CloseIcon />
          </button>
          <h2 id="skill-dialog-title">{group.label}</h2>
          <p className="skill-detail-summary">{detail.summary}</p>
          <p className="skill-detail-practice">{detail.practice}</p>
          <div className="skill-detail-list">
            {group.items.map((item) => (
              <div key={`${group.label}-${item}`}>
                <h3>{item}</h3>
                <p>{detail.itemDescriptions[item] || "Used as part of my cloud, DevOps, support, and infrastructure workflows."}</p>
              </div>
            ))}
          </div>
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
        <p>Cloud Support · DevOps · Cloud Engineering · Kubernetes · GitOps · Infrastructure Automation</p>
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

function ThemeChevronIcon() {
  return <Icon size={14}><path d="m7 9 5 5 5-5" /></Icon>;
}

function PrintIcon() {
  return <Icon><path d="M6 9V3h12v6" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v7H6z" /></Icon>;
}

function DownloadIcon() {
  return <Icon><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></Icon>;
}

function ChatIcon() {
  return <Icon><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /><path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" /></Icon>;
}

function SendIcon() {
  return <Icon><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></Icon>;
}

export default App;
