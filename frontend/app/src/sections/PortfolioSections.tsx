import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  career,
  certifications,
  education,
  experience,
  profile,
  professionalSummary,
  projects,
  skillGroups,
} from "../portfolio";
import type { Project } from "../portfolio";
import { CapabilityMap } from "../components/capabilities/CapabilityMap";
import type { SkillSelection } from "../components/capabilities/CapabilityMap";
import { SystemDeck } from "../components/projects/SystemDeck";

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
  return (
    <section
      id={id}
      className={`section ${className}`}
      aria-labelledby={`${id}-title`}
    >
      <header className="section-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        <span className="section-rule" aria-hidden="true" />
      </header>
      {children}
    </section>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="hero section-frame"
      aria-labelledby="hero-title"
    >
      <div className="hero-meta">
        <span>01 / 06</span>
        <span>Malolos, Philippines · 2026</span>
        <span>Available now</span>
      </div>
      <h1 className="hero-name" id="hero-title">
        <span>Jerome</span>
        <span>Ibon</span>
      </h1>
      <div className="hero-foot">
        <p className="hero-role">NOC Engineer / DevOps / Cloud</p>
        <p>
          I build infrastructure and systems designed to remain understandable
          when things fail.
        </p>
        <a href="#projects">
          Selected work <i aria-hidden="true">↓</i>
        </a>
      </div>
    </section>
  );
}

export function Principles() {
  return (
    <Section
      id="about"
      title="Systems / people / purpose"
      className="principles-section"
    >
      <div className="about-lead">
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
          <li key={title}>
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
      title="Selected work"
      className="projects-section"
    >
      <p className="projects-intro">
        Four working systems, documented from the operational problem to the
        delivery path.
      </p>
      <SystemDeck projects={projects} onInspect={onOpen} />
    </Section>
  );
}

export function Experience() {
  return (
    <Section id="experience" title="Learning / building / improving">
      <div className="experience-list">
        {experience.map((item, i) => (
          <article key={item.role}>
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
    <Section id="skills" title="Capabilities" className="skills-section">
      <p className="skills-copy">
        The tools are a consequence of the work: cloud platforms, delivery
        systems, observability, and the operating knowledge between them.
      </p>
      <CapabilityMap onOpen={onOpen} />
    </Section>
  );
}

export function Credentials() {
  return (
    <Section
      id="credentials"
      title="Foundations"
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
                {certification.referenceUrl ? (
                  <a
                    className="credential-name"
                    href={certification.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {certification.name} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  certification.name
                )}
                <small className="credential-meta">
                  {certification.issuer ? `${certification.issuer} · ` : null}
                  <span
                    className={
                      certification.status === "in-progress"
                        ? "credential-in-progress"
                        : undefined
                    }
                  >
                    {certification.status === "in-progress"
                      ? "In progress"
                      : "Earned"}
                  </span>
                </small>
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
    <Section id="resume" title="A concise record">
      <div className="resume-band">
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

type CopyState = "idle" | "copying" | "copied" | "error";

function copyTextFallback(value: string) {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  let copied = false;
  try {
    copied =
      typeof document.execCommand === "function" &&
      document.execCommand("copy");
  } catch {
    // The email remains visible and selectable when the legacy fallback fails.
  }
  document.body.removeChild(textArea);
  return copied;
}

export function Contact() {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyResetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimer.current !== null) {
        window.clearTimeout(copyResetTimer.current);
      }
    };
  }, []);

  const copyEmail = async () => {
    if (copyResetTimer.current !== null) {
      window.clearTimeout(copyResetTimer.current);
      copyResetTimer.current = null;
    }

    setCopyState("copying");
    let copied = false;
    try {
      if (typeof navigator.clipboard?.writeText === "function") {
        await navigator.clipboard.writeText(profile.email);
        copied = true;
      }
    } catch {
      // Try the local DOM fallback when Clipboard API permission is unavailable.
    }

    if (!copied) {
      copied = copyTextFallback(profile.email);
    }

    setCopyState(copied ? "copied" : "error");
    if (copied) {
      copyResetTimer.current = window.setTimeout(() => {
        setCopyState("idle");
        copyResetTimer.current = null;
      }, 2200);
    }
  };

  const copyStatus = {
    idle: "",
    copying: "Copying email.",
    copied: "Email copied.",
    error: "Copy unavailable. Select the email address to copy it manually.",
  }[copyState];

  return (
    <Section id="contact" title="Contact" className="contact-section">
      <div className="contact-handoff">
        <div className="contact-intent">
          <p className="contact-kicker">06 / CONTACT</p>
          <h3>Let&apos;s build<br />what matters.</h3>
          <p>
            I&apos;m open to entry-level Cloud Engineering, DevOps and Cloud
            Support opportunities where I can work on infrastructure, delivery
            automation, Kubernetes and observable systems.
          </p>
          <p className="contact-availability">
            <span className="status-light online" aria-hidden="true" />
            <span>Open to opportunities</span>
            <small>{career.availability}</small>
          </p>
        </div>
        <div className="contact-primary-channel">
          <span className="contact-label">Primary channel</span>
          <a
            href={`mailto:${profile.email}`}
            className="contact-email"
            aria-label={`Email ${profile.email}`}
          >
            {profile.email}
          </a>
          <div className="contact-actions">
            <a className="action-primary" href={`mailto:${profile.email}`}>
              Send email <span aria-hidden="true">→</span>
            </a>
            <button
              className="action-secondary"
              type="button"
              onClick={copyEmail}
              disabled={copyState === "copying"}
              aria-label={
                copyState === "copied" ? "Email copied" : "Copy email"
              }
            >
              {copyState === "copied" ? (
                <>Copied <span aria-hidden="true">✓</span></>
              ) : copyState === "copying" ? (
                "Copying…"
              ) : (
                "Copy email"
              )}
            </button>
          </div>
          <p className="contact-copy-status" aria-live="polite" aria-atomic="true">
            {copyStatus}
          </p>
        </div>
      </div>
      <nav className="contact-links" aria-label="Engineering presence">
        <span className="contact-links-label">Engineering presence</span>
        <div className="contact-links-list">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn (opens in a new tab)"
          >
            LinkedIn <span aria-hidden="true">↗</span>
          </a>
          <a href="./resume.pdf" download="Jerome-Ibon-Resume.pdf">
            Resume <span aria-hidden="true">↓</span>
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub (opens in a new tab)"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
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
        {profile.location} · {profile.email} · {profile.linkedin}
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
            {x.details.highlights.map((h) => (
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
