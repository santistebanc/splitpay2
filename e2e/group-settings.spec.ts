import { expect, test } from "@playwright/test";

import { createBeachTripGroup, groupRow } from "./helpers/groups";

test("renaming a group updates the group view", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/", { waitUntil: "load" });
  await createBeachTripGroup(page);

  await page.getByRole("button", { name: "Settings" }).click();
  const groupNameField = page.getByTestId("settings-group-name-input");
  await groupNameField.click();
  await groupNameField.fill("Summer trip");
  await page.getByTestId("save-group-name-button").click();
  await expect(groupNameField).toHaveValue("Summer trip", { timeout: 15_000 });

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByTestId("group-title")).toHaveText("Summer trip", {
    timeout: 30_000,
  });
});

test("exiting a group removes it from the home screen", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/", { waitUntil: "load" });
  await createBeachTripGroup(page);

  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByTestId("exit-group-button").click();

  await expect(page.getByRole("heading", { name: "Groups" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(groupRow(page, "Beach trip")).not.toBeVisible();
});
