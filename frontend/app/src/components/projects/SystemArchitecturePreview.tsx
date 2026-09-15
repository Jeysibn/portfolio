import type { Project } from "../../portfolio";

export function SystemArchitecturePreview({ project }: { project: Project }) {
  const { flow } = project.preview;
  return (
    <figure className="system-preview" aria-labelledby={`${project.id}-flow-title`}>
      <figcaption id={`${project.id}-flow-title`}>
        <span>System flow</span>
        <strong>{flow.label}</strong>
      </figcaption>
      <ol>
        {flow.nodes.map((node, index) => (
          <li key={`${project.id}-${node}`}>
            <span className="system-preview-node">{node}</span>
            {index < flow.nodes.length - 1 ? (
              <span className="system-preview-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="visually-hidden">
        {flow.nodes.join(" then ")}.
      </p>
    </figure>
  );
}
