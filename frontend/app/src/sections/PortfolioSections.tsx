import type { ReactNode } from "react";
import { fetchHealth } from "../api";
import { useEffect, useState } from "react";
import {
  certifications,
  education,
  experience,
  professionalSummary,
  projects,
  skillGroups,
} from "../portfolio";
import type { Project } from "../portfolio";
import { CapabilityMap } from "../components/capabilities/CapabilityMap";
import type { SkillSelection } from "../components/capabilities/CapabilityMap";
import { SystemArchitecture } from "../components/systems/SystemArchitecture";

const principles = [
  [
    "Automate the repeatable",
    "CI/CD and infrastructure as code replace fragile manual steps.",
  ],
  [
    "Observe before guessing",
    "Health checks, logs, metrics, and traces make behavior measurable.",
  ],
  [
    "Design for recovery",
    "Small blast radius, reproducible configuration, and clear runbooks reduce incident friction.",
  ],
  [
    "Keep cost visible",
    "Serverless and free-tier-aware choices keep experimentation sustainable.",
  ],
] as const;

function Section({
  id,
  title,
  children,
  className = "",
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const signalStages: Record<string, string> = {
    about: "PROVISION",
    projects: "DEPLOY",
    experience: "RUN",
    skills: "OBSERVE",
    contact: "IMPROVE",
  };
  const signalStage = signalStages[id];
  return (
    <section
      id={id}
      className={`section ${className}`}
      aria-labelledby={`${id}-title`}
      data-signal-stage={signalStage}
    >
      <header className="section-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        <span className="section-rule" aria-hidden="true" />
        {signalStage ? (
          <span className="chapter-signal" aria-hidden="true">
            {signalStage}
          </span>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function SystemStatus() {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    const c = new AbortController();
    fetchHealth(c.signal)
      .then(() => setStatus("online"))
      .catch((e: unknown) => {
        if (!(e instanceof DOMException && e.name === "AbortError"))
          setStatus("unavailable");
      });
    return () => c.abort();
  }, []);
  return (
    <div className="system-status" aria-live="polite">
      <span className={`status-light ${status}`} />
      API {status}
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="hero"
      aria-labelledby="hero-title"
      data-signal-stage="SIGNAL"
    >
      <div className="hero-meta">
        <span>Malolos · Philippines</span>
        <SystemStatus />
        <span>Open to opportunities</span>
      </div>
      <h1 className="hero-name" id="hero-title">
        <span>Jerome</span>
        <span>Christian</span>
        <span>Ibon</span>
      </h1>
      <div className="hero-foot">
        <p>Cloud Support · DevOps · Cloud Engineering</p>
        <p>
          Computer Engineering graduate building cloud infrastructure, automated
          delivery pipelines, Kubernetes environments, and observable systems.
        </p>
        <a href="#projects">
          Enter the systems <i aria-hidden="true">↓</i>
        </a>
      </div>
      <svg className="hero-topology" viewBox="0 0 700 600" aria-hidden="true">
        <path d="M55 142 C190 142 160 310 312 310 S420 106 620 106 M312 310 C312 420 485 382 596 500" />
        <circle className="node" cx="55" cy="142" r="8" />
        <circle className="node" cx="312" cy="310" r="11" />
        <circle className="node" cx="620" cy="106" r="7" />
        <circle className="node" cx="596" cy="500" r="9" />
        <circle className="pulse" cx="312" cy="310" r="30" />
      </svg>
    </section>
  );
}

export function Principles() {
  return (
    <Section
      id="about"
      title="Operating principles"
      className="principles-section"
    >
      <div className="about-lead" data-resolve>
        <p>
          Supporting real users taught me that infrastructure diagrams only
          matter when the system still makes sense under pressure. Manual fixes
          may solve one incident, but they don’t scale into reliable operations.
        </p>
        <p>
          That pushed me toward DevOps and cloud engineering: provisioning with
          Terraform, delivering through GitHub Actions and GitOps, operating
          Kubernetes, and instrumenting services so failures leave evidence.
        </p>
      </div>
      <ol className="principle-list">
        {principles.map(([title, text], i) => (
          <li key={title} data-resolve>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function Projects({ onOpen }: { onOpen: (p: Project) => void }) {
  return (
    <Section
      id="projects"
      title="Featured systems"
      className="projects-section"
    >
      <p className="projects-intro">
        Two working environments, presented as systems—not thumbnails.
      </p>
      <div className="projects-rail">
        {projects.map((project, index) => (
          <article
            className="project-case system-stage"
            key={project.id}
            data-project={project.id}
          >
            <header>
              <span>System {String(index + 1).padStart(2, "0")}</span>
              <p>{project.category}</p>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
            </header>
            <SystemArchitecture project={project} />
            <div className="case-columns">
              <div>
                <h4>Why it exists</h4>
                <p>{project.purpose}</p>
              </div>
              <div>
                <h4>Operating outcomes</h4>
                <ul>
                  {project.outcomes.slice(0, 2).map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              type="button"
              className="case-open"
              onClick={() => onOpen(project)}
            >
              Inspect full case study <span aria-hidden="true">↗</span>
            </button>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Experience() {
  return (
    <Section id="experience" title="Operational exposure">
      <div className="experience-list">
        {experience.map((item, i) => (
          <article key={item.role} data-resolve>
            <aside>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <time>{item.period}</time>
            </aside>
            <div>
              <h3>{item.role}</h3>
              <p className="org">
                {item.organization} · {item.location}
              </p>
              <p>{item.summary}</p>
              <ul>
                {item.highlights.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

export function Skills({
  onOpen,
}: {
  onOpen: (selection: SkillSelection) => void;
}) {
  return (
    <Section id="skills" title="Capability map" className="skills-section">
      <p className="skills-copy">
        Select a domain to inspect how each tool connects to practical work.
        Every detail remains keyboard accessible.
      </p>
      <CapabilityMap onOpen={onOpen} />
    </Section>
  );
}

export function Credentials() {
  return (
    <Section
      id="credentials-title"
      title="Credentials"
      className="credentials-section"
    >
      <div className="credential-layout">
        <article>
          <h3>{education.degree}</h3>
          <p>
            {education.school} · {education.location}
          </p>
          <time>{education.period}</time>
          <p className="thesis">Thesis — {education.thesis}</p>
        </article>
        <ol>
          {certifications.map((certification, i) => (
            <li key={certification.name}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                {certification.name}
                {certification.status === "in-progress" ? (
                  <small>In progress</small>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

export function Resume() {
  return (
    <Section id="resume" title="Resume">
      <div className="resume-band" data-resolve>
        <div>
          <h3>Everything important, ready to take with you.</h3>
          <p>{professionalSummary}</p>
        </div>
        <div>
          <a
            className="action-primary"
            href="./resume.pdf"
            download="Jerome-Ibon-Resume.pdf"
          >
            Download PDF
          </a>
          <button type="button" onClick={() => window.print()}>
            Print / save
          </button>
        </div>
        <details>
          <summary>Review resume details</summary>
          <div className="resume-detail-grid">
            <div>
              <h4>Experience</h4>
              {experience.map((x) => (
                <p key={x.role}>
                  <strong>{x.role}</strong>
                  <br />
                  {x.organization} · {x.period}
                </p>
              ))}
            </div>
            <div>
              <h4>Education</h4>
              <p>
                {education.degree}
                <br />
                {education.school}
              </p>
              <h4>Skills</h4>
              <p>{skillGroups.flatMap((x) => x.items).join(" · ")}</p>
            </div>
          </div>
        </details>
      </div>
    </Section>
  );
}

export function Contact() {
  return (
    <Section id="contact" title="System handoff" className="contact-section">
      <div className="contact-statement">
        <span className="status-light online" />
        Open to entry-level Cloud Support, DevOps, and Cloud Engineering roles.
      </div>
      <a href="mailto:jeysibn@gmail.com" className="contact-email">
        jeysibn
        <wbr />
        @gmail.com
      </a>
      <nav aria-label="Contact links">
        <a
          href="https://linkedin.com/in/jeromeibon"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn ↗
        </a>
        <a href="https://github.com/Jeysibn" target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a href="./resume.pdf" download="Jerome-Ibon-Resume.pdf">
          Resume ↓
        </a>
      </nav>
    </Section>
  );
}

export function PrintResume() {
  return (
    <article className="print-resume">
      <h1>Jerome Christian V. Ibon</h1>
      <p>Cloud Support · DevOps · Cloud Engineering</p>
      <p>
        Malolos, Bulacan, Philippines · jeysibn@gmail.com ·
        linkedin.com/in/jeromeibon
      </p>
      <h2>Professional summary</h2>
      <p>{professionalSummary}</p>
      <h2>Experience</h2>
      {experience.map((x) => (
        <section key={x.role}>
          <h3>
            {x.role} — {x.organization}
          </h3>
          <p>
            {x.period} · {x.location}
          </p>
          <ul>
            {x.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      ))}
      <h2>Projects</h2>
      {projects.map((x) => (
        <section key={x.id}>
          <h3>{x.title}</h3>
          <ul>
            {x.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>
      ))}
      <h2>Education &amp; certifications</h2>
      <p>
        {education.degree}, {education.school}, {education.period}
      </p>
      <ul>
        {certifications.map((certification) => (
          <li key={certification.name}>
            {certification.name}
            {certification.status === "in-progress" ? " — in progress" : ""}
          </li>
        ))}
      </ul>
    </article>
  );
}
