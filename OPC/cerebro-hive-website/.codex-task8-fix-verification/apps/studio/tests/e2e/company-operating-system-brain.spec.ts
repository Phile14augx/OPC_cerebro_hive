import { expect, test } from "@playwright/test";
import { mockCompanyOperatingSystemDemo } from '../company-operating-system-demo';

test("brain search, focus, select, and inspector", async ({ page }) => {
  await mockCompanyOperatingSystemDemo(page);
  await page.goto("/app/brain?mode=demo");

  await expect(page.getByText("DEMO DATA")).toBeVisible();
  await page.getByRole("searchbox", { name: "Search company brain" }).fill("Research");
  await page.getByRole("button", { name: "Department: Research" }).dblclick();
  await page.getByRole("button", { name: /Agent:/ }).first().click();

  await expect(page.getByRole("dialog", { name: /entity detail/i })).toBeVisible();
});
