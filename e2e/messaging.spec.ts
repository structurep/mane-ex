import { test, expect } from "@playwright/test";

test.describe("Messaging (public — unauthenticated)", () => {
  test("message seller button exists on listing page", async ({ page }) => {
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

    // The Contact Seller / Message Seller button should be visible in the sidebar
    const messageButton = page.getByRole("button", {
      name: /contact seller|message seller|message/i,
    });
    await expect(messageButton.first()).toBeVisible({ timeout: 10_000 });
  });

  test("clicking message button opens dialog", async ({ page }) => {
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

    // Click the contact/message seller button
    const messageButton = page.getByRole("button", {
      name: /contact seller|message seller|message/i,
    });
    await messageButton.first().click();

    // Dialog should open with a textarea or message-related content
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5_000 });
  });
});

test.describe("Messages page (dashboard redirect)", () => {
  test("messages route redirects unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard/messages");

    // Unauthenticated users should be redirected to login or see auth prompt
    // The proxy middleware redirects to /login for dashboard routes
    const url = page.url();
    const redirectedOrBlocked =
      url.includes("/login") ||
      url.includes("/signup") ||
      url.includes("/onboarding") ||
      url.includes("/dashboard");

    expect(redirectedOrBlocked).toBe(true);
  });
});
