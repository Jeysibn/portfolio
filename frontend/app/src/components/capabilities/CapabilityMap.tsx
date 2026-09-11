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
              const angle =
                (360 / count) * itemIndex + (domainIndex % 2 ? 18 : -8);
              const radius = count > 6 ? 104 : count > 4 ? 92 : 80;
              const style = {
                "--orbit-angle": `${angle}deg`,
                "--orbit-radius": `${radius}px`,
                "--orbit-duration": `${34 + domainIndex * 4 + (itemIndex % 3) * 5}s`,
                "--orbit-direction":
                  (domainIndex + itemIndex) % 3 === 0 ? "reverse" : "normal",
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
