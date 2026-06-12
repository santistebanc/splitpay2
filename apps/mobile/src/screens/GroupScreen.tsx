import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { computeBalances } from "@splitpay/ledger";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { getGroup } from "../db/create-group";
import { useDatabase } from "../db/DatabaseProvider";
import { listGroupExpenses } from "../db/list-group-expenses";
import { formatBalanceCents } from "../lib/format-balance";
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

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      void (async () => {
        const group = await getGroup(db, groupId);
        if (!group || cancelled) {
          return;
        }

        const expenses = await listGroupExpenses(db, groupId);
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

        if (!cancelled) {
          setGroupName(group.name);
          setCurrency(group.currency);
          setBalances(
            ledgerBalances.map((balance) => ({
              memberId: balance.memberId,
              displayName:
                membersById.get(balance.memberId) ?? balance.memberId,
              balanceCents: balance.balanceCents,
            }))
          );
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [db, groupId])
  );

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">{groupName || "Group"}</Text>
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
