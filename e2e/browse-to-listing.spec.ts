import { test, expect } from "@playwright/test";

test.describe("Browse → Listing detail", () => {
  test("loads browse page with at least 1 listing card", async ({ page }) => {
    await page.goto("/browse");

    // h1 renders immediately (outside Suspense)
    await expect(page.getByRole("heading", { name: /current offerings/i })).toBeVisible();

    // Listing cards are inside Suspense — wait for first card to resolve
    const cards = page.getByTestId("listing-card");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test("navigates to listing detail and shows Mane Score with buckets", async ({ page }) => {
    await page.goto("/browse");

    // Wait for Suspense-wrapped listing cards
    const firstCard = page.getByTestId("listing-card").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });
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
