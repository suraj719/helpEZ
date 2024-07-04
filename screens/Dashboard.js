// Dashboard.js
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaView, StyleSheet } from "react-native";
import Nearby from "./Nearby";
import Weather from "./Weather";
import Home from "./Home";
import Logout from "./Logout";
import RegisterScreen from "./RegisterScreen"; // Correct path to the RegisterScreen component
import Updates from "./Updates";
import ReportIncident from "./ReportIncident";

const Drawer = createDrawerNavigator();

const Dashboard = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Drawer.Navigator
        screenOptions={{
          drawerStyle: {
            backgroundColor: "#e6e6e6",
            width: 250,
          },
          drawerLabelStyle: {
            fontSize: 18,
          },
          drawerActiveTintColor: "#fff",
          drawerInactiveTintColor: "#000",
          drawerActiveBackgroundColor: "#000",
          drawerInactiveBackgroundColor: "#e6e6e6",
        }}
      >
        <Drawer.Screen name="Home" component={Home} />
        <Drawer.Screen name="Nearby" component={Nearby} />
        <Drawer.Screen name="Weather" component={Weather} />
        <Drawer.Screen name="Updates" component={Updates} />
        <Drawer.Screen name="Report incident" component={ReportIncident} />
        <Drawer.Screen name="Logout" component={Logout} />
        <Drawer.Screen name="RegisterScreen" component={RegisterScreen} />
        {/* Ensure RegisterScreen is added correctly */}
      </Drawer.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});

export default Dashboard;
