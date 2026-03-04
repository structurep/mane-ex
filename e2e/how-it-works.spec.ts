import { test, expect } from "@playwright/test";

test.describe("How It Works", () => {
  test("renders hero and key sections", async ({ page }) => {
    await page.goto("/how-it-works");

    // Hero h1 (text split by <br>)
    await expect(
      page.getByRole("heading", {
        name: /everything you need to.*buy or sell/i,
      })
    ).toBeVisible();

    // Key feature section headings
    await expect(
      page.getByRole("heading", { name: "Mane Score" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "ManeVault" })
    ).toBeVisible();
  });

  test("FAQ accordion works", async ({ page }) => {
    await page.goto("/how-it-works");

    // Target the specific FAQ question text
    const question = page.getByText(
      "How long does the escrow process take?"
    );
    await question.scrollIntoViewIfNeeded();
    await expect(question).toBeVisible();
    await question.click();

    // Verify answer contains expected text
    await expect(
      page.getByText(/buyer has 5 days to inspect/i)
    ).toBeVisible();
  });
});
