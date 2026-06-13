import { expect, test, type Page } from "@playwright/test";

import { groupRow } from "./helpers/groups";
import {
  isSyncStackRunning,
  parseJoinCodeFromMeta,
} from "./helpers/sync-stack";

async function createGroupAndGetJoinCode(
  page: Page,
  groupName: string
): Promise<string> {
  await page.goto("/", { waitUntil: "load" });
  await page.getByRole("button", { name: "New Group" }).click();

  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill(groupName);
  await textboxes.nth(2).fill("Alice, Bob");
  await page.getByRole("button", { name: "Create group" }).click();

  const row = page.locator('[data-testid^="group-row-"]').filter({
    hasText: groupName,
  });
  await expect(row).toBeVisible({ timeout: 30_000 });

  const meta = row.locator('[data-testid^="group-meta-"]');
  await expect(meta).toBeVisible({ timeout: 30_000 });
  const joinCode = parseJoinCodeFromMeta(await meta.textContent());
  return joinCode;
}

async function openGroup(page: Page, groupName: string): Promise<void> {
  const row = page.locator('[data-testid^="group-row-"]').filter({
    hasText: groupName,
  });
  await expect(row).toBeVisible({ timeout: 30_000 });
  await row.click();
  await expect(page.getByTestId("balances-panel")).toBeVisible({
    timeout: 30_000,
  });
}

async function joinGroup(
  page: Page,
  joinCode: string,
  displayName: string
): Promise<void> {
  await page.goto("/", { waitUntil: "load" });
  await page.getByRole("button", { name: "Join Group" }).click();
  await page.getByTestId("join-code-input").fill(joinCode);
  await page.getByTestId("join-name-input").fill(displayName);
  await page.getByTestId("join-group-button").click();
  await expect(page.getByRole("heading", { name: "Groups" })).toBeVisible({
    timeout: 30_000,
  });
}

async function addExpense(
  page: Page,
  amount: string,
  note: string,
  paidBy: string
): Promise<void> {
  await page.getByRole("button", { name: "Add Expense" }).click();
  const textboxes = page.getByRole("textbox");
  await textboxes.nth(0).fill(amount);
  await textboxes.nth(1).fill(note);
  await page.getByRole("button", { name: paidBy }).click();
  await page.getByRole("button", { name: "Save expense" }).click();
  await expect(page.getByTestId("expenses-list").getByText(note)).toBeVisible({
    timeout: 30_000,
  });
}

test.describe("two-device sync", () => {
  test("guest sees host expense after join", async ({ browser }, testInfo) => {
    if (!(await isSyncStackRunning())) {
      testInfo.skip(true, "Local Supabase + PowerSync stack is not running");
    }

    test.setTimeout(180_000);

    const groupName = `Sync trip ${Date.now()}`;
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const host = await hostContext.newPage();
    const guest = await guestContext.newPage();

    try {
      const joinCode = await createGroupAndGetJoinCode(host, groupName);
      await joinGroup(guest, joinCode, "Bob");
      await expect(groupRow(guest, groupName)).toBeVisible({
        timeout: 60_000,
      });

      await openGroup(host, groupName);
      await addExpense(host, "12.00", "Lunch", "Alice");

      await openGroup(guest, groupName);
      await expect(
        guest.getByTestId("expenses-list").getByText("Lunch")
      ).toBeVisible({
        timeout: 90_000,
      });
    } finally {
      await hostContext.close();
      await guestContext.close();
    }
  });
});
