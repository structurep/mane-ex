import { test, expect } from "@playwright/test";

test.describe("Browse → Listing detail", () => {
  test("loads browse page with at least 1 listing card", async ({ page }) => {
    await page.goto("/browse");
    await expect(page.getByRole("heading", { name: /current offerings/i })).toBeVisible();

    const cards = page.locator('a[href^="/horses/"]');
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test("navigates to listing detail and shows Mane Score with buckets", async ({ page }) => {
    await page.goto("/browse");

    const firstCard = page.locator('a[href^="/horses/"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    await expect(page).toHaveURL(/\/horses\/.+/);

    // Mane Score total
    await expect(page.getByText(/\d{2,4}\/1000/)).toBeVisible();

    // Bucket labels
    await expect(page.getByText("Core listing info")).toBeVisible();
    await expect(page.getByText("Performance & pedigree depth")).toBeVisible();
    await expect(page.getByText("Health & transparency")).toBeVisible();
    await expect(page.getByText("Photos & video completeness")).toBeVisible();
  });
});
