import { expect, test } from "@playwright/test";

test("creates a group and shows it on the home screen", async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto("/", { waitUntil: "load" });

  await page.getByRole("button", { name: "New Group" }).click();

  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill("Beach trip");
  await textboxes.nth(2).fill("Alice, Bob");

  await page.getByRole("button", { name: "Create group" }).click();

  await expect(page.getByRole("heading", { name: "Groups" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Beach trip")).toBeVisible();
});
