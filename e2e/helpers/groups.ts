import { expect, type Page } from "@playwright/test";

export function groupRow(page: Page, groupName: string) {
  return page.getByTestId("groups-list").getByText(groupName, { exact: true });
}

export async function createBeachTripGroup(page: Page): Promise<void> {
  await page.getByRole("button", { name: "New Group" }).click();

  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill("Beach trip");
  await textboxes.nth(2).fill("Alice, Bob");
  await page.getByRole("button", { name: "Create group" }).click();

  await expect(groupRow(page, "Beach trip")).toBeVisible({ timeout: 30_000 });
  await groupRow(page, "Beach trip").click();
}
