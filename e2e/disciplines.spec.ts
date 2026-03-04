import { test, expect } from "@playwright/test";

test.describe("Disciplines", () => {
  test("lists all discipline cards", async ({ page }) => {
    await page.goto("/disciplines");

    await expect(
      page.getByRole("heading", { name: /browse by discipline/i })
    ).toBeVisible();

    // All 6 disciplines visible (use actual names from source)
    for (const name of [
      "Hunter/Jumper",
      "Dressage",
      "Eventing",
      "Western",
      "Trail & Pleasure",
      "Breeding Stock",
    ]) {
      await expect(
        page.getByRole("heading", { name, exact: true })
      ).toBeVisible();
    }
  });

  test("clicking a discipline navigates to detail page", async ({ page }) => {
    await page.goto("/disciplines");

    await page
      .getByRole("heading", { name: "Hunter/Jumper", exact: true })
      .click();
    await expect(page).toHaveURL(/\/disciplines\/hunter-jumper/);
  });

  test("discipline detail renders tagline and content", async ({ page }) => {
    await page.goto("/disciplines/hunter-jumper");

    await expect(
      page.getByText(/find your next partner over fences/i)
    ).toBeVisible();

    // Popular breeds section
    await expect(page.getByText("Warmblood")).toBeVisible();

    // Browse CTA button
    await expect(
      page.getByRole("link", { name: /browse hunter\/jumper/i })
    ).toBeVisible();
  });
});
