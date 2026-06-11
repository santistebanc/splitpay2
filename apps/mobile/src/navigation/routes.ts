/** Stack route names and params for the offline UI flow. */
export type RootStackParamList = {
  Groups: undefined;
  NewGroup: undefined;
  Group: { groupId: string };
  AddExpense: { groupId: string };
  SettleUp: { groupId: string };
  GroupSettings: { groupId: string };
  JoinGroup: undefined;
};

export const APP_ROUTE_NAMES = [
  "Groups",
  "NewGroup",
  "Group",
  "AddExpense",
  "SettleUp",
  "GroupSettings",
  "JoinGroup",
] as const satisfies readonly (keyof RootStackParamList)[];
