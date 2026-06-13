import { expect, test } from "@playwright/test";

import { createBeachTripGroup } from "./helpers/groups";

test("adding an expense appends to the activity feed", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/", { waitUntil: "load" });
  await createBeachTripGroup(page);

  await page.getByRole("button", { name: "Add Expense" }).click();

  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill("12.00");
  await textboxes.nth(1).fill("Lunch");
  await page.getByRole("button", { name: "Alice" }).click();
  await page.getByRole("button", { name: "Save expense" }).click();

  await expect(page.getByTestId("activity-feed")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Alice paid €12.00 for Lunch")).toBeVisible();
});
