import { expect, test } from "@playwright/test";

import { createBeachTripGroup } from "./helpers/groups";

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
  await expect(
    page.getByTestId("expenses-list").getByText("Lunch")
  ).toBeVisible();
  await expect(
    page.getByTestId("balances-panel").getByText("+€6.00")
  ).toBeVisible();
  await expect(
    page.getByTestId("balances-panel").getByText("-€6.00")
  ).toBeVisible();
});
