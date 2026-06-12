import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { computeBalances, computeSettlements } from "@splitpay/ledger";
import type { Settlement } from "@splitpay/ledger";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { addExpense } from "../db/add-expense";
import { getGroup } from "../db/create-group";
import { useDatabase } from "../db/DatabaseProvider";
import { listGroupExpenses } from "../db/list-group-expenses";
import { formatAmountCents } from "../lib/format-balance";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "SettleUp">;

type SettlementRow = Settlement & {
  fromName: string;
  toName: string;
};

export function SettleUpScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const db = useDatabase();
  const [currency, setCurrency] = useState("EUR");
  const [settlements, setSettlements] = useState<SettlementRow[]>([]);
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      void (async () => {
        const group = await getGroup(db, groupId);
        if (!group || cancelled) {
          return;
        }

        const expenses = await listGroupExpenses(db, groupId);
        const balances = computeBalances(
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
        const suggested = computeSettlements(balances);
        const membersById = new Map(
          group.members.map((member) => [member.id, member.displayName])
        );

        if (!cancelled) {
          setCurrency(group.currency);
          setSettlements(
            suggested.map((settlement) => ({
              ...settlement,
              fromName:
                membersById.get(settlement.fromMemberId) ??
                settlement.fromMemberId,
              toName:
                membersById.get(settlement.toMemberId) ?? settlement.toMemberId,
            }))
          );
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [db, groupId])
  );

  async function recordSettlement(settlement: SettlementRow) {
    const key = `${settlement.fromMemberId}-${settlement.toMemberId}`;
    setRecordingKey(key);
    setError(null);

    try {
      await addExpense(db, {
        groupId,
        amountCents: settlement.amountCents,
        note: "Settlement",
        contributions: [
          {
            memberId: settlement.fromMemberId,
            amountCents: settlement.amountCents,
          },
        ],
        allocations: [{ memberId: settlement.toMemberId }],
      });
      navigation.goBack();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not record settlement";
      setError(message);
    } finally {
      setRecordingKey(null);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Settle Up</Text>
      {settlements.length === 0 ? (
        <Text variant="bodyMedium">Everyone is settled up</Text>
      ) : (
        settlements.map((settlement) => {
          const key = `${settlement.fromMemberId}-${settlement.toMemberId}`;
          const label = `${settlement.fromName} pays ${settlement.toName} ${formatAmountCents(settlement.amountCents, currency)}`;

          return (
            <Button
              key={key}
              mode="contained"
              onPress={() => void recordSettlement(settlement)}
              loading={recordingKey === key}
              disabled={recordingKey !== null}
              testID={`settle-${key}`}
            >
              {label}
            </Button>
          );
        })
      )}
      {error ? (
        <Text variant="bodySmall" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Button mode="text" onPress={() => navigation.goBack()}>
        Cancel
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  error: {
    color: "#b3261e",
  },
});
