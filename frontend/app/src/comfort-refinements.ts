declare const __BUILD_TIMESTAMP__: string;

const buildStartedAt = new Date(__BUILD_TIMESTAMP__);
let cleanupComfort: (() => void) | null = null;

function formatReleaseAge(now = new Date()) {
  const elapsed = Math.max(0, now.getTime() - buildStartedAt.getTime());
  const totalMinutes = Math.floor(elapsed / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function updateHeroCopy() {
  const title = document.getElementById("hero-title");
  if (title) {
    title.textContent = "Aspiring Cloud & DevOps Engineer building reliable, automated systems.";
  }

  const action = document.querySelector<HTMLAnchorElement>(".hero-actions .button-primary");
  if (!action) return;
  action.href = "#contact";
  action.replaceChildren(document.createTextNode("Contact me"));
  action.setAttribute("aria-label", "Go to contact section");
}

function bindProjectCards() {
  document.querySelectorAll<HTMLElement>(".project-row").forEach((card) => {
    if (card.dataset.cardBound === "true") return;
    const action = card.querySelector<HTMLButtonElement>(".text-action");
    const title = card.querySelector<HTMLElement>("h3")?.textContent?.trim();
    if (!action || !title) return;

    card.dataset.cardBound = "true";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `View ${title} project details`);

    action.tabIndex = -1;
    action.setAttribute("aria-hidden", "true");
    action.replaceChildren();

    const open = () => action.click();
    card.addEventListener("click", (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".text-action")) return;
      open();
    });
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      open();
    });
  });
}

function updateReleaseAge() {
  const runtime = document.querySelector<HTMLElement>(".monitor-summary > div:first-child");
  if (!runtime) return;

  const label = runtime.querySelector<HTMLElement>("span");
  const value = runtime.querySelector<HTMLElement>("strong");
  if (!label || !value) return;

  label.textContent = "release age";
  runtime.setAttribute("aria-label", `Release built at ${buildStartedAt.toLocaleString()}`);

  const serviceState = document.querySelector<HTMLElement>(".service-state")?.textContent?.trim().toLowerCase() || "";
  if (serviceState.includes("checking")) {
    value.textContent = "checking";
  } else if (serviceState.includes("operational")) {
    value.textContent = formatReleaseAge();
  } else {
    value.textContent = "unavailable";
  }
}

function installComfort(attempt = 0) {
  const ready = document.getElementById("hero-title") && document.querySelector(".hero-actions") && document.querySelector(".monitor-summary") && document.querySelector(".project-row");
  if (!ready && attempt < 30) {
    window.setTimeout(() => installComfort(attempt + 1), 50);
    return;
  }

  cleanupComfort?.();
  updateHeroCopy();
  bindProjectCards();
  updateReleaseAge();

  const runtimeTimer = window.setInterval(updateReleaseAge, 1_000);
  cleanupComfort = () => window.clearInterval(runtimeTimer);
}

window.requestAnimationFrame(() => installComfort());
