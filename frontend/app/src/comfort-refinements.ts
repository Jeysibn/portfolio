declare const __BUILD_TIMESTAMP__: string;

const buildStartedAt = new Date(__BUILD_TIMESTAMP__);
const hasValidBuildTimestamp = !Number.isNaN(buildStartedAt.getTime());
const releaseFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

let cleanupComfort: (() => void) | null = null;

function formatReleaseAge(now = new Date()) {
  if (!hasValidBuildTimestamp) return "unknown";

  const elapsed = Math.max(0, now.getTime() - buildStartedAt.getTime());
  const totalMinutes = Math.floor(elapsed / 60_000);
  const days = Math.floor(totalMinutes / 1_440);
  const hours = Math.floor((totalMinutes % 1_440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatReleaseStamp() {
  return hasValidBuildTimestamp ? releaseFormatter.format(buildStartedAt) : "local build";
}

function updateHeroCopy() {
  const title = document.getElementById("hero-title");
  if (title && title.textContent !== "Aspiring Cloud & DevOps Engineer.") {
    title.textContent = "Aspiring Cloud & DevOps Engineer.";
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

function updateReleaseMetadata() {
  const releaseRow = Array.from(document.querySelectorAll<HTMLElement>(".status-list > div")).find(
    (row) => row.querySelector("dt")?.textContent?.trim().toLowerCase() === "release",
  );
  const value = releaseRow?.querySelector<HTMLElement>("dd");
  if (!releaseRow || !value) return;

  const releaseStamp = formatReleaseStamp();
  if (value.textContent !== releaseStamp) value.textContent = releaseStamp;
  releaseRow.setAttribute(
    "aria-label",
    hasValidBuildTimestamp
      ? `Frontend release built ${buildStartedAt.toLocaleString("en-US", { timeZone: "Asia/Manila" })} Manila time`
      : "Local frontend build",
  );
}

function updateReleaseAge() {
  const runtime = document.querySelector<HTMLElement>(".monitor-summary > div:first-child");
  if (!runtime) return;

  const label = runtime.querySelector<HTMLElement>("span");
  const value = runtime.querySelector<HTMLElement>("strong");
  if (!label || !value) return;

  if (label.textContent !== "release age") label.textContent = "release age";
  runtime.setAttribute(
    "aria-label",
    hasValidBuildTimestamp
      ? `Frontend release built ${buildStartedAt.toLocaleString("en-US", { timeZone: "Asia/Manila" })} Manila time`
      : "Local frontend build age",
  );

  const releaseAge = formatReleaseAge();
  if (value.textContent !== releaseAge) value.textContent = releaseAge;
}

function installComfort(attempt = 0) {
  const ready =
    document.getElementById("hero-title") &&
    document.querySelector(".hero-actions") &&
    document.querySelector(".monitor-summary") &&
    document.querySelector(".project-row");
  if (!ready && attempt < 30) {
    window.setTimeout(() => installComfort(attempt + 1), 50);
    return;
  }

  cleanupComfort?.();
  updateHeroCopy();
  bindProjectCards();
  updateReleaseMetadata();
  updateReleaseAge();

  const monitor = document.querySelector<HTMLElement>(".hero-status");
  const observer = monitor
    ? new MutationObserver(() => {
        updateReleaseMetadata();
        updateReleaseAge();
      })
    : null;
  observer?.observe(monitor as HTMLElement, { childList: true, subtree: true, characterData: true });

  const releaseAgeTimer = window.setInterval(updateReleaseAge, 30_000);
  cleanupComfort = () => {
    observer?.disconnect();
    window.clearInterval(releaseAgeTimer);
  };
}

window.requestAnimationFrame(() => installComfort());
