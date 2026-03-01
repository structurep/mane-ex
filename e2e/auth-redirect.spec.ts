import { test, expect } from "@playwright/test";

test.describe("Auth redirect", () => {
  test("unauthenticated /dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
  });
});
