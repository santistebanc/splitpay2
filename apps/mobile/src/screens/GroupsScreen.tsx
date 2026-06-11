import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "Groups">;

const DEMO_GROUP_ID = "demo";

export function GroupsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Groups</Text>
      <View style={styles.links}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("NewGroup")}
        >
          New Group
        </Button>
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("Group", { groupId: DEMO_GROUP_ID })
          }
        >
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
  },
  links: {
    gap: 8,
  },
});
