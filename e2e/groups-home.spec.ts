import { expect, test } from "@playwright/test";

test("shows a seeded group from SQLite on the home screen", async ({
  page,
}) => {
  test.setTimeout(60_000);

  await page.goto("/?e2eSeed=groups-home", { waitUntil: "load" });

  await expect(page.getByRole("heading", { name: "Groups" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Ski weekend")).toBeVisible();
  await expect(page.getByTestId("groups-list")).toBeVisible();
});
