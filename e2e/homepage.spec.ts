import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero heading and new sections", async ({ page }) => {
    await page.goto("/");

    // Hero overline
    await expect(page.getByText("THE EQUESTRIAN MARKETPLACE")).toBeVisible();

    // Hero h1 (split across lines with <br>)
    await expect(
      page.getByRole("heading", { name: /find your.*next partner/i })
    ).toBeVisible();

    // ISO Banner section
    await expect(
      page.getByRole("heading", { name: /looking for a horse/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /have a horse to sell/i })
    ).toBeVisible();

    // Platform Features section
    await expect(
      page.getByRole("heading", {
        name: /everything you need\. one platform/i,
      })
    ).toBeVisible();

    // Comparison section
    await expect(
      page.getByRole("heading", {
        name: /a better way to find your horse/i,
      })
    ).toBeVisible();
    await expect(page.getByText("The old way")).toBeVisible();
    await expect(page.getByText("The ManeExchange way")).toBeVisible();

    // Testimonials
    await expect(
      page.getByRole("heading", { name: /loved by riders everywhere/i })
    ).toBeVisible();

    // Bottom CTA
    await expect(
      page.getByRole("heading", { name: /your next horse is waiting/i })
    ).toBeVisible();
  });

  test("renders featured listings when data exists", async ({ page }) => {
    await page.goto("/");

    // Featured listings section (only renders if Supabase returns listings)
    const featuredHeading = page.getByRole("heading", {
      name: /featured listings/i,
    });
    const isVisible = await featuredHeading.isVisible().catch(() => false);

    if (isVisible) {
      // At least one listing link in the featured section
      const listingLinks = page.locator('a[href^="/horses/"]');
      await expect(listingLinks.first()).toBeVisible({ timeout: 15_000 });
    }
  });

  test("navigates to browse from hero CTA", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /browse horses/i }).first().click();
    await expect(page).toHaveURL(/\/browse/);
  });

  test("clicking a featured listing navigates to detail", async ({ page }) => {
    await page.goto("/");

    const listingLink = page.locator('a[href^="/horses/"]').first();
    const isVisible = await listingLink
      .isVisible({ timeout: 5_000 })
      .catch(() => false);

    if (isVisible) {
      await listingLink.click();
      await expect(page).toHaveURL(/\/horses\/.+/);
    }
  });
});
