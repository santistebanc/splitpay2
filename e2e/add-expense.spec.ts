import { expect, test, type Page } from "@playwright/test";

async function createBeachTripGroup(page: Page) {
  await page.getByRole("button", { name: "New Group" }).click();

  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill("Beach trip");
  await textboxes.nth(2).fill("Alice, Bob");
  await page.getByRole("button", { name: "Create group" }).click();

  await expect(page.getByText("Beach trip")).toBeVisible({ timeout: 30_000 });
  await page.getByText("Beach trip").click();
}

test("adding an expense updates balances on the group view", async ({
  page,
}) => {
  test.setTimeout(60_000);

  await page.goto("/", { waitUntil: "load" });
  await createBeachTripGroup(page);

  await page.getByRole("button", { name: "Add Expense" }).click();

  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill("12.00");
  await textboxes.nth(1).fill("Lunch");
  await page.getByRole("button", { name: "Alice" }).click();
  await page.getByRole("button", { name: "Save expense" }).click();

  await expect(page.getByTestId("balances-panel")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Lunch")).toBeVisible();
  await expect(page.getByText("+€6.00")).toBeVisible();
  await expect(page.getByText("-€6.00")).toBeVisible();
});
