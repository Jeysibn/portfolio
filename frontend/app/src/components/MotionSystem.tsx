import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { signalStageIndex } from "./signalProgress";
gsap.registerPlugin(ScrollTrigger);

export function MotionDirector() {
  useEffect(() => {
    const railStages = Array.from(
      document.querySelectorAll<HTMLElement>(".signal-stage"),
    );
    const progressLine = document.querySelector<HTMLElement>(".signal-progress");
    let frame = 0;
    const updateSignalState = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollRange > 0
          ? Math.min(1, Math.max(0, window.scrollY / scrollRange))
          : 0;
        const activeIndex = signalStageIndex(progress);
        if (progressLine) progressLine.style.transform = `scaleY(${progress})`;
        railStages.forEach((item, index) => {
          item.classList.toggle("is-active", index === activeIndex);
          item.classList.toggle("is-complete", index < activeIndex);
        });
      });
    };
    updateSignalState();
    window.addEventListener("scroll", updateSignalState, { passive: true });
    window.addEventListener("resize", updateSignalState);

    const teardownSignal = () => {
      window.removeEventListener("scroll", updateSignalState);
      window.removeEventListener("resize", updateSignalState);
      if (frame) window.cancelAnimationFrame(frame);
    };

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return teardownSignal;
    }
    document.documentElement.classList.add("motion-enabled");
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
    });
    document.fonts?.ready.then(() => {
      ScrollTrigger.refresh();
      updateSignalState();
    });
    return () => {
      context.revert();
      document.documentElement.classList.remove("motion-enabled");
      teardownSignal();
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
          <li
            key={stage}
            className={`signal-stage ${stage === "SIGNAL" ? "is-active" : ""}`}
          >
            <i />
            <span>{stage}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
