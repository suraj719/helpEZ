import React from "react";
import Register from "./screens/Register";
import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native";
import Dashboard from "./screens/Dashboard";

const Stack = createStackNavigator();
const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast visibilityTime={2000} swipeable={true} position="bottom" />
    </SafeAreaView>
  );
};

export default App;
