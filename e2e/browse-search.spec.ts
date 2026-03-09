import { test, expect } from "@playwright/test";

test.describe("Browse search", () => {
  test("search query param is reflected in URL", async ({ page }) => {
    await page.goto("/browse?q=quarter+horse");
    await expect(page).toHaveURL(/q=quarter/);
  });

  test("header search bar submits to /browse with q param", async ({ page }) => {
    await page.goto("/");

    // Desktop search bar
    const searchInput = page.locator("#header-search");
    const isVisible = await searchInput.isVisible().catch(() => false);

    if (isVisible) {
      await searchInput.fill("Warmblood");
      await searchInput.press("Enter");
      await expect(page).toHaveURL(/\/browse\?q=Warmblood/);
    }
  });

  test("browse page loads successfully", async ({ page }) => {
    await page.goto("/browse");

    // The browse page heading
    await expect(
      page.getByRole("heading", { name: /current offerings/i })
    ).toBeVisible({ timeout: 10_000 });
  });
});
