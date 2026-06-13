import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import type { GroupRecord } from "../db/create-group";
import { useDatabase } from "../db/DatabaseProvider";
import { listGroups } from "../db/list-groups";
import { useOnTablesChange } from "../db/use-on-tables-change";
import { getKnownGroups } from "../lib/known-groups";
import { STORAGE_KEYS } from "../lib/storage-keys";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "Groups">;

export function GroupsScreen({ navigation }: Props) {
  const db = useDatabase();
  const [groups, setGroups] = useState<GroupRecord[]>([]);

  const loadGroups = useCallback(async () => {
    const [allGroups, knownGroups] = await Promise.all([
      listGroups(db),
      getKnownGroups(),
    ]);
    const knownIds = new Set(knownGroups.map((group) => group.groupId));
    setGroups(allGroups.filter((group) => knownIds.has(group.id)));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      void loadGroups();
    }, [loadGroups])
  );

  useOnTablesChange(db, ["groups", "members"], () => {
    void loadGroups();
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.knownGroups) {
        void loadGroups();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [loadGroups]);

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Groups</Text>
      <FlatList
        testID="groups-list"
        data={groups}
        keyExtractor={(group) => group.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text variant="bodyMedium" style={styles.empty}>
            No groups yet
          </Text>
        }
        renderItem={({ item: group }) => (
          <Pressable
            testID={`group-row-${group.id}`}
            onPress={() => navigation.navigate("Group", { groupId: group.id })}
          >
            <Text variant="titleMedium">{group.name}</Text>
            <Text variant="bodySmall" testID={`group-meta-${group.id}`}>
              {group.currency} · {group.joinCode}
            </Text>
          </Pressable>
        )}
      />
      <View style={styles.links}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("NewGroup")}
        >
          New Group
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("JoinGroup")}
        >
          Join Group
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
  list: {
    flex: 1,
    alignSelf: "stretch",
  },
  listContent: {
    gap: 12,
    paddingBottom: 8,
  },
  empty: {
    textAlign: "center",
    paddingVertical: 24,
  },
  links: {
    gap: 8,
    paddingBottom: 16,
  },
});
