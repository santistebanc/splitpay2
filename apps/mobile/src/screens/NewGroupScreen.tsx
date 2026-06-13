import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

import { flushPendingUploads } from "../db/connect-sync";
import { createGroup } from "../db/create-group";
import { useDatabase } from "../db/DatabaseProvider";
import { isSyncConfigured } from "../db/sync-config";
import { addKnownGroup } from "../lib/known-groups";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "NewGroup">;

function parseMemberNames(raw: string): string[] {
  return raw
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

export function NewGroupScreen({ navigation }: Props) {
  const db = useDatabase();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [members, setMembers] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    const memberNames = parseMemberNames(members);
    if (!name.trim()) {
      setError("Enter a group name");
      return;
    }
    if (memberNames.length === 0) {
      setError("Add at least one member");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const group = await createGroup(db, {
        name: name.trim(),
        currency: currency.trim() || "EUR",
        memberNames,
      });
      if (isSyncConfigured()) {
        await flushPendingUploads(db);
      }
      await addKnownGroup(group.id);
      navigation.goBack();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not create group";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">New Group</Text>
      <TextInput
        label="Group name"
        accessibilityLabel="Group name"
        value={name}
        onChangeText={setName}
        testID="group-name-input"
        autoCapitalize="words"
      />
      <TextInput
        label="Currency"
        accessibilityLabel="Currency"
        value={currency}
        onChangeText={setCurrency}
        testID="group-currency-input"
        autoCapitalize="characters"
      />
      <TextInput
        label="Members"
        accessibilityLabel="Members"
        value={members}
        onChangeText={setMembers}
        testID="group-members-input"
        placeholder="Alice, Bob"
        autoCapitalize="words"
      />
      {error ? (
        <Text variant="bodySmall" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Button
        mode="contained"
        onPress={() => void handleCreate()}
        loading={submitting}
        disabled={submitting}
        testID="create-group-button"
      >
        Create group
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
  error: {
    color: "#b3261e",
  },
});
