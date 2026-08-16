const sectionTitles: Record<string, string> = {
  "about-title": "About",
  "experience-title": "Experience",
  "projects-title": "Projects",
  "skills-title": "Skills & Tools",
  "credentials-title": "Education & Certifications",
  "resume-title": "Resume",
  "contact-title": "Contact",
};

const manilaTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function applyShortSectionTitles() {
  Object.entries(sectionTitles).forEach(([id, title]) => {
    const heading = document.getElementById(id);
    if (heading && heading.textContent !== title) heading.textContent = title;
  });
}

function ensureManilaClock() {
  const monitorSummary = document.querySelector<HTMLElement>(".monitor-summary");
  if (!monitorSummary) return null;

  let clock = monitorSummary.querySelector<HTMLElement>(".monitor-local-time");
  if (clock) return clock;

  clock = document.createElement("div");
  clock.className = "monitor-local-time";
  clock.setAttribute("aria-label", "Current time in Manila, Philippines");

  const label = document.createElement("span");
  label.textContent = "Manila";

  const value = document.createElement("strong");
  value.className = "monitor-local-time-value";

  clock.append(label, value);
  monitorSummary.append(clock);

  return clock;
}

function updateManilaClock() {
  const clock = ensureManilaClock();
  const value = clock?.querySelector<HTMLElement>(".monitor-local-time-value");
  if (!value) return;

  value.textContent = manilaTimeFormatter.format(new Date());
}

function installRefinements(attempt = 0) {
  const appReady = document.getElementById("about-title") && document.querySelector(".monitor-summary");

  if (!appReady && attempt < 20) {
    window.setTimeout(() => installRefinements(attempt + 1), 50);
    return;
  }

  applyShortSectionTitles();
  updateManilaClock();

  window.setInterval(() => {
    applyShortSectionTitles();
    updateManilaClock();
  }, 30_000);
}

window.requestAnimationFrame(() => installRefinements());
