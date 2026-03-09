import { test, expect } from "@playwright/test";

test.describe("Listing detail page", () => {
  test("navigates to a listing from browse and shows horse name", async ({ page }) => {
    await page.goto("/browse");

    // Wait for listings to load, then click the first listing link
    const listingLink = page.locator('a[href^="/horses/"]').first();
    const isVisible = await listingLink
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!isVisible) {
      test.skip(true, "No listings available in browse to navigate to");
      return;
    }

    await listingLink.click();
    await expect(page).toHaveURL(/\/horses\/.+/);

    // Horse name should be visible as h1
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("tab navigation exists with expected tabs", async ({ page }) => {
    // Navigate to a listing via browse
    await page.goto("/browse");
    const listingLink = page.locator('a[href^="/horses/"]').first();
    const isVisible = await listingLink
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!isVisible) {
      test.skip(true, "No listings available");
      return;
    }

    await listingLink.click();
    await expect(page).toHaveURL(/\/horses\/.+/);

    // Tab triggers should be present
    await expect(page.getByRole("tab", { name: /basics/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByRole("tab", { name: /performance/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /health/i })
    ).toBeVisible();
    await expect(page.getByRole("tab", { name: /media/i })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: /seller/i })
    ).toBeVisible();
  });

  test("price sidebar is visible on desktop", async ({ page }) => {
    // Set a desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto("/browse");
    const listingLink = page.locator('a[href^="/horses/"]').first();
    const isVisible = await listingLink
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!isVisible) {
      test.skip(true, "No listings available");
      return;
    }

    await listingLink.click();
    await expect(page).toHaveURL(/\/horses\/.+/);

    // Price text should be visible (either dollar amount or "Contact for price")
    const priceText = page.getByText(/\$[\d,]+|contact for price/i);
    await expect(priceText.first()).toBeVisible({ timeout: 10_000 });
  });

  test("Mane Score section is visible", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto("/browse");
    const listingLink = page.locator('a[href^="/horses/"]').first();
    const isVisible = await listingLink
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!isVisible) {
      test.skip(true, "No listings available");
      return;
    }

    await listingLink.click();
    await expect(page).toHaveURL(/\/horses\/.+/);

    // Mane Score total should be visible via data-testid
    const maneScore = page.locator('[data-testid="mane-score-total"]');
    await expect(maneScore).toBeVisible({ timeout: 10_000 });

    // Score should show format like "XXX/1000"
    await expect(maneScore).toHaveText(/\d+\/1000/);
  });

  test("Digital Passport link exists", async ({ page }) => {
    await page.goto("/browse");
    const listingLink = page.locator('a[href^="/horses/"]').first();
    const isVisible = await listingLink
      .isVisible({ timeout: 10_000 })
      .catch(() => false);

    if (!isVisible) {
      test.skip(true, "No listings available");
      return;
    }

    await listingLink.click();
    await expect(page).toHaveURL(/\/horses\/.+/);

    // Digital Passport link should be in the Basics tab (default)
    const passportLink = page.getByText(/view digital passport/i);
    await expect(passportLink).toBeVisible({ timeout: 10_000 });

    // It should link to the passport subpage
    const passportAnchor = page.locator('a[href*="/passport"]');
    await expect(passportAnchor).toBeVisible();
  });
});
