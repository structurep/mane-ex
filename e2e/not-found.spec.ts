import { test, expect } from "@playwright/test";

test.describe("404 page", () => {
  test("renders custom not-found page for invalid routes", async ({ page }) => {
    const response = await page.goto("/this-page-definitely-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByText(/got away|not found/i)).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: /browse/i })).toBeVisible();
  });
});
