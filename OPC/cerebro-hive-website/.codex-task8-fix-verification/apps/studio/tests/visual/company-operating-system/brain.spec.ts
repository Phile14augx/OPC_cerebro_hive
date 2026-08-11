import { expect, test } from "@playwright/test";
import { mockCompanyOperatingSystemDemo } from '../../company-operating-system-demo';

test.describe("company brain visual regression", () => {
  test.use({ colorScheme: "dark" });

  test("explicit demo graph retains its dynamic UI at each supported viewport", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockCompanyOperatingSystemDemo(page);
    await page.goto("/app/brain?mode=demo");

    await expect(page.getByText("DEMO DATA")).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Search company brain" })).toBeVisible();
    await expect(page).toHaveScreenshot("company-brain-demo.png", { fullPage: true });
  });
});
