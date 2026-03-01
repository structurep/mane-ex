import { test, expect } from "@playwright/test";

test.describe("Auth redirect", () => {
  test("unauthenticated /dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "commit" });

    // Middleware redirects unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
  });
});
