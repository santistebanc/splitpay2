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

test("renaming a group updates the group view", async ({ page }) => {
  test.setTimeout(60_000);

  await createBeachTripGroup(page);

  await page.getByRole("button", { name: "Settings" }).click();
  const groupNameField = page.getByRole("textbox", { name: "Group name" });
  await groupNameField.click();
  await groupNameField.fill("Summer trip");
  await page.getByTestId("save-group-name-button").click();
  await expect(groupNameField).toHaveValue("Summer trip");

  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByText("Summer trip")).toBeVisible({ timeout: 30_000 });
});

test("exiting a group removes it from the home screen", async ({ page }) => {
  test.setTimeout(60_000);

  await createBeachTripGroup(page);

  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByTestId("exit-group-button").click();

  await expect(page.getByRole("heading", { name: "Groups" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Beach trip")).not.toBeVisible();
});
