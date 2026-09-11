import type { CSSProperties } from "react";
import type { SkillGroup } from "../../portfolio";
import { skillGroups } from "../../portfolio";
import { SkillGlyph } from "./SkillGlyph";

export interface SkillSelection {
  group: SkillGroup;
  item?: string;
}

const domainCodes = [
  "CLOUD",
  "RUNTIME",
  "DELIVERY",
  "TELEMETRY",
  "SYSTEMS",
  "TOOLS",
];

export function CapabilityMap({
  onOpen,
}: {
  onOpen: (selection: SkillSelection) => void;
}) {
  return (
    <div
      className="capability-system"
      aria-label="Interactive technical capability map"
    >
      <div className="control-plane" aria-hidden="true">
        <span>CONTROL</span>
        <strong>PLANE</strong>
        <small>
          6 domains ·{" "}
          {skillGroups.reduce((total, group) => total + group.items.length, 0)}{" "}
          capabilities
        </small>
      </div>
      {skillGroups.map((group, domainIndex) => (
        <section
          className={`capability-domain domain-${domainIndex + 1}`}
          key={group.label}
          style={
            {
              "--orbit-duration": `${38 + domainIndex * 2.8}s`,
              "--orbit-direction": domainIndex % 2 ? "reverse" : "normal",
              "--orbit-radius": `${group.items.length >= 8 ? 104 : group.items.length >= 5 ? 96 : 84}px`,
            } as CSSProperties
          }
        >
          <div className="orbit-track" aria-hidden="true" />
          <button
            className="domain-anchor"
            type="button"
            onClick={() => onOpen({ group })}
          >
            <span>{domainCodes[domainIndex]}</span>
            <strong>{group.label}</strong>
            <small>{group.items.length} capabilities</small>
          </button>
          <div className="orbiting-skills">
            {group.items.map((item, itemIndex) => {
              const count = group.items.length;
              const style = {
                "--orbit-angle": `${(360 / count) * itemIndex + (domainIndex % 2 ? 18 : -8)}deg`,
              } as CSSProperties;
              return (
                <div className="skill-orbit" style={style} key={item}>
                  <button
                    className="orbit-skill"
                    type="button"
                    onClick={() => onOpen({ group, item })}
                    aria-label={`${item} — inspect ${group.label}`}
                  >
                    <SkillGlyph name={item} />
                    <span>{item}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
