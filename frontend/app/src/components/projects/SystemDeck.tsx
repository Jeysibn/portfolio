import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import gsap from "gsap";
import type { Project } from "../../portfolio";
import { ProjectSelector } from "./ProjectSelector";
import { SystemDossier } from "./SystemDossier";
import { rotateDeck, useSystemDeck } from "./useSystemDeck";

const positionForDepth = (depth: number) => ({
  x: depth === 0 ? 0 : depth % 2 === 0 ? -30 - depth * 2 : 34 + depth * 4,
  y: depth === 0 ? 0 : depth * -38,
  rotation: depth === 0 ? 0 : (depth % 2 === 0 ? -1 : 1) * Math.min(3.2, depth * 0.85),
  scale: 1 - depth * 0.025,
  opacity: Math.max(0.76, 1 - depth * 0.06),
});

function prefersReducedMotion() {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SystemDeck({
  projects,
  onInspect,
}: {
  projects: Project[];
  onInspect: (project: Project) => void;
}) {
  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const contextRef = useRef<gsap.Context | null>(null);
  const pointerStart = useRef<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const { activeId, activeIndex, order, selectProject } = useSystemDeck(projects);

  useLayoutEffect(() => {
    const context = gsap.context(() => undefined, deckRef);
    contextRef.current = context;
    return () => {
      timelineRef.current?.kill();
      context.revert();
      contextRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  // Keep the stable card DOM aligned after a state change or a project-list change.
  // The shuffle itself owns the transition; this effect only establishes a safe rest state.
  useLayoutEffect(() => {
    if (!contextRef.current) return;
    timelineRef.current?.kill();
    contextRef.current.add(() => {
      order.forEach((id, depth) => {
        const element = cardRefs.current.get(id);
        if (!element) return;
        gsap.set(element, {
          ...positionForDepth(depth),
          zIndex: projects.length - depth,
        });
      });
    });
  }, [order, projects.length, reducedMotion]);

  const setCardRef = useCallback(
    (id: string) => (element: HTMLElement | null) => {
      if (element) cardRefs.current.set(id, element);
      else cardRefs.current.delete(id);
    },
    [],
  );

  const handleSelect = useCallback(
    (selectedId: string) => {
      if (selectedId === activeId || !projects.some((project) => project.id === selectedId)) return;

      const nextOrder = rotateDeck(order, selectedId);
      const currentActive = cardRefs.current.get(activeId);

      // Rapid input starts from a deterministic logical layout, preventing stale GSAP
      // transforms or z-index values from surviving into the next shuffle.
      timelineRef.current?.kill();
      contextRef.current?.add(() => {
        order.forEach((id, depth) => {
          const element = cardRefs.current.get(id);
          if (!element) return;
          gsap.set(element, {
            ...positionForDepth(depth),
            zIndex: projects.length - depth,
          });
        });

        if (reducedMotion) {
          nextOrder.forEach((id, depth) => {
            const element = cardRefs.current.get(id);
            if (!element) return;
            gsap.set(element, {
              ...positionForDepth(depth),
              zIndex: projects.length - depth,
            });
          });
          selectProject(selectedId);
          return;
        }

        const timeline = gsap.timeline({ defaults: { ease: "expo.out" } });
        if (currentActive) {
          timeline.to(currentActive, {
            x: 28,
            y: -24,
            rotation: 2.5,
            scale: 1.015,
            duration: 0.16,
          }, 0);
        }

        timeline.add(() => {
          nextOrder.forEach((id, depth) => {
            const element = cardRefs.current.get(id);
            if (element) gsap.set(element, { zIndex: projects.length - depth });
          });
        }, 0.16);

        nextOrder.forEach((id, depth) => {
          const element = cardRefs.current.get(id);
          if (!element) return;
          timeline.to(element, {
            ...positionForDepth(depth),
            duration: 0.52,
          }, 0.16);
        });

        // Keep the full card mounted throughout; only its depth and transform change.
        timeline.eventCallback("onComplete", () => selectProject(selectedId));
        timelineRef.current = timeline;
      });

    },
    [activeId, order, projects, reducedMotion, selectProject],
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextIndex = event.key === "ArrowLeft"
      ? (activeIndex - 1 + projects.length) % projects.length
      : (activeIndex + 1) % projects.length;
    handleSelect(projects[nextIndex].id);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = event.clientX;
  };
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (pointerStart.current === null) return;
    const delta = event.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(delta) < 52) return;
    const nextIndex = delta < 0
      ? (activeIndex + 1) % projects.length
      : (activeIndex - 1 + projects.length) % projects.length;
    handleSelect(projects[nextIndex].id);
  };

  return (
    <div className="system-deck" ref={deckRef}>
      <div
        className="system-deck-stage"
        tabIndex={0}
        aria-label="System deck. Use ArrowLeft and ArrowRight to change the active system."
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStart.current = null;
        }}
      >
        {projects.map((project) => {
          const depth = order.indexOf(project.id);
          return (
            <SystemDossier
              key={project.id}
              project={project}
              index={projects.indexOf(project)}
              total={projects.length}
              depth={depth}
              isActive={project.id === activeId}
              onSelect={handleSelect}
              onInspect={onInspect}
              setRef={setCardRef(project.id)}
            />
          );
        })}
      </div>
      <ProjectSelector projects={projects} activeId={activeId} onSelect={handleSelect} />
      <p className="system-deck-announcement visually-hidden" aria-live="polite">
        Active system {String(activeIndex + 1).padStart(2, "0")} of {String(projects.length).padStart(2, "0")}:
        {" "}{projects[activeIndex]?.title}
      </p>
    </div>
  );
}
