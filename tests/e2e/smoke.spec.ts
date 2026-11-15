import { expect, test } from "@playwright/test";

test("landing page renders and theme toggle responds", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("h1").first()).toContainText("HELIXEDU");

  const themeToggle = page.getByRole("button", { name: "Toggle light and dark theme" });
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "cosmos");
});

test("legacy learning routes open the device-only workspace", async ({ page }) => {
  await page.goto("/learn");
  await expect(page).toHaveURL(/\/demo\?tab=learn/);
  await expect(page.getByRole("heading", { name: "Choose a lesson" })).toBeVisible();

  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/demo\?tab=overview/);
  await expect(page.getByText(/DEVICE-ONLY MODE/)).toBeVisible();
});

test("lesson completion and notes persist in IndexedDB", async ({ page }) => {
  await page.goto("/demo?tab=learn");
  await page.getByRole("button", { name: /Mark lesson complete/ }).click();
  await expect(page.getByText(/lessons completed/i).first()).toBeVisible();

  await page.getByRole("button", { name: /Notes/ }).click();
  await page.getByPlaceholder("Note title").fill("Local test note");
  await page.getByPlaceholder("Write your study notes…").fill("This note stays in IndexedDB.");
  await page.getByRole("button", { name: "Save note on device" }).click();
  await expect(page.getByText("Local test note")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Notes/ }).click();
  await expect(page.getByText("Local test note")).toBeVisible();
});

test("local assistant responds without an API key", async ({ page }) => {
  await page.goto("/demo?tab=assistant");
  await page.getByPlaceholder("Ask Helix a question…").fill("What is 2 + 2?");
  await page.getByRole("button", { name: "Ask Helix" }).click();
  await expect(page.getByText(/4/).last()).toBeVisible();
  await expect(page.getByText("NO API KEY · NO SERVER CHAT STORAGE")).toBeVisible();
});

test("backup export downloads a JSON file", async ({ page }) => {
  await page.goto("/demo?tab=settings");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^helixedu-device-backup-.*\.json$/);
});

test("health endpoint does not require a database", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({ ok: true, storage: "device-only" });
});

test("bookmarks, achievements and study plans are device-local", async ({ page }) => {
  await page.goto("/demo?tab=learn");
  await page.getByRole("button", { name: "Save lesson" }).click();
  await expect(page.getByRole("button", { name: "🔖 Saved" }).last()).toBeVisible();
  await page.getByRole("navigation", { name: "HELIXEDU sections" }).getByRole("button", { name: /Saved/ }).click();
  await expect(page.getByRole("heading", { name: "Saved lessons" })).toBeVisible();
  await expect(page.getByText("Understanding and Operating on Fractions")).toBeVisible();

  await page.goto("/demo?tab=overview");
  await expect(page.getByRole("heading", { name: "Achievements" })).toBeVisible();

  await page.goto("/demo?tab=planner");
  const title = page.getByRole("textbox").first();
  await title.fill("Offline revision plan");
  await page.getByRole("button", { name: "Save study plan" }).click();
  const task = page.getByRole("checkbox", { name: "Complete one lesson" });
  await expect(task).toBeVisible();
  await task.check();
  await expect(page.getByText("Plan task saved on this device.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "Complete one lesson" })).toBeChecked();
});

test("study reminders persist on this device", async ({ page }) => {
  await page.goto("/demo?tab=reminders");
  await page.getByLabel("Reminder label").fill("Read science");
  await page.getByLabel("Reminder time").fill("19:15");
  await page.getByRole("button", { name: "Add reminder" }).click();
  await expect(page.getByText("Read science")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Read science")).toBeVisible();
});
