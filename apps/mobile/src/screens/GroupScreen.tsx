import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { computeBalances } from "@splitpay/ledger";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import {
  useGroupActivities,
  useGroupExpenses,
} from "../db/hooks/use-group-queries";
import { useGroupWithMembers } from "../db/hooks/use-group-with-members";
import { useSyncOnFocus } from "../db/hooks/use-sync-on-focus";
import { formatAmountCents, formatBalanceCents } from "../lib/format-balance";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "Group">;

export function GroupScreen({ navigation, route }: Props) {
  const { groupId } = route.params;

  useSyncOnFocus(groupId);

  const { group } = useGroupWithMembers(groupId);
  const { expenses } = useGroupExpenses(groupId);
  const { activities } = useGroupActivities(groupId);

  const balances = useMemo(() => {
    if (!group) {
      return [];
    }

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

    return ledgerBalances.map((balance) => ({
      memberId: balance.memberId,
      displayName: membersById.get(balance.memberId) ?? balance.memberId,
      balanceCents: balance.balanceCents,
    }));
  }, [group, expenses]);

  const groupName = group?.name ?? "";
  const currency = group?.currency ?? "EUR";

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
