import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import FamilySpace from "./FamilySpace";
import Weather from "./Weather";
import Home from "./Home";

const Drawer = createDrawerNavigator();
const Dashboard = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Drawer.Navigator>
        <Drawer.Screen name="Home" component={Home} />
        <Drawer.Screen name="Family" component={FamilySpace} />
        <Drawer.Screen name="Weather" component={Weather} />
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
