import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { MaterialIcons } from '@expo/vector-icons';
import {
  createDrawerNavigator,
  DrawerItemList,
} from "@react-navigation/drawer";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';  // Import useTranslation
import Nearby from "./Nearby";
import Weather from "./Weather";
import Home from "./Home";
import Logout from "./Logout";
import Incidents from "./Incidents";
import Requests from "./Requests";
import Family from "./Family";
import MemberSignup from "./MemberSignup";
import MedicineInfoScreen from "./MedicineInfoScreen"; // Import MedicineInfoScreen
import ResourcesTrackingScreen from "./ResourcesTrackingScreen"; 
import ProfileScreen from "./ProfileScreen";
import Analytics from "./DashBoardAnalytics";
import FlutterLink from "./FlutterLink";
import CommunityScreen from "./CommunityScreen";

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => { // Initialize useTranslation hook
  const [userName, setUserName] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      const name = await AsyncStorage.getItem("name");
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      setUserName(name || t('guest'));
      setUserPhoneNumber(phoneNumber || t('unknown'));
    };

    fetchUserData();
  }, []);

  return (
    <View style={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        <Image source={require("../assets/drawer.png")} style={styles.logo} />
        <Text style={styles.appName}>HelpEZ</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={styles.spacer} />
      <View style={styles.userInfo}>
        <Image source={require("../assets/avatar.png")} style={styles.avatar} />
        <View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userPhoneNumber}>{userPhoneNumber}</Text>
        </View>
      </View>
    </View>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();  // Initialize useTranslation hook
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
        <Drawer.Screen
          name={t('Home')}
          component={Home}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="home-outline" size={22} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name={t('Nearby')}
          component={Nearby}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="map-marker-radius" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name={t('Weather')}
          component={Weather}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="weather-partly-cloudy" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name={t('Family')}
          component={Family}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="nature-people" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name={t('Incidents')}
          component={Incidents}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="home-flood" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name={t('Requests')}
          component={Requests}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="hand-heart-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen 
          name={t('MemberSignup')} 
          component={MemberSignup}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="account-plus-outline" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name={t('ResourcesTracking')}
          component={ResourcesTrackingScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="earth" size={22} color={color} />
            ),
          }}
        />

        <Drawer.Screen
          name={t('MedicineInfo')}
          component={MedicineInfoScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="pill" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name={t('Logout')}
          component={Logout}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="logout" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
  name={t('Community')}
  component={CommunityScreen}
  options={{
    drawerIcon: ({ color }) => (
      <Icon name="account-group" size={22} color={color} />
    ),
  }}
/>
        <Drawer.Screen
          name={t('Analytics')}
          component={Analytics}
          options={{
            drawerIcon: ({ color }) => (
              <MaterialIcons name="analytics" size={22} color={color} />
            ),
          }}
        />

         <Drawer.Screen
          name={t('Profile')}
          component={ProfileScreen}
          options={{
            drawerIcon: ({ color }) => (
              <Icon name="account-circle-outline" size={22} color={color} />
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
    backgroundColor: 'transparent',
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
  spacer: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 18,
    backgroundColor: '#e6e6e6',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  userPhoneNumber: {
    fontSize: 14,
    color: "gray",
  },
});

export default Dashboard;
