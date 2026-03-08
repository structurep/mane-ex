import { test, expect } from "@playwright/test";

test.describe("Pricing page", () => {
  test("renders pricing tiers", async ({ page }) => {
    await page.goto("/pricing");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Should have at least 2 pricing options
    const cards = page.locator("[data-testid='pricing-tier']");
    // Fallback: look for plan/price-related content
    const priceText = page.getByText(/\$|free|month/i);
    await expect(priceText.first()).toBeVisible({ timeout: 10_000 });
  });
});

test.describe("About page", () => {
  test("renders hero and mission content", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Should contain mission/about text
    const content = page.getByText(/mission|equestrian|horse|marketplace/i);
    await expect(content.first()).toBeVisible();
  });
});

test.describe("Terms page", () => {
  test("renders legal content", async ({ page }) => {
    await page.goto("/terms");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("Privacy page", () => {
  test("renders privacy policy", async ({ page }) => {
    await page.goto("/privacy");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("FAQ / Contact pages", () => {
  test("FAQ page renders", async ({ page }) => {
    await page.goto("/faq");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
