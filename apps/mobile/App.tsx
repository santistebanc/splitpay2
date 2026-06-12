import { LEDGER_READY } from "@splitpay/ledger";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DatabaseProvider } from "./src/db/DatabaseProvider";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { getThemes } from "./src/lib/theme";
import { useAppColorScheme } from "./src/lib/use-app-color-scheme";

void LEDGER_READY;

export default function App() {
  const colorScheme = useAppColorScheme();
  const { paper, navigation } = getThemes(colorScheme);

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paper}>
        <DatabaseProvider>
          <AppNavigator navigationTheme={navigation} />
        </DatabaseProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
