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

test("learning centre loads seeded subjects", async ({ page }) => {
  const response = await page.goto("/learn");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Learning Centre" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Mathematics/ }).first()).toBeVisible();
});

test("dashboard renders its main learning sections", async ({ page }) => {
  const response = await page.goto("/dashboard");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByRole("heading", { name: "Continue Learning" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quizzes and Tests" })).toBeVisible();
});

test("assistant page opens without a provider configured", async ({ page }) => {
  const response = await page.goto("/assistant");
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator("body")).not.toContainText("Application error");
  await expect(page.locator("body")).not.toContainText("Internal Server Error");
});
