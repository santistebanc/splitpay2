import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

import type { RootStackParamList } from "../navigation/routes";

type Props = NativeStackScreenProps<RootStackParamList, "Group">;

export function GroupScreen({ navigation, route }: Props) {
  const { groupId } = route.params;

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Group</Text>
      <Text variant="bodyMedium">{groupId}</Text>
      <View style={styles.links}>
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("AddExpense", { groupId: route.params.groupId })
          }
        >
          Add Expense
        </Button>
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("SettleUp", { groupId: route.params.groupId })
          }
        >
          Settle Up
        </Button>
        <Button
          mode="contained"
          onPress={() =>
            navigation.navigate("GroupSettings", {
              groupId: route.params.groupId,
            })
          }
        >
          Settings
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
