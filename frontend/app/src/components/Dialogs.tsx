import { useEffect, useRef } from "react";
import type { Project, SkillGroup } from "../portfolio";
import { skillDetails } from "../skill-details";

function useDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const close = () => onClose();
    dialog.addEventListener("close", close);
    return () => dialog.removeEventListener("close", close);
  }, [onClose]);
  return ref;
}

export function ProjectDialog({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const ref = useDialog(Boolean(project), onClose);
  return (
    <dialog
      ref={ref}
      className="inspection-dialog"
      aria-labelledby="project-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {project && (
        <article>
          <header>
            <p>{project.category}</p>
            <h2 id="project-dialog-title">{project.title}</h2>
            <button
              type="button"
            onClick={onClose}
              aria-label="Close case study"
            >
              Close
            </button>
          </header>
          <p className="dialog-lead">{project.summary}</p>
          <div className="dialog-grid">
            <section>
              <h3>Why it exists</h3>
              <p>{project.purpose}</p>
            </section>
            <section>
              <h3>Operating outcomes</h3>
              <ul>
                {project.outcomes.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Engineering highlights</h3>
              <ul>
                {project.highlights.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </section>
            <section>
              <h3>Technology</h3>
              <p>{project.technologies.join(" · ")}</p>
            </section>
          </div>
          <a
            className="action-primary"
            href={project.repositoryUrl}
            target="_blank"
            rel="noreferrer"
          >
            View repository ↗
          </a>
        </article>
      )}
    </dialog>
  );
}

export function SkillDialog({
  group,
  onClose,
}: {
  group: SkillGroup | null;
  onClose: () => void;
}) {
  const ref = useDialog(Boolean(group), onClose);
  const detail = group ? skillDetails[group.label] : null;
  return (
    <dialog
      ref={ref}
      className="inspection-dialog skill-dialog"
      aria-labelledby="skill-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {group && detail && (
        <article>
          <header>
            <p>Capability inspection</p>
            <h2 id="skill-dialog-title">{group.label}</h2>
            <button
              type="button"
            onClick={onClose}
              aria-label="Close skill details"
            >
              Close
            </button>
          </header>
          <p className="dialog-lead">{detail.summary}</p>
          <p>{detail.practice}</p>
          <div className="skill-inspection-list">
            {group.items.map((item) => (
              <section key={item}>
                <h3>{item}</h3>
                <p>{detail.itemDescriptions[item]}</p>
              </section>
            ))}
          </div>
        </article>
      )}
    </dialog>
  );
}
