import React from "react";
import { SafeAreaView, StyleSheet, View, Text, Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  createDrawerNavigator,
  DrawerItemList,
} from "@react-navigation/drawer";
import Nearby from "./Nearby";
import Weather from "./Weather";
import Home from "./Home";
import Logout from "./Logout";
import Incidents from "./Incidents";
import RequestResources from "./RequestResources";
import Requests from "./Requests";
import Family from "./Family";
import VolunteerSignup from "./VolunteerSignup";
import MedicineInfoScreen from "./MedicineInfoScreen"; // Import MedicineInfoScreen

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => (
  <View style={styles.drawerContent}>
    <View style={styles.drawerHeader}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.appName}>HelpEZ</Text>
    </View>
    <DrawerItemList {...props} />
  </View>
);

const Dashboard = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
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
        {/* Existing screens */}
        <Drawer.Screen
          name="Home"
          component={Home}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="home-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Nearby"
          component={Nearby}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="map-marker-radius" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Weather"
          component={Weather}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="weather-partly-cloudy" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Family"
          component={Family}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="nature-people" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Incidents"
          component={Incidents}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="home-flood" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Requests"
          component={Requests}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="hand-heart-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name="VolunteerSignup" 
          component={VolunteerSignup}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="account-plus-outline" size={22} color={color} />
            ),
          }}
        />

        {/* New screen for Medicine Information */}
        <Drawer.Screen
          name="MedicineInfo"
          component={MedicineInfoScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="pill" size={22} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name="Logout"
          component={Logout}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="logout" size={22} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    paddingLeft: 35,
    backgroundColor: "#f0f0f0",
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  appName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
});

export default Dashboard;
