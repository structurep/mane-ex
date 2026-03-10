import { test, expect } from "@playwright/test";

test.describe("Feature preview (coming soon) pages", () => {
  test("trainers directory renders heading", async ({ page }) => {
    await page.goto("/trainers");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("trainers/[id] returns 404", async ({ page }) => {
    const response = await page.goto("/trainers/fake-id");
    expect(response?.status()).toBe(404);
  });

  test("market intelligence shows feature preview", async ({ page }) => {
    await page.goto("/market");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Market Intelligence is coming soon")).toBeVisible();
    await expect(page.getByText("Browse Current Listings")).toBeVisible();
  });

  test("shipping shows feature preview", async ({ page }) => {
    await page.goto("/shipping");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Transport coordination is coming soon")).toBeVisible();
  });

  test("valuation shows how-it-works and feature preview", async ({ page }) => {
    await page.goto("/valuation");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("How it works").first()).toBeVisible();
    await expect(page.getByText("Enter your horse's details")).toBeVisible();
    await expect(page.getByText("ManeEstimate is launching soon")).toBeVisible();
  });

  test("recommendations shows feature preview", async ({ page }) => {
    await page.goto("/recommendations");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/ManeMatch.*coming soon/i)).toBeVisible();
  });

  test("insurance shows educational content and feature preview", async ({ page }) => {
    await page.goto("/insurance");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Educational coverage types preserved
    await expect(page.getByText("Mortality Insurance")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Major Medical" })).toBeVisible();
    // Feature preview — no fake providers
    await expect(page.getByText("Insurance Marketplace is coming soon")).toBeVisible();
    // No dead "Get Quote" buttons
    await expect(page.getByText("Get Quote")).not.toBeVisible();
  });

  test("financing shows educational content and feature preview", async ({ page }) => {
    await page.goto("/financing");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Educational financing options preserved
    await expect(page.getByText("Traditional Loan")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lease-to-Own" })).toBeVisible();
    // Feature preview — no fake lenders
    await expect(page.getByText("Financing Partners is coming soon")).toBeVisible();
    // No dead "Apply Now" buttons
    await expect(page.getByText("Apply Now")).not.toBeVisible();
  });

  test("learn shows guide descriptions and feature preview", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Guide descriptions preserved
    await expect(page.getByText("The Buyer's Handbook")).toBeVisible();
    await expect(page.getByText("The Seller's Playbook")).toBeVisible();
    // Feature preview — no dead article links
    await expect(page.getByText("Learning Center is coming soon")).toBeVisible();
    // No href="#" links
    const deadLinks = page.locator('a[href="#"]');
    await expect(deadLinks).toHaveCount(0);
  });

  test("conformation shows educational content and feature preview", async ({ page }) => {
    await page.goto("/conformation");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Conformation Analysis is coming soon")).toBeVisible();
  });
});
