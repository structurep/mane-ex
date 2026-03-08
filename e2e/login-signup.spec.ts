import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("renders login form with trust badges", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByText(/encrypted/i)).toBeVisible();
  });

  test("shows link to signup", async ({ page }) => {
    await page.goto("/login");

    const signupLink = page.getByRole("link", { name: /sign up/i });
    await expect(signupLink).toBeVisible();
  });
});

test.describe("Signup page", () => {
  test("renders signup form", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
  });

  test("shows link to login", async ({ page }) => {
    await page.goto("/signup");

    const loginLink = page.getByRole("link", { name: /log in/i });
    await expect(loginLink).toBeVisible();
  });
});
