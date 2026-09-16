import { useEffect, useRef, useState } from "react";
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

const skillOrbitMotion = [
  { duration: "32s", direction: "normal" },
  { duration: "37s", direction: "reverse" },
  { duration: "29s", direction: "normal" },
  { duration: "40s", direction: "reverse" },
  { duration: "27s", direction: "normal" },
  { duration: "35s", direction: "reverse" },
] as const;

export function CapabilityMap({
  onOpen,
}: {
  onOpen: (selection: SkillSelection) => void;
}) {
  const systemRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = systemRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin: "180px 0px", threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={systemRef}
      className={`capability-system ${isInView ? "is-in-view" : ""}`}
      aria-label="Interactive technical capability map"
      style={{ "--domain-orbit-duration": "104s" } as CSSProperties}
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
      <div className="outer-orbit">
        {skillGroups.map((group, domainIndex) => {
          const domainAngle = (360 / skillGroups.length) * domainIndex - 90;
          const motion = skillOrbitMotion[domainIndex % skillOrbitMotion.length];
          return (
            <div
              className="domain-orbit-slot"
              key={group.label}
              style={{ "--domain-angle": `${domainAngle}deg` } as CSSProperties}
            >
              <div className="domain-counter-rotation">
                <section
                  className={`capability-domain domain-${domainIndex + 1}`}
                  style={
                    {
                      "--orbit-radius": `${group.items.length >= 8 ? 104 : group.items.length >= 5 ? 96 : 84}px`,
                      "--skill-orbit-duration": motion.duration,
                      "--skill-orbit-direction": motion.direction,
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
