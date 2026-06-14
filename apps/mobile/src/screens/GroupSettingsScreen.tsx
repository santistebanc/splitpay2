import { useQuery } from "@powersync/react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";

import type { MemberRecord } from "../db/create-group";
import { flushPendingUploads } from "../db/connect-sync";
import { useDatabase } from "../db/DatabaseProvider";
import { useSyncOnFocus } from "../db/hooks/use-sync-on-focus";
import { useGroupWithMembers } from "../db/hooks/use-group-with-members";
import {
  addMember,
  removeMember,
  renameGroup,
  renameMember,
} from "../db/update-group";
import { isSyncConfigured } from "../db/sync-config";
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

  useSyncOnFocus(groupId);

  const { group } = useGroupWithMembers(groupId);
  const { data: referencedRows = [] } = useQuery<{ member_id: string }>(
    `SELECT DISTINCT ec.member_id
     FROM expense_contributions ec
     INNER JOIN expenses e ON e.id = ec.expense_id
     WHERE e.group_id = ?
     UNION
     SELECT DISTINCT ea.member_id
     FROM expense_allocations ea
     INNER JOIN expenses e ON e.id = ea.expense_id
     WHERE e.group_id = ?`,
    [groupId, groupId]
  );

  const [groupName, setGroupName] = useState("");
  const [groupNameDirty, setGroupNameDirty] = useState(false);
  const [assumedMemberId, setAssumedMemberId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [renamingMemberId, setRenamingMemberId] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);
  const [memberEdits, setMemberEdits] = useState<Record<string, string>>({});

  const referencedMemberIds = useMemo(
    () => new Set(referencedRows.map((row) => row.member_id)),
    [referencedRows]
  );

  useEffect(() => {
    if (!group || groupNameDirty) {
      return;
    }

    setGroupName(group.name);
  }, [group, groupNameDirty]);

  useEffect(() => {
    if (!group) {
      return;
    }

    void getKnownGroups().then((knownGroups) => {
      const knownGroup = knownGroups.find((entry) => entry.groupId === groupId);
      const memberIds = group.members.map((member) => member.id);
      setAssumedMemberId(resolveAssumedMemberId(knownGroup, memberIds));
    });
  }, [group, groupId]);

  useEffect(() => {
    if (!group) {
      return;
    }

    setMemberEdits((current) => {
      const next = { ...current };
      for (const member of group.members) {
        if (!(member.id in next)) {
          next[member.id] = member.displayName;
        }
      }
      return next;
    });
  }, [group]);

  const members = useMemo((): MemberRowState[] => {
    if (!group) {
      return [];
    }

    return group.members.map((member) => ({
      ...member,
      editName: memberEdits[member.id] ?? member.displayName,
      referenced: referencedMemberIds.has(member.id),
    }));
  }, [group, memberEdits, referencedMemberIds]);

  const updateMemberEdit = useCallback((memberId: string, editName: string) => {
    setMemberEdits((current) => ({ ...current, [memberId]: editName }));
  }, []);

  async function syncChanges(): Promise<void> {
    if (isSyncConfigured()) {
      await flushPendingUploads(db);
    }
  }

  async function handleSaveName() {
    setSavingName(true);
    setError(null);

    try {
      await renameGroup(db, groupId, groupName.trim());
      await syncChanges();
      setGroupNameDirty(false);
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
      await addMember(db, groupId, newMemberName.trim());
      await syncChanges();
      setNewMemberName("");
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not add member";
      setError(message);
    } finally {
      setAddingMember(false);
    }
  }

  async function handleRenameMember(memberId: string) {
    setRenamingMemberId(memberId);
    setError(null);

    try {
      const editName = memberEdits[memberId]?.trim() ?? "";
      await renameMember(db, memberId, editName);
      await syncChanges();
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
      await syncChanges();
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : "Could not remove member";
      setError(message);
    } finally {
      setRemovingMemberId(null);
    }
  }

  async function handleAssumedMemberChange(memberId: string | null) {
    setError(null);
    await setAssumedMember(groupId, memberId);
    setAssumedMemberId(memberId);
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
    } finally {
      setExiting(false);
    }
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium">Group not found</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall">Group Settings</Text>
      <TextInput
        label="Group name"
        value={groupName}
        onChangeText={(value) => {
          setGroupName(value);
          setGroupNameDirty(true);
        }}
        testID="settings-group-name-input"
      />
      <Button
        mode="contained"
        onPress={() => void handleSaveName()}
        loading={savingName}
        disabled={savingName || !groupNameDirty}
        testID="save-group-name-button"
      >
        Save name
      </Button>
      <Text variant="titleMedium">Assumed member</Text>
      {group.members.map((member) => (
        <Button
          key={member.id}
          mode={assumedMemberId === member.id ? "contained" : "outlined"}
          onPress={() => void handleAssumedMemberChange(member.id)}
          testID={`assume-member-${member.id}`}
        >
          {member.displayName}
        </Button>
      ))}
      <Button
        mode={assumedMemberId === null ? "contained" : "outlined"}
        onPress={() => void handleAssumedMemberChange(null)}
        testID="assume-member-none"
      >
        None
      </Button>
      <Text variant="titleMedium">Members</Text>
      {members.map((member) => (
        <View key={member.id} style={styles.memberRow}>
          <TextInput
            label="Member name"
            value={member.editName}
            onChangeText={(value) => updateMemberEdit(member.id, value)}
            testID={`member-name-input-${member.id}`}
          />
          <Button
            mode="outlined"
            onPress={() => void handleRenameMember(member.id)}
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
      ))}
      <TextInput
        label="New member"
        value={newMemberName}
        onChangeText={setNewMemberName}
        testID="new-member-input"
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
      <Button
        mode="contained"
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
  error: {
    color: "#b3261e",
  },
});
