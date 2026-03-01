import { test, expect } from "@playwright/test";

test.describe("Public barn page", () => {
  let barnSlug: string;
  let barnName: string;

  test.beforeAll(async ({ request }) => {
    const res = await request.get("/api/public/barns");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.barns.length).toBeGreaterThanOrEqual(1);

    barnSlug = body.barns[0].slug;
    barnName = body.barns[0].name;
  });

  test("API returns barns with safe fields only", async ({ request }) => {
    const res = await request.get("/api/public/barns");
    const body = await res.json();

    for (const barn of body.barns) {
      const keys = Object.keys(barn).sort();
      expect(keys).toEqual(["id", "name", "slug"]);
    }
  });

  test("barn page renders with correct wording", async ({ page }) => {
    await page.goto(`/farms/${barnSlug}`);

    await expect(page.getByRole("heading", { level: 1, name: barnName })).toBeVisible();
    await expect(page.getByText("BARN OWNER", { exact: true })).toBeVisible();
    expect(await page.getByText("FARM OWNER", { exact: true }).count()).toBe(0);
  });
});
