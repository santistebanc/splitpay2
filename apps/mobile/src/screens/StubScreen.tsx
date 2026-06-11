import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

type StubScreenProps = {
  title: string;
};

/** Empty screen placeholder — filled in later slices. */
export function StubScreen({ title }: StubScreenProps) {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
