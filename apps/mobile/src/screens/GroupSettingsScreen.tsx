import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

import type { MemberRecord } from "../db/create-group";
import { getGroup } from "../db/create-group";
import { useDatabase } from "../db/DatabaseProvider";
import {
  addMember,
  isMemberReferenced,
  removeMember,
  renameGroup,
  renameMember,
} from "../db/update-group";
import {
  getKnownGroups,
  removeKnownGroup,
  resolveAssumedMemberId,
  setAssumedMember,
} from "../lib/known-groups";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "GroupSettings">;

type MemberRowState = MemberRecord & {
  editName: string;
  referenced: boolean;
};

export function GroupSettingsScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const db = useDatabase();
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<MemberRowState[]>([]);
  const [assumedMemberId, setAssumedMemberId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [renamingMemberId, setRenamingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const loadSettings = useCallback(async () => {
    const group = await getGroup(db, groupId);
    if (!group) {
      setError("Group not found");
      return;
    }

    const knownGroups = await getKnownGroups();
    const knownGroup = knownGroups.find((entry) => entry.groupId === groupId);
    const memberIds = group.members.map((member) => member.id);
    const referencedFlags = await Promise.all(
      group.members.map((member) => isMemberReferenced(db, member.id))
    );

    setGroupName(group.name);
    setAssumedMemberId(resolveAssumedMemberId(knownGroup, memberIds));
    setMembers(
      group.members.map((member, index) => ({
        ...member,
        editName: member.displayName,
        referenced: referencedFlags[index] ?? false,
      }))
    );
    setError(null);
  }, [db, groupId]);

  useFocusEffect(
    useCallback(() => {
      void loadSettings();
    }, [loadSettings])
  );

  async function handleSaveName() {
    setSavingName(true);
    setError(null);

    try {
      const updated = await renameGroup(db, groupId, groupName);
      setGroupName(updated.name);
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not rename group";
      setError(message);
    } finally {
      setSavingName(false);
    }
  }

  async function handleAddMember() {
    setAddingMember(true);
    setError(null);

    try {
      await addMember(db, groupId, newMemberName);
      setNewMemberName("");
      await loadSettings();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not add member";
      setError(message);
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRenameMember(member: MemberRowState) {
    setRenamingMemberId(member.id);
    setError(null);

    try {
      await renameMember(db, member.id, member.editName);
      await loadSettings();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not rename member";
      setError(message);
    } finally {
      setRenamingMemberId(null);
    }
  }

  async function handleRemoveMember(memberId: string) {
    setRemovingMemberId(memberId);
    setError(null);

    try {
      await removeMember(db, memberId);
      await loadSettings();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not remove member";
      setError(message);
    } finally {
      setRemovingMemberId(null);
    }
  }

  async function handleAssume(memberId: string | null) {
    setError(null);

    try {
      await setAssumedMember(groupId, memberId);
      setAssumedMemberId(memberId);
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not save assumption";
      setError(message);
    }
  }

  async function handleExitGroup() {
    setExiting(true);
    setError(null);

    try {
      await removeKnownGroup(groupId);
      navigation.popToTop();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not exit group";
      setError(message);
      setExiting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">Group Settings</Text>

      <Text variant="titleMedium">Group name</Text>
      <TextInput
        label="Group name"
        accessibilityLabel="Group name"
        value={groupName}
        onChangeText={setGroupName}
        testID="settings-group-name-input"
        autoCapitalize="words"
      />
      <Button
        mode="contained"
        onPress={() => void handleSaveName()}
        loading={savingName}
        disabled={savingName}
        testID="save-group-name-button"
      >
        Save name
      </Button>

      <Text variant="titleMedium">Members</Text>
      {members.map((member) => (
        <View key={member.id} style={styles.memberRow}>
          <TextInput
            label={member.displayName}
            accessibilityLabel={`Rename ${member.displayName}`}
            value={member.editName}
            onChangeText={(value) =>
              setMembers((current) =>
                current.map((row) =>
                  row.id === member.id ? { ...row, editName: value } : row
                )
              )
            }
            testID={`member-name-input-${member.id}`}
            autoCapitalize="words"
          />
          <View style={styles.memberActions}>
            <Button
              mode="outlined"
              onPress={() => void handleRenameMember(member)}
              loading={renamingMemberId === member.id}
              disabled={renamingMemberId !== null || removingMemberId !== null}
              testID={`rename-member-${member.id}`}
            >
              Rename
            </Button>
            <Button
              mode="outlined"
              onPress={() => void handleRemoveMember(member.id)}
              loading={removingMemberId === member.id}
              disabled={
                member.referenced ||
                renamingMemberId !== null ||
                removingMemberId !== null
              }
              testID={`remove-member-${member.id}`}
            >
              Remove
            </Button>
          </View>
        </View>
      ))}
      <TextInput
        label="New member"
        accessibilityLabel="New member"
        value={newMemberName}
        onChangeText={setNewMemberName}
        testID="new-member-input"
        autoCapitalize="words"
      />
      <Button
        mode="contained"
        onPress={() => void handleAddMember()}
        loading={addingMember}
        disabled={addingMember}
        testID="add-member-button"
      >
        Add member
      </Button>

      <Text variant="titleMedium">Assumed member</Text>
      <View style={styles.memberChoices}>
        <Button
          mode={assumedMemberId === null ? "contained" : "outlined"}
          onPress={() => void handleAssume(null)}
          testID="assume-none"
        >
          None
        </Button>
        {members.map((member) => (
          <Button
            key={member.id}
            mode={assumedMemberId === member.id ? "contained" : "outlined"}
            onPress={() => void handleAssume(member.id)}
            testID={`assume-${member.id}`}
          >
            {member.displayName}
          </Button>
        ))}
      </View>

      <Button
        mode="contained"
        buttonColor="#b3261e"
        onPress={() => void handleExitGroup()}
        loading={exiting}
        disabled={exiting}
        testID="exit-group-button"
      >
        Exit group
      </Button>

      {error ? (
        <Text variant="bodySmall" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Button mode="text" onPress={() => navigation.goBack()}>
        Back
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  memberRow: {
    gap: 8,
  },
  memberActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
