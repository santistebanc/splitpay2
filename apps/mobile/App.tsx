import { LEDGER_READY } from "@splitpay/ledger";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, useColorScheme } from "react-native";
import { PaperProvider, Text } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { getTheme } from "./src/lib/theme";

void LEDGER_READY;

export default function App() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text variant="headlineMedium">SplitPay</Text>
          <StatusBar style="auto" />
        </SafeAreaView>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
