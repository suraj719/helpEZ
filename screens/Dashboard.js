import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import FamilySpace from "./FamilySpace";
import Weather from "./Weather";
import Home from "./Home";
import Logout from "./Logout";

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
        <Drawer.Screen name="Family" component={FamilySpace} />
        <Drawer.Screen name="Weather" component={Weather} />
        <Drawer.Screen name="Logout" component={Logout} />
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
