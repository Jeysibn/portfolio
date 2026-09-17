import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("portfolio UI smoke coverage", () => {
  test("loads the recruiter path without automatic accessibility violations", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Jerome Ibon" })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("supports mobile menu escape and section navigation", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden();

    await menu.click();
    await page.getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/#projects$/);
  });

  test("keeps project outcomes visible and project selection usable", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator(".system-dossier.is-active .project-notes")).toBeVisible();

    await page.getByRole("button", { name: /Select system 02:/ }).click();
    await expect(page.locator(".system-dossier.is-active h3")).toHaveText(
      "Homelab GitOps Environment",
    );
  });

  test("restores focus when the assistant closes", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const trigger = page.getByRole("button", { name: /Ask this portfolio/ });
    await trigger.click();
    await expect(page.getByLabel("Your question")).toBeFocused();

    await page.getByRole("button", { name: "Close assistant" }).click();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });
});
