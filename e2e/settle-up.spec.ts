import { expect, test, type Page } from "@playwright/test";

import { createBeachTripGroup } from "./helpers/groups";

async function createBeachTripWithLunch(page: Page) {
  await page.goto("/", { waitUntil: "load" });
  await createBeachTripGroup(page);

  await page.getByRole("button", { name: "Add Expense" }).click();
  const expenseFields = page.getByRole("textbox");
  await expenseFields.nth(0).fill("12.00");
  await expenseFields.nth(1).fill("Lunch");
  await page.getByRole("button", { name: "Alice" }).click();
  await page.getByRole("button", { name: "Save expense" }).click();

  await expect(page.getByText("+€6.00")).toBeVisible({ timeout: 30_000 });
}

test("recording a settlement moves balances toward zero", async ({ page }) => {
  test.setTimeout(60_000);

  await createBeachTripWithLunch(page);

  await page.getByRole("button", { name: "Settle Up" }).click();
  await page.getByRole("button", { name: "Bob pays Alice €6.00" }).click();

  await expect(page.getByTestId("balances-panel")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("+€6.00")).not.toBeVisible();
  await expect(page.getByText("-€6.00")).not.toBeVisible();
  await expect(page.getByText("Settlement")).toBeVisible();
});
