import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import {
  addKnownGroup,
  getKnownGroups,
  type KnownGroup,
} from "../lib/known-groups";
import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "Groups">;

const DEMO_GROUP_ID = "demo";

export function GroupsScreen({ navigation }: Props) {
  const [knownGroups, setKnownGroups] = useState<KnownGroup[]>([]);

  useEffect(() => {
    void getKnownGroups().then(setKnownGroups);
  }, []);

  async function openDemoGroup() {
    const groups = await addKnownGroup(DEMO_GROUP_ID);
    setKnownGroups(groups);
    navigation.navigate("Group", { groupId: DEMO_GROUP_ID });
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Groups</Text>
      {knownGroups.length > 0 ? (
        <Text variant="bodySmall" style={styles.meta}>
          Known: {knownGroups.map((group) => group.groupId).join(", ")}
        </Text>
      ) : null}
      <View style={styles.links}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("NewGroup")}
        >
          New Group
        </Button>
        <Button mode="contained" onPress={() => void openDemoGroup()}>
          Open Group
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
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 16,
  },
  meta: {
    textAlign: "center",
  },
  links: {
    gap: 8,
  },
});
