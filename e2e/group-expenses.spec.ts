import { expect, test } from "@playwright/test";

test("shows expense rows on the group view", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/?e2eSeed=group-balances", { waitUntil: "load" });

  await page.getByText("Ski weekend").click();

  await expect(page.getByTestId("expenses-list")).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page.getByTestId("expenses-list").getByText("Dinner")
  ).toBeVisible();
  await expect(
    page.getByTestId("expenses-list").getByText("€12.00")
  ).toBeVisible();
});
