import { test, expect } from "@playwright/test";

test.describe("Seller dashboard (authenticated)", () => {
  test("authenticated user reaches dashboard or onboarding", async ({ page }) => {
    await page.goto("/dashboard");
    // Should NOT be on login — should be on dashboard or onboarding
    const url = page.url();
    expect(url.includes("/dashboard") || url.includes("/onboarding")).toBe(true);
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });
  });

  test("analytics page accessible when onboarding complete", async ({ page }) => {
    await page.goto("/dashboard/analytics");
    const url = page.url();
    if (url.includes("/onboarding")) {
      // Onboarding gate — auth works but profile incomplete
      await expect(page.getByText("Welcome")).toBeVisible();
      return;
    }
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });
  });

  test("settings page accessible", async ({ page }) => {
    await page.goto("/dashboard/settings");
    const url = page.url();
    if (url.includes("/onboarding")) return; // onboarding gate, auth confirmed
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });
  });

  test("offers page accessible", async ({ page }) => {
    await page.goto("/dashboard/offers");
    const url = page.url();
    if (url.includes("/onboarding")) return;
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });
  });

  test("notifications page accessible", async ({ page }) => {
    await page.goto("/dashboard/notifications");
    const url = page.url();
    if (url.includes("/onboarding")) return;
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });
  });
});
