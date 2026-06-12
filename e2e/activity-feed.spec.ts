import { expect, test, type Page } from "@playwright/test";

async function createBeachTripGroup(page: Page) {
  await page.goto("/", { waitUntil: "load" });

  await page.getByRole("button", { name: "New Group" }).click();
  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill("Beach trip");
  await textboxes.nth(2).fill("Alice, Bob");
  await page.getByRole("button", { name: "Create group" }).click();

  await expect(page.getByText("Beach trip")).toBeVisible({ timeout: 30_000 });
  await page.getByText("Beach trip").click();
}

test("adding an expense appends to the activity feed", async ({ page }) => {
  test.setTimeout(60_000);

  await createBeachTripGroup(page);

  await page.getByRole("button", { name: "Add Expense" }).click();
  const expenseFields = page.getByRole("textbox");
  await expenseFields.nth(0).fill("12.00");
  await expenseFields.nth(1).fill("Lunch");
  await page.getByRole("button", { name: "Alice" }).click();
  await page.getByRole("button", { name: "Save expense" }).click();

  await expect(page.getByTestId("activity-feed")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Alice paid €12.00 for Lunch")).toBeVisible();
});
