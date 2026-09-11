import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function MotionDirector() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.documentElement.classList.add("motion-enabled");
    const capabilityMap =
      document.querySelector<HTMLElement>(".capability-system");
    const mapObserver = capabilityMap
      ? new IntersectionObserver(
          ([entry]) =>
            capabilityMap.classList.toggle("is-running", entry.isIntersecting),
          { rootMargin: "15% 0px" },
        )
      : null;
    if (capabilityMap && mapObserver) mapObserver.observe(capabilityMap);
    const handleVisibility = () =>
      capabilityMap?.classList.toggle("is-paused", document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    const context = gsap.context(() => {
      gsap.from(".hero-name span", {
        yPercent: 115,
        rotate: 2,
        duration: 1.15,
        stagger: 0.09,
        ease: "expo.out",
        delay: 0.18,
      });
      gsap.from(".hero-topology .node", {
        scale: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: "back.out(2)",
        delay: 0.35,
      });
      gsap.from(".hero-topology path", {
        strokeDashoffset: 700,
        duration: 1.5,
        ease: "power3.inOut",
        delay: 0.25,
      });
      gsap.utils.toArray<HTMLElement>(".section-rule").forEach((el) =>
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: "left",
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        }),
      );
      gsap.utils.toArray<HTMLElement>("[data-resolve]").forEach((el, index) =>
        gsap.from(el, {
          x: index % 2 ? 24 : -24,
          duration: 0.9,
          ease: "expo.out",
          immediateRender: false,
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        }),
      );
      gsap.to(".signal-progress", {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.2,
        },
      });
      const railStages = gsap.utils.toArray<HTMLElement>(".signal-stage");
      gsap.utils
        .toArray<HTMLElement>("[data-signal-stage]")
        .forEach((section) => {
          const stage = section.dataset.signalStage;
          if (!stage) return;
          const activate = () =>
            railStages.forEach((item) =>
              item.classList.toggle("is-active", item.dataset.stage === stage),
            );
          ScrollTrigger.create({
            trigger: section,
            start: "top 55%",
            end: "bottom 45%",
            onEnter: activate,
            onEnterBack: activate,
          });
        });
      gsap.utils.toArray<HTMLElement>(".architecture-flow").forEach((flow) => {
        const nodes = gsap.utils.toArray<HTMLElement>(
          flow.querySelectorAll(".architecture-node"),
        );
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: flow,
            start: "top 78%",
            end: "bottom 40%",
            scrub: 0.35,
          },
        });
        timeline.to(
          flow.querySelector(".architecture-signal"),
          { scaleX: 1, ease: "none" },
          0,
        );
        nodes.forEach((node, index) =>
          timeline.to(
            node,
            {
              opacity: 1,
              scale: 1,
              color: "var(--system-fg)",
              duration: 0.18,
              ease: "power2.out",
            },
            index / Math.max(1, nodes.length - 1),
          ),
        );
      });
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      context.revert();
      mapObserver?.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      document.documentElement.classList.remove("motion-enabled");
    };
  }, []);
  return null;
}
export function SignalPath() {
  const stages = ["SIGNAL", "PROVISION", "DEPLOY", "RUN", "OBSERVE", "IMPROVE"];
  return (
    <aside className="signal-rail" aria-hidden="true">
      <span className="signal-base" />
      <span className="signal-progress" />
      <ol>
        {stages.map((stage) => (
          <li key={stage} className="signal-stage" data-stage={stage}>
            <i />
            <span>{stage}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
