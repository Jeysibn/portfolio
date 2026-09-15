import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import gsap from "gsap";
import type { Project } from "../../portfolio";
import { ProjectSelector } from "./ProjectSelector";
import { SystemDossier } from "./SystemDossier";
import { useSystemDeck } from "./useSystemDeck";

const positionForDepth = (depth: number) => ({
  x: depth === 0 ? 0 : depth % 2 === 0 ? -10 : 12,
  y: depth === 0 ? 0 : depth * -28,
  rotation: depth === 0 ? 0 : (depth % 2 === 0 ? -1 : 1) * Math.min(4, depth * 0.8),
  scale: 1 - depth * 0.025,
  opacity: Math.max(0.72, 1 - depth * 0.065),
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
  const initialLayout = useRef(true);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const { activeId, activeIndex, order, orderedProjects, selectProject } = useSystemDeck(projects);

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

  useLayoutEffect(() => {
    if (!contextRef.current) return;
    timelineRef.current?.kill();
    contextRef.current.add(() => {
      const timeline = gsap.timeline({
        defaults: { duration: reducedMotion || initialLayout.current ? 0 : 0.56, ease: "expo.out" },
      });
      order.forEach((id, depth) => {
        const element = cardRefs.current.get(id);
        if (!element) return;
        timeline.to(element, positionForDepth(depth), 0);
      });
      timelineRef.current = timeline;
    });
    initialLayout.current = false;
  }, [order, reducedMotion]);

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
      timelineRef.current?.kill();
      const currentOrder = order;
      const currentCards = currentOrder
        .map((id) => cardRefs.current.get(id))
        .filter((element): element is HTMLElement => Boolean(element));

      contextRef.current?.add(() => {
        currentCards.forEach((element, depth) => gsap.set(element, positionForDepth(depth)));
        if (reducedMotion) {
          selectProject(selectedId);
          return;
        }
        const currentActive = cardRefs.current.get(activeId);
        const timeline = gsap.timeline({
          defaults: { ease: "expo.out" },
          onComplete: () => selectProject(selectedId),
        });
        if (currentActive) {
          timeline.to(currentActive, { y: -18, x: 16, rotation: 2.4, scale: 1.01, opacity: 0.88, duration: 0.18 });
        }
        timeline.to(currentCards, { y: "+=5", duration: 0.18, stagger: 0.018 }, "<");
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
        {orderedProjects.map((project, depth) => {
          const projectIndex = projects.findIndex((item) => item.id === project.id);
          return (
            <SystemDossier
              key={project.id}
              project={project}
              index={projectIndex}
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
