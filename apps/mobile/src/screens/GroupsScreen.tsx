import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import { useAllGroups } from "../db/hooks/use-group-with-members";
import { useSyncOnFocus } from "../db/hooks/use-sync-on-focus";
import { getKnownGroups } from "../lib/known-groups";
import { STORAGE_KEYS } from "../lib/storage-keys";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "Groups">;

export function GroupsScreen({ navigation }: Props) {
  useSyncOnFocus();

  const { groups: allGroups } = useAllGroups();
  const [knownIds, setKnownIds] = useState<ReadonlySet<string>>(new Set());

  const refreshKnownGroups = useCallback(async () => {
    const knownGroups = await getKnownGroups();
    setKnownIds(new Set(knownGroups.map((group) => group.groupId)));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshKnownGroups();
    }, [refreshKnownGroups])
  );

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.knownGroups) {
        void refreshKnownGroups();
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshKnownGroups]);

  const groups = useMemo(
    () => allGroups.filter((group) => knownIds.has(group.id)),
    [allGroups, knownIds]
  );

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
