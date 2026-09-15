import type { Project } from "../../portfolio";

export function SystemArchitecture({ project }: { project: Project }) {
  return (
    <div
      className="system-architecture"
      aria-label={`${project.title} architecture`}
    >
      <div className="architecture-viewport">
        <div className="architecture-status" aria-hidden="true">
          <span>TRANSFER</span>
          <i />
          <span>OBSERVE</span>
        </div>
        {project.details.architectureFlows.map((flow, flowIndex) => (
          <div
            className="architecture-flow"
            key={flow.label}
            data-flow={flowIndex}
          >
            <p>{flow.label}</p>
            <div className="architecture-track">
              <span className="architecture-line" aria-hidden="true" />
              <span className="architecture-signal" aria-hidden="true" />
              {flow.nodes.map((node, nodeIndex) => (
                <div
                  className="architecture-node"
                  key={`${flow.label}-${node}`}
                >
                  <span>{String(nodeIndex + 1).padStart(2, "0")}</span>
                  <strong>{node}</strong>
                  <small>
                    {nodeIndex === 0
                      ? "origin"
                      : nodeIndex === flow.nodes.length - 1
                        ? "destination"
                        : "handoff"}
                  </small>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
