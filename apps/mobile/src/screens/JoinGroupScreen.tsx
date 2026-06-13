import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

import { useDatabase } from "../db/DatabaseProvider";
import { isValidJoinCode } from "../db/join-code";
import { joinGroup } from "../db/join-group";
import { getSupabaseConfig } from "../db/sync-config";
import { addKnownGroup } from "../lib/known-groups";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "JoinGroup">;

export function JoinGroupScreen({ navigation }: Props) {
  const db = useDatabase();
  const [joinCode, setJoinCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cloudConfigured = getSupabaseConfig() !== null;

  async function handleJoin() {
    const normalizedCode = joinCode.trim().toUpperCase();
    if (!isValidJoinCode(normalizedCode)) {
      setError("Enter a valid 5-character join code");
      return;
    }
    if (!displayName.trim()) {
      setError("Enter a member name");
      return;
    }
    if (!cloudConfigured) {
      setError("Join requires cloud setup");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const joined = await joinGroup(db, {
        joinCode: normalizedCode,
        displayName: displayName.trim(),
      });
      await addKnownGroup(joined.id, undefined, {
        assumedMemberId: joined.member.id,
      });
      navigation.goBack();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not join group";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Join Group</Text>
      {!cloudConfigured ? (
        <Text variant="bodyMedium" style={styles.hint}>
          Set Supabase env vars to join a group from another device.
        </Text>
      ) : null}
      <TextInput
        label="Join code"
        accessibilityLabel="Join code"
        value={joinCode}
        onChangeText={(value) => setJoinCode(value.toUpperCase())}
        testID="join-code-input"
        autoCapitalize="characters"
        maxLength={5}
      />
      <TextInput
        label="Your name"
        accessibilityLabel="Your name"
        value={displayName}
        onChangeText={setDisplayName}
        testID="join-name-input"
        autoCapitalize="words"
      />
      {error ? (
        <Text variant="bodySmall" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Button
        mode="contained"
        onPress={() => void handleJoin()}
        loading={submitting}
        disabled={submitting || !cloudConfigured}
        testID="join-group-button"
      >
        Join group
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
  hint: {
    opacity: 0.8,
  },
  error: {
    color: "#b3261e",
  },
});
