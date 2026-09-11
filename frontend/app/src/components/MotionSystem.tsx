import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export function MotionDirector() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
      gsap.utils
        .toArray<HTMLElement>(".section-rule")
        .forEach((el) =>
          gsap.from(el, {
            scaleX: 0,
            transformOrigin: "left",
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          }),
        );
      gsap.utils
        .toArray<HTMLElement>("[data-resolve]")
        .forEach((el, index) =>
          gsap.from(el, {
            x: index % 2 ? 24 : -24,
            duration: 0.9,
            ease: "expo.out",
            immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          }),
        );
      gsap.to(".signal-progress", {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.2,
        },
      });
      gsap.utils.toArray<SVGGElement>(".signal-phase").forEach((phase) =>
        gsap.fromTo(
          phase,
          { scale: 0.55, opacity: 0.25 },
          {
            scale: 1,
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: phase.dataset.target ?? document.body,
              start: "top 72%",
              end: "bottom 38%",
              scrub: true,
            },
          },
        ),
      );
      gsap.utils
        .toArray<HTMLElement>(".system-stage")
        .forEach((stage) =>
          gsap.from(stage.querySelectorAll(".architecture-node"), {
            opacity: 0.2,
            scale: 0.82,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: stage,
              start: "top 70%",
              end: "bottom 55%",
              scrub: true,
            },
          }),
        );
      gsap.to(".projects-rail", {
        xPercent: -5,
        ease: "none",
        scrollTrigger: {
          trigger: "#projects",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      context.revert();
      document.documentElement.classList.remove("motion-enabled");
    };
  }, []);
  return null;
}
export function SignalPath() {
  const d =
    "M50 0 C18 70 84 115 50 190 S18 310 50 390 S82 510 50 600 S18 720 50 800 S80 920 50 1000";
  return (
    <svg
      className="signal-map"
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path className="signal-base" d={d} />
      <path className="signal-progress" pathLength="1000" d={d} />
      {[
        ["signal", "#top", 50, 42, "circle"],
        ["provision", "#about", 61, 210, "square"],
        ["deploy", "#projects", 36, 405, "arrow"],
        ["run", "#experience", 58, 590, "core"],
        ["observe", "#skills", 41, 770, "eye"],
        ["improve", "#contact", 50, 958, "handoff"],
      ].map(([label, target, x, y, shape]) => (
        <g
          key={label}
          className={`signal-phase phase-${label}`}
          data-target={target}
          transform={`translate(${x} ${y})`}
        >
          {shape === "square" ? <rect x="-6" y="-6" width="12" height="12" /> : null}
          {shape === "arrow" ? <polygon points="-7,-6 8,0 -7,6" /> : null}
          {shape === "eye" ? <><ellipse rx="10" ry="6" /><circle r="2.5" /></> : null}
          {shape === "handoff" ? <path d="M-9 5 L-3-5 L2 2 L8-7" /> : null}
          {shape === "circle" || shape === "core" ? <circle r={shape === "core" ? "6" : "4"} /> : null}
          {shape === "circle" || shape === "core" ? <circle className="phase-ring" r={shape === "core" ? "11" : "9"} /> : null}
        </g>
      ))}
    </svg>
  );
}
