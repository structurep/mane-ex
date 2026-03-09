import { test as setup, expect } from "@playwright/test";
import path from "path";

const SELLER_STORAGE = path.join(__dirname, ".auth", "seller.json");
const BUYER_STORAGE = path.join(__dirname, ".auth", "buyer.json");

async function loginAs(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  // Default mode is "password" — fill email and password
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("Test1234!");
  await page.getByRole("button", { name: "Sign In" }).click();
  // Wait for redirect to dashboard (auth success)
  await expect(page).toHaveURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });
}

/**
 * Authenticate as seller@test.com and save browser state.
 */
setup("authenticate as seller", async ({ page }) => {
  await loginAs(page, "seller@test.com");
  await page.context().storageState({ path: SELLER_STORAGE });
});

/**
 * Authenticate as buyer@test.com and save browser state.
 */
setup("authenticate as buyer", async ({ page }) => {
  await loginAs(page, "buyer@test.com");
  await page.context().storageState({ path: BUYER_STORAGE });
});
