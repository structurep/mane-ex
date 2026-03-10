import { test, expect } from "@playwright/test";

test.describe("Public pages smoke tests", () => {
  test("compare shows empty state without IDs", async ({ page }) => {
    await page.goto("/compare");
    await expect(
      page.getByRole("heading", { name: /compare horses/i })
    ).toBeVisible();
    await expect(
      page.getByText(/select 2-3 horses to compare/i)
    ).toBeVisible();
  });

  test("ISO browse renders heading", async ({ page }) => {
    await page.goto("/iso");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByText(/buyers are looking for specific horses/i)
    ).toBeVisible();
  });

  test("just-sold renders heading", async ({ page }) => {
    await page.goto("/just-sold");
    await expect(
      page.getByRole("heading", { name: /just sold/i })
    ).toBeVisible();
  });

  test("discover renders heading", async ({ page }) => {
    await page.goto("/discover");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("quiz renders intro", async ({ page }) => {
    await page.goto("/quiz");
    await expect(page.getByText(/60-SECOND QUIZ/i)).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /find your perfect plan/i })
    ).toBeVisible();
  });

  test("contact renders heading and form", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: /get in touch/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /send us a message/i })
    ).toBeVisible();
  });

  test("stories renders or shows empty state", async ({ page }) => {
    await page.goto("/stories");
    // Stories is a full-screen viewer — either content loads or empty state shows
    const content = page.locator("body");
    await expect(content).not.toBeEmpty();
  });
});
