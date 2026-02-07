import { test, expect } from "@playwright/test";

// Simple helper to create a fake JWT that jwt-decode can read
const createFakeToken = () => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      id: "u1",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour in future
    }),
  );
  return `${header}.${payload}.signature`;
};

test.describe("POS Flow - Diagnostic", () => {
  test("Check what is going on", async ({ page }) => {
    // Capture all network requests
    const requests = [];
    page.on("request", (req) => {
      requests.push(req.url());
      if (req.url().includes("api")) {
        console.log("API REQ:", req.method(), req.url());
      }
    });

    const token = createFakeToken();

    // Pre-set activeStoreId and token in localStorage
    await page.addInitScript(
      ({ token }) => {
        localStorage.setItem("activeStoreId", "s1");
        localStorage.setItem("token", token);
      },
      { token },
    );

    // Mock API for current user
    await page.route("**/api/auth/me", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: {
            id: "u1",
            fullname: "Test User",
            email: "test@example.com",
            role: "admin",
            stores: [{ storeId: "s1", role: "admin" }],
          },
        }),
      }),
    );

    await page.route("**/api/auth/refresh", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, token: token }),
      }),
    );

    await page.route("**/api/stores", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: [{ _id: "s1", name: "Test Store" }],
        }),
      }),
    );

    await page.route("**/api/general-settings", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { currency: { symbol: "$" } },
        }),
      }),
    );

    await page.route("**/api/menu-items", (route) => {
      console.log("OBSERVED REQUEST TO /api/menu-items");
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            _id: "m1",
            name: "Burger",
            price: 10,
            category: "Food",
            isAvailable: true,
          },
        ]),
      });
    });

    await page.route("**/api/categories", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([{ _id: "c1", name: "Food" }]),
      }),
    );

    await page.route("**/api/tables*", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: [] }),
      }),
    );

    // Navigate
    await page.goto("/app/pos");

    // Wait for something to appear
    console.log("Waiting for Current Order...");
    await expect(page.getByText("Current Order")).toBeVisible({
      timeout: 15000,
    });

    // Look for Burger
    console.log("Checking for Burger...");
    const hasBurger = await page.getByText("Burger").isVisible();
    console.log("Burger visible?", hasBurger);

    if (!hasBurger) {
      // Try to find ANY text that might be an error
      console.log(
        "No Burger. Requests seen:",
        requests.filter((r) => r.includes("api")),
      );
      const textContent = await page.textContent("body");
      console.log("Body text snippet:", textContent.substring(0, 500));
    }

    await expect(page.getByText("Burger")).toBeVisible({ timeout: 5000 });
  });
});
