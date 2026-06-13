import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { computeBalances } from "@splitpay/ledger";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import type { ExpenseRecord } from "../db/add-expense";
import { getGroup } from "../db/create-group";
import { useDatabase } from "../db/DatabaseProvider";
import { refreshGroupRosterFromServer } from "../db/join-group";
import type { ActivityRecord } from "../db/list-group-activities";
import { listGroupActivities } from "../db/list-group-activities";
import { listGroupExpenses } from "../db/list-group-expenses";
import { useOnTablesChange } from "../db/use-on-tables-change";
import { formatAmountCents, formatBalanceCents } from "../lib/format-balance";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "Group">;

type BalanceRow = {
  memberId: string;
  displayName: string;
  balanceCents: number;
};

export function GroupScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const db = useDatabase();
  const [groupName, setGroupName] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  const loadGroup = useCallback(async () => {
    await refreshGroupRosterFromServer(db, groupId);
    const group = await getGroup(db, groupId);
    if (!group) {
      return;
    }

    const [expenses, groupActivities] = await Promise.all([
      listGroupExpenses(db, groupId),
      listGroupActivities(db, groupId),
    ]);
    const ledgerBalances = computeBalances(
      group.members.map((member) => ({ id: member.id })),
      expenses.map((expense) => ({
        id: expense.id,
        amountCents: expense.amountCents,
        contributions: expense.contributions.map((contribution) => ({
          memberId: contribution.memberId,
          amountCents: contribution.amountCents,
        })),
        allocations: expense.allocations.map((allocation) => ({
          memberId: allocation.memberId,
        })),
      }))
    );

    const membersById = new Map(
      group.members.map((member) => [member.id, member.displayName])
    );

    setGroupName(group.name);
    setCurrency(group.currency);
    setExpenses(expenses);
    setActivities(groupActivities);
    setBalances(
      ledgerBalances.map((balance) => ({
        memberId: balance.memberId,
        displayName: membersById.get(balance.memberId) ?? balance.memberId,
        balanceCents: balance.balanceCents,
      }))
    );
  }, [db, groupId]);

  useFocusEffect(
    useCallback(() => {
      void loadGroup();
    }, [loadGroup])
  );

  useOnTablesChange(
    db,
    [
      "groups",
      "members",
      "expenses",
      "expense_contributions",
      "expense_allocations",
      "activities",
    ],
    () => {
      void loadGroup();
    }
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" testID="group-title">
        {groupName || "Group"}
      </Text>
      <View testID="balances-panel" style={styles.balances}>
        <Text variant="titleMedium">Balances</Text>
        {balances.length === 0 ? (
          <Text variant="bodyMedium">No expenses yet</Text>
        ) : (
          balances.map((balance) => (
            <View
              key={balance.memberId}
              testID={`balance-row-${balance.memberId}`}
              style={styles.balanceRow}
            >
              <Text variant="bodyLarge">{balance.displayName}</Text>
              <Text variant="bodyLarge">
                {formatBalanceCents(balance.balanceCents, currency)}
              </Text>
            </View>
          ))
        )}
      </View>
      <View testID="expenses-list" style={styles.expenses}>
        <Text variant="titleMedium">Expenses</Text>
        {expenses.length === 0 ? (
          <Text variant="bodyMedium">No expenses yet</Text>
        ) : (
          expenses.map((expense) => (
            <View
              key={expense.id}
              testID={`expense-row-${expense.id}`}
              style={styles.expenseRow}
            >
              <Text variant="bodyLarge">{expense.note || "Expense"}</Text>
              <Text variant="bodyLarge">
                {formatAmountCents(expense.amountCents, currency)}
              </Text>
            </View>
          ))
        )}
      </View>
      <View testID="activity-feed" style={styles.activity}>
        <Text variant="titleMedium">Activity</Text>
        {activities.length === 0 ? (
          <Text variant="bodyMedium">No activity yet</Text>
        ) : (
          activities.map((activity) => (
            <Text
              key={activity.id}
              variant="bodyLarge"
              testID={`activity-row-${activity.id}`}
            >
              {activity.summary}
            </Text>
          ))
        )}
      </View>
      <View style={styles.links}>
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("AddExpense", { groupId: route.params.groupId })
          }
        >
          Add Expense
        </Button>
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("SettleUp", { groupId: route.params.groupId })
          }
        >
          Settle Up
        </Button>
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("GroupSettings", {
              groupId: route.params.groupId,
            })
          }
        >
          Settings
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  balances: {
    gap: 8,
  },
  expenses: {
    gap: 8,
  },
  activity: {
    gap: 8,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  links: {
    gap: 8,
    marginTop: "auto",
    paddingBottom: 16,
  },
});
