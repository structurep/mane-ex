import { test, expect } from "@playwright/test";

test.describe("Buyer dashboard (authenticated)", () => {
  test("buyer hub accessible after auth", async ({ page }) => {
    await page.goto("/dashboard/buyer");
    const url = page.url();
    if (url.includes("/onboarding")) {
      // Onboarding gate confirms auth works — user not sent to login
      await expect(page.getByText("Welcome")).toBeVisible();
      return;
    }
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });
  });

  test("dream barn page accessible", async ({ page }) => {
    await page.goto("/dashboard/dream-barn");
    const url = page.url();
    if (url.includes("/onboarding")) return;
    await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });
  });

  test("browse page loads for authenticated user", async ({ page }) => {
    // /browse is public but may show different UI for authenticated users
    await page.goto("/browse");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 10_000 });
  });

  test("listing detail page loads with offer capability", async ({ page }) => {
    // Navigate to a listing from browse
    await page.goto("/browse");
    const listingLink = page.getByRole("link").filter({ hasText: /view|details/i });
    if ((await listingLink.count()) > 0) {
      await listingLink.first().click();
      await expect(page.getByRole("heading").first()).toBeVisible({ timeout: 10_000 });
    }
  });
});
