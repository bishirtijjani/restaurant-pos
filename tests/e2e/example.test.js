import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("/");
  // This will fail if the server isn't running or doesn't have the expected title,
  // but it verifies the E2E setup works.
  await expect(page).toHaveTitle(/Restaurant/);
});
