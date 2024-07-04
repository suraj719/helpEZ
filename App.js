// App.js
import React from "react";
import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native";
import Dashboard from "./screens/Dashboard";
import { StatusBar } from "expo-status-bar";
import Register from "./screens/Register";

// Import Firebase configuration
import { app, analytics } from "./utils/firebase";

import EventDetails from "./screens/EventDetails";

const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="EventDetails" component={EventDetails} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast visibilityTime={2000} swipeable={true} position="bottom" />
    </SafeAreaView>
  );
};

export default App;
