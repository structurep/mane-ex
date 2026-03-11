import { test, expect } from "@playwright/test";

test.describe("Sell page", () => {
  test("renders hero, steps, and stats", async ({ page }) => {
    await page.goto("/sell");

    // Hero
    await expect(
      page.getByRole("heading", { name: /sell smarter/i })
    ).toBeVisible();

    // How it works section with 6 steps
    await expect(
      page.getByRole("heading", { name: /how it works/i })
    ).toBeVisible();
    await expect(page.getByText("Create Your Account")).toBeVisible();
    await expect(page.getByText("Hit Publish")).toBeVisible();

    // Differentiators bar
    await expect(
      page.getByText("Escrow protection", { exact: true })
    ).toBeVisible();
  });

  test("FAQ accordion expands on click", async ({ page }) => {
    await page.goto("/sell");

    const firstQuestion = page.getByText(
      "How long does it take to list a horse?"
    );
    await expect(firstQuestion).toBeVisible();
    await firstQuestion.click();

    await expect(
      page.getByText(/most sellers complete their first listing/i)
    ).toBeVisible();
  });

  test("value props section renders", async ({ page }) => {
    await page.goto("/sell");

    // Use heading role to target the value prop h3 specifically
    await expect(
      page.getByRole("heading", { name: "Transparency Score" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Verified Documents" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Secure Payments" })
    ).toBeVisible();
  });
});
