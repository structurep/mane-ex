import { test, expect } from "@playwright/test";

test.describe("Listing wizard", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/dashboard/listings/new", { waitUntil: "commit" });

    // Should redirect to login since user is not authenticated
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
