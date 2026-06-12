import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import type { GroupRecord } from "../db/create-group";
import { useDatabase } from "../db/DatabaseProvider";
import { listGroups } from "../db/list-groups";
import { getKnownGroups } from "../lib/known-groups";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "Groups">;

export function GroupsScreen({ navigation }: Props) {
  const db = useDatabase();
  const [groups, setGroups] = useState<GroupRecord[]>([]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      void (async () => {
        const [allGroups, knownGroups] = await Promise.all([
          listGroups(db),
          getKnownGroups(),
        ]);
        const knownIds = new Set(knownGroups.map((group) => group.groupId));
        const nextGroups = allGroups.filter((group) => knownIds.has(group.id));

        if (!cancelled) {
          setGroups(nextGroups);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [db])
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
            <Text variant="bodySmall">
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
