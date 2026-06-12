import { expect, test, type Page } from "@playwright/test";

async function createBeachTripWithLunch(page: Page) {
  await page.goto("/", { waitUntil: "load" });

  await page.getByRole("button", { name: "New Group" }).click();
  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill("Beach trip");
  await textboxes.nth(2).fill("Alice, Bob");
  await page.getByRole("button", { name: "Create group" }).click();

  await expect(page.getByText("Beach trip")).toBeVisible({ timeout: 30_000 });
  await page.getByText("Beach trip").click();

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
