import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function stubPublicApi(page: import("@playwright/test").Page) {
  await page.route("**/api/health", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ status: "healthy", service: "portfolio-api", version: "test" }),
    }),
  );
  await page.route("**/api/GetVisitorCount", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify({ count: 42 }) }),
  );
  await page.route("**/api/AiChatAssistant", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        reply: "The Cloud-Backed Portfolio uses Azure Functions and Terraform.",
        sources: [],
        usage: { limit: 10, remaining: 9 },
      }),
    }),
  );
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewportWidth + 1);
}

test.describe("portfolio release browser gate", () => {
  test.beforeEach(async ({ page }) => {
    await stubPublicApi(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("keeps the desktop composition readable and contained", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop layout coverage only");

    await expect(page).toHaveTitle(/Jerome Christian V\. Ibon \| Aspiring Cloud & DevOps Engineer/);
    await expect(page.getByRole("heading", { name: "Jerome Christian Ibon" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(page.locator("#projects")).toBeVisible();
    await expect(page.locator("#skills")).toBeAttached();
    await expect(page.locator("#contact")).toBeAttached();
    await expectNoHorizontalOverflow(page);

    for (const title of ["Homelab GitOps Environment", "Cloud-Backed Portfolio", "MoniKey", "NOC Report Builder"]) {
      await expect(page.getByRole("heading", { level: 4, name: title })).toBeVisible();
    }
  });

  test("has no continuous decorative animation by default", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith("desktop"), "Desktop motion coverage only");

    await page.waitForTimeout(500);
    const infinite = await page.evaluate(
      () =>
        document.getAnimations().filter((animation) => animation.effect?.getComputedTiming().iterations === Infinity)
          .length,
    );
    expect(infinite).toBe(0);
  });

  test("captures the stable 1920px hero anchor", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-1920", "Stable visual anchor only");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot("hero-1920.png", {
      animations: "disabled",
      mask: [page.locator(".system-status"), page.locator(".visitor-count")],
    });
  });

  test("opens a case study from the static project index and restores focus", async ({ page }) => {
    const caseStudy = page.getByRole("button", { name: "View case study: Homelab GitOps Environment" });
    await caseStudy.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName("Homelab GitOps Environment");
    await expect(dialog).toHaveAccessibleDescription(/Kubernetes/);
    const dialogAxe = await new AxeBuilder({ page }).include("dialog").analyze();
    expect(dialogAxe.violations).toEqual([]);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(caseStudy).toBeFocused();
  });

  test("opens a skill inspection state with keyboard and passes axe", async ({ page }) => {
    await page.locator("#skills").scrollIntoViewIfNeeded();
    const skill = page.getByRole("button", { name: "Azure — inspect Cloud & virtualization" });
    await skill.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleName(/Cloud & virtualization/);
    const dialogAxe = await new AxeBuilder({ page }).include("dialog").analyze();
    expect(dialogAxe.violations).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(skill).toBeFocused();
  });

  test("switches theme and persists the choice", async ({ page }) => {
    const themeButton = page.getByRole("button", { name: /Switch to dark theme/ });
    await themeButton.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("passes the initial page accessibility scan", async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("mobile portfolio interactions", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("mobile"), "Mobile project coverage only");
    await stubPublicApi(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("supports navigation, static skills, contact, and no page overflow", async ({ page }) => {
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    const navAxe = await new AxeBuilder({ page }).include("#primary-nav").analyze();
    expect(navAxe.violations).toEqual([]);

    await page.getByRole("link", { name: "Toolkit", exact: true }).click();
    await expect(page.locator(".skill-group")).toHaveCount(6);
    await expect(page.locator(".skill-group").first()).toBeVisible();
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.getByRole("link", { name: "Email jeysibn@gmail.com" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Send email" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy email" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("supports project deep links and invalid values without breaking the page", async ({ page }) => {
    await page.goto("/?project=monikey", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveAccessibleName("MoniKey");
    await page.getByRole("button", { name: "Close system inspection" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole("button", { name: "View case study: Cloud-Backed Portfolio" }).click();
    await expect(page).toHaveURL(/\/\?project=cloud-portfolio$/);
    await page.goBack();
    await expect(page.getByRole("dialog")).toBeHidden();
    await page.goForward();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.goto("/?project=not-a-project", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Jerome Christian Ibon" })).toBeVisible();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });

  test("keeps assistant keyboard and accessibility states usable", async ({ page }) => {
    const trigger = page.getByRole("button", { name: /Ask this portfolio/ });
    await trigger.click();
    await expect(page.getByLabel("Your question")).toBeFocused();
    const assistantAxe = await new AxeBuilder({ page }).include(".portfolio-assistant").analyze();
    expect(assistantAxe.violations).toEqual([]);

    await page.getByLabel("Your question").fill("How does Jerome use Terraform?");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Azure Functions and Terraform.")).toBeVisible();
    await page.getByRole("button", { name: "Close assistant" }).click();
    await expect(trigger).toBeFocused();
  });

  test("keeps skills content readable with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator(".skill-group")).toHaveCount(6);
    await expect(page.getByText(/Select any skill/)).toBeVisible();
  });
});
