import { test, expect } from "@playwright/test";

test.describe("Dashboard pages redirect to login when unauthenticated", () => {
  const protectedPaths = [
    "/dashboard",
    "/dashboard/buyer",
    "/dashboard/trainer",
    "/dashboard/documents",
    "/dashboard/analytics",
    "/dashboard/messages",
    "/dashboard/offers",
    "/dashboard/settings",
    "/dashboard/notifications",
  ];

  for (const path of protectedPaths) {
    test(`${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    });
  }
});
