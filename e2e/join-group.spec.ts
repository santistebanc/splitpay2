import { expect, test } from "@playwright/test";

const JOIN_RESPONSE = {
  group: {
    id: "joined-group-id",
    name: "Trip from host",
    joinCode: "ABCD2",
    currency: "EUR",
    createdAt: "2026-06-13T00:00:00.000Z",
  },
  member: {
    id: "joined-member-id",
    groupId: "joined-group-id",
    displayName: "Bob",
  },
  members: [
    {
      id: "host-member-id",
      groupId: "joined-group-id",
      displayName: "Alice",
    },
    {
      id: "joined-member-id",
      groupId: "joined-group-id",
      displayName: "Bob",
    },
  ],
};

test("joins a group by code and shows it on the home screen", async ({
  page,
}) => {
  test.setTimeout(60_000);

  await page.route("**/functions/v1/join", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(JOIN_RESPONSE),
    });
  });

  await page.goto("/", { waitUntil: "load" });

  await page.getByRole("button", { name: "Join Group" }).click();

  await page.getByTestId("join-code-input").fill("ABCD2");
  await page.getByTestId("join-name-input").fill("Bob");
  await page.getByTestId("join-group-button").click();

  await expect(page.getByRole("heading", { name: "Groups" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page.getByTestId("groups-list").getByText("Trip from host")
  ).toBeVisible();
});
