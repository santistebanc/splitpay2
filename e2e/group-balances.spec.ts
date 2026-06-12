import { expect, test } from "@playwright/test";

test("shows balances that match the ledger for a seeded group", async ({
  page,
}) => {
  test.setTimeout(60_000);

  await page.goto("/?e2eSeed=group-balances", { waitUntil: "load" });

  await page.getByText("Ski weekend").click();

  await expect(page.getByTestId("balances-panel")).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Bob")).toBeVisible();
  await expect(page.getByText("-€6.00")).toBeVisible();
  await expect(page.getByText("Alice")).toBeVisible();
  await expect(page.getByText("+€6.00")).toBeVisible();
});
