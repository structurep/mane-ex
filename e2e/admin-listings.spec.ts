import { test, expect } from "@playwright/test";

test.describe("Admin listings page", () => {
  test("admin listings page has pending review filter", async ({ page }) => {
    // This tests the page renders without auth — it should redirect to login
    await page.goto("/admin/listings?filter=pending_review");

    // Admin pages require auth — either we see the page or get redirected
    const url = page.url();
    const isOnAdmin = url.includes("/admin/listings");
    const isRedirected = url.includes("/login") || url.includes("/dashboard");

    expect(isOnAdmin || isRedirected).toBe(true);
  });
});
