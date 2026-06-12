import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

import { addExpense } from "../db/add-expense";
import { getGroup, type GroupWithMembers } from "../db/create-group";
import { useDatabase } from "../db/DatabaseProvider";
import { parseAmountToCents } from "../lib/parse-amount";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "AddExpense">;

export function AddExpenseScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const db = useDatabase();
  const [group, setGroup] = useState<GroupWithMembers | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paidByMemberId, setPaidByMemberId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void getGroup(db, groupId).then((loaded) => {
      setGroup(loaded);
      if (loaded?.members[0]) {
        setPaidByMemberId(loaded.members[0].id);
      }
    });
  }, [db, groupId]);

  async function handleSave() {
    const amountCents = parseAmountToCents(amount);
    if (!group) {
      setError("Group not found");
      return;
    }
    if (amountCents === null || amountCents <= 0) {
      setError("Enter a valid amount");
      return;
    }
    if (!paidByMemberId) {
      setError("Choose who paid");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await addExpense(db, {
        groupId,
        amountCents,
        note: note.trim(),
        contributions: [{ memberId: paidByMemberId, amountCents }],
        allocations: group.members.map((member) => ({
          memberId: member.id,
        })),
      });
      navigation.goBack();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not save expense";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Add Expense</Text>
      <TextInput
        label="Amount"
        accessibilityLabel="Amount"
        value={amount}
        onChangeText={setAmount}
        testID="expense-amount-input"
        keyboardType="decimal-pad"
        placeholder="12.00"
      />
      <TextInput
        label="Note"
        accessibilityLabel="Note"
        value={note}
        onChangeText={setNote}
        testID="expense-note-input"
        placeholder="Lunch"
      />
      <Text variant="titleMedium">Paid by</Text>
      <View style={styles.memberChoices}>
        {group?.members.map((member) => (
          <Button
            key={member.id}
            mode={paidByMemberId === member.id ? "contained" : "outlined"}
            onPress={() => setPaidByMemberId(member.id)}
            testID={`paid-by-${member.id}`}
          >
            {member.displayName}
          </Button>
        ))}
      </View>
      {error ? (
        <Text variant="bodySmall" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Button
        mode="contained"
        onPress={() => void handleSave()}
        loading={submitting}
        disabled={submitting}
        testID="save-expense-button"
      >
        Save expense
      </Button>
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
  memberChoices: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  error: {
    color: "#b3261e",
  },
});
