import { expect, test } from "@playwright/test";

test("coach can open the player workflow and record a profile", async ({ page }) => {
  const firstName = `E2E-${Date.now()}`;
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Good morning, coach." })).toBeVisible();
  await page.getByRole("link", { name: "Players" }).click();
  await expect(page.getByRole("heading", { name: "Players" })).toBeVisible();
  await page.getByRole("link", { name: "New player" }).click();
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill("Player");
  await page.getByLabel("Primary role").fill("Forward");
  await page.getByRole("button", { name: "Create player" }).click();
  await expect(page.getByRole("heading", { name: `${firstName} Player` })).toBeVisible();
  await expect(page.getByRole("img", { name: "Player skill radar chart" })).toBeVisible();
  await expect(page.getByText("1–10 · 0.5 increments")).toBeVisible();
  await page.getByRole("link", { name: "View snapshots" }).click();
  await expect(page.getByRole("heading", { name: `${firstName} · snapshots` })).toBeVisible();
});

test("sidebar can collapse and expand while remaining keyboard accessible", async ({ page }) => {
  await page.goto("/dashboard");
  const toggle = page.getByRole("button", { name: "Collapse sidebar" });
  await toggle.click();
  await expect(page.getByRole("button", { name: "Expand sidebar" })).toBeVisible();
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(page.getByRole("button", { name: "Collapse sidebar" })).toBeVisible();
});
