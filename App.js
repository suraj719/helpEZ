import React from "react";
import "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from './UserContext';

// Import your screens
import Register from "./screens/Register";
import Dashboard from "./screens/Dashboard";
import IncidentDetails from "./screens/IncidentDetails";
import ReportIncident from "./screens/ReportIncident";
import RequestResources from "./screens/RequestResources";
import Family from "./screens/Family";
import ChatScreen from "./screens/ChatScreen";
import VolunteerSignup from "./screens/VolunteerSignup";
import Home from "./screens/Home";
import Notifications from "./screens/Notifications";

const Stack = createStackNavigator();

const App = () => {
  return (
    <UserProvider>
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
            <Stack.Screen name="ReportIncident" component={ReportIncident} />
            <Stack.Screen name="IncidentDetails" component={IncidentDetails} />
            <Stack.Screen name="RequestResources" component={RequestResources} />
            <Stack.Screen name="Family" component={Family} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="VolunteerSignup" component={VolunteerSignup} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Notifications" component={Notifications} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast visibilityTime={2000} swipeable={true} position="bottom" />
      </SafeAreaView>
    </UserProvider>
  );
};

export default App;
