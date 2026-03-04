import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero heading and featured listings section", async ({
    page,
  }) => {
    await page.goto("/");

    // Hero h1 (split across lines with <br>)
    await expect(
      page.getByRole("heading", { name: /find your.*next partner/i })
    ).toBeVisible();

    // Featured listings section (only renders if Supabase returns listings)
    await expect(
      page.getByRole("heading", { name: /featured listings/i })
    ).toBeVisible({ timeout: 15_000 });

    // At least one listing link in the featured section
    const listingLinks = page.locator('a[href^="/horses/"]');
    await expect(listingLinks.first()).toBeVisible({ timeout: 15_000 });
  });

  test("navigates to browse from hero CTA", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /browse horses/i }).first().click();
    await expect(page).toHaveURL(/\/browse/);
  });

  test("clicking a featured listing navigates to detail", async ({ page }) => {
    await page.goto("/");

    const listingLink = page.locator('a[href^="/horses/"]').first();
    await expect(listingLink).toBeVisible({ timeout: 15_000 });
    await listingLink.click();

    await expect(page).toHaveURL(/\/horses\/.+/);
  });
});
