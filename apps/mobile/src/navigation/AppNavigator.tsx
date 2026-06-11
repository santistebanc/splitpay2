import {
  NavigationContainer,
  type Theme as NavigationTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import type { RootStackParamList } from "./routes";
import { AddExpenseScreen } from "../screens/AddExpenseScreen";
import { GroupScreen } from "../screens/GroupScreen";
import { GroupSettingsScreen } from "../screens/GroupSettingsScreen";
import { GroupsScreen } from "../screens/GroupsScreen";
import { JoinGroupScreen } from "../screens/JoinGroupScreen";
import { NewGroupScreen } from "../screens/NewGroupScreen";
import { SettleUpScreen } from "../screens/SettleUpScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppNavigatorProps = {
  navigationTheme: NavigationTheme;
};

export function AppNavigator({ navigationTheme }: AppNavigatorProps) {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName="Groups">
        <Stack.Screen name="Groups" component={GroupsScreen} />
        <Stack.Screen name="NewGroup" component={NewGroupScreen} />
        <Stack.Screen name="Group" component={GroupScreen} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="SettleUp" component={SettleUpScreen} />
        <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} />
        <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
