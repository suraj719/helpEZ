import React, { useEffect } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from './UserContext';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import Geolocation from 'react-native-geolocation-service';

// Import screens
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
import ResourceRouteScreen from "./screens/ResourceRouteScreen";

const Stack = createStackNavigator();

const App = () => {
  const [fontsLoaded] = useFonts({
    RobotoRegular: Roboto_400Regular,
    RobotoBold: Roboto_700Bold,
  });

  useEffect(() => {
    // Set geolocation configuration
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse', // or 'always'
    });
  }, []);

  if (!fontsLoaded) {
    return null; // Or a loading indicator if desired
  }

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
            <Stack.Screen name="ResourceRouteScreen" component={ResourceRouteScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </UserProvider>
  );
};

export default App;
