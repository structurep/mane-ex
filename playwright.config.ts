import { defineConfig } from "@playwright/test";
import path from "path";

const SELLER_STORAGE = path.join(__dirname, "e2e", ".auth", "seller.json");
const BUYER_STORAGE = path.join(__dirname, "e2e", ".auth", "buyer.json");

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3002",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 3002",
    url: "http://localhost:3002",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    // Auth setup — runs first, creates storage state files
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { browserName: "chromium" },
    },
    // Public pages — no auth required
    {
      name: "chromium",
      use: { browserName: "chromium" },
      testIgnore: /auth\.setup\.ts|\.authed\./,
    },
    // Authenticated tests (as seller)
    {
      name: "seller-authed",
      use: {
        browserName: "chromium",
        storageState: SELLER_STORAGE,
      },
      testMatch: /\.seller\.authed\./,
      dependencies: ["setup"],
    },
    // Authenticated tests (as buyer)
    {
      name: "buyer-authed",
      use: {
        browserName: "chromium",
        storageState: BUYER_STORAGE,
      },
      testMatch: /\.buyer\.authed\./,
      dependencies: ["setup"],
    },
  ],
});
