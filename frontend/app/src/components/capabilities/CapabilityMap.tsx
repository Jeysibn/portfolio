import { useEffect, useRef, useState } from "react";
import type { SkillGroup } from "../../portfolio";
import { skillGroups } from "../../portfolio";
import { SkillGlyph } from "./SkillGlyph";

export interface SkillSelection {
  group: SkillGroup;
  item?: string;
}

const domainCodes = ["01", "02", "03", "04", "05", "06"];

export function CapabilityMap({
  onOpen,
}: {
  onOpen: (selection: SkillSelection) => void;
}) {
  const systemRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

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
      className={`capability-system ${isInView ? "is-in-view" : ""} ${isFocused ? "is-focused" : ""}`}
      aria-label="Interactive technical capability map"
      role="region"
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
    >
      <div className="capability-center" aria-hidden="true">
        <span>Jerome Ibon</span>
        <strong>Infrastructure<br />in practice.</strong>
        <small>
          {skillGroups.reduce((total, group) => total + group.items.length, 0)} capabilities · 06 domains
        </small>
      </div>
      <div className="capability-domains">
        {skillGroups.map((group, domainIndex) => (
          <section className="capability-domain" key={group.label}>
            <div className="capability-domain-heading">
              <span>{domainCodes[domainIndex]}</span>
              <button type="button" onClick={() => onOpen({ group })}>
                {group.label}
              </button>
            </div>
            <ul>
              {group.items.map((item) => (
                <li key={item}>
                  <button
                    className="capability-tool"
                    type="button"
                    onClick={() => onOpen({ group, item })}
                    aria-label={`${item} — inspect ${group.label}`}
                  >
                    <SkillGlyph name={item} />
                    <span>{item}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
