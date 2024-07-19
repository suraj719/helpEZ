import "intl-pluralrules";
import { useTranslation, I18nextProvider } from "react-i18next";
import React, { useEffect, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "./UserContext";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import Geolocation from "react-native-geolocation-service";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { ActivityIndicator, View } from "react-native";
import { app } from "./utils/firebase";

import Register from "./screens/Register";
import Dashboard from "./screens/Dashboard";
import IncidentDetails from "./screens/IncidentDetails";
import ReportIncident from "./screens/ReportIncident";
import RequestResources from "./screens/RequestResources";
import Family from "./screens/Family";
import ChatScreen from "./screens/ChatScreen";
import MemberSignup from "./screens/MemberSignup";
import Home from "./screens/Home";
import Notifications from "./screens/Notifications";
import ResourceRouteScreen from "./screens/ResourceRouteScreen";
import GalileoDesign from "./screens/GalileoDesign";
import RegisterDetails from "./screens/RegisterDetails";
import i18n from "./screens/i18n";

const Stack = createStackNavigator();

const App = () => {
  const { t } = useTranslation();
  const [fontsLoaded] = useFonts({
    RobotoRegular: Roboto_400Regular,
    RobotoBold: Roboto_700Bold,
  });
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("GalileoDesign");

  const validateUser = async (navigation) => {
    const phoneNumber = await AsyncStorage.getItem("phoneNumber");
    if (phoneNumber) {
      try {
        const db = getFirestore(app);
        const usersCollection = collection(db, "users");
        const q = query(
          usersCollection,
          where("phoneNumber", "==", phoneNumber)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          await AsyncStorage.setItem(
            "phoneNumber",
            querySnapshot.docs[0].data().phoneNumber
          );
          await AsyncStorage.setItem("name", querySnapshot.docs[0].data().name); // Store name here
          setInitialRoute("Dashboard");
        } else {
          await AsyncStorage.removeItem("phoneNumber");
          await AsyncStorage.removeItem("name");
          setInitialRoute("GalileoDesign");
        }
      } catch (error) {
        console.log(error);
        setInitialRoute("GalileoDesign");
      }
    } else {
      setInitialRoute("GalileoDesign");
    }
    setLoading(false);
  };

  useEffect(() => {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: "whenInUse", // or 'always'
    });

    const checkStoredUser = async () => {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (phoneNumber) {
        validateUser();
      } else {
        setLoading(false);
      }
    };

    checkStoredUser();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <UserProvider>
        <NavigationContainer>
          <SafeAreaView className="flex-1">
            <StatusBar style="dark" />
            {loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#000" />
              </View>
            ) : (
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
                initialRouteName={initialRoute}
              >
                <Stack.Screen name="GalileoDesign" component={GalileoDesign} />
                <Stack.Screen name="Register" component={Register} />
                <Stack.Screen
                  name="RegisterDetails"
                  component={RegisterDetails}
                />
                <Stack.Screen name="Dashboard" component={Dashboard} />
                <Stack.Screen
                  name="ReportIncident"
                  component={ReportIncident}
                />
                <Stack.Screen
                  name="IncidentDetails"
                  component={IncidentDetails}
                />
                <Stack.Screen
                  name="RequestResources"
                  component={RequestResources}
                />
                <Stack.Screen name="Family" component={Family} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen
                  name="MemberSignup"
                  component={MemberSignup}
                />
                <Stack.Screen name={t("Home")} component={Home} />
                <Stack.Screen name="Notifications" component={Notifications} />
                <Stack.Screen
                  name="ResourceRouteScreen"
                  component={ResourceRouteScreen}
                />
              </Stack.Navigator>
            )}
            <Toast visibilityTime={2000} swipeable={true} position="bottom" />
          </SafeAreaView>
        </NavigationContainer>
      </UserProvider>
    </I18nextProvider>
  );
};

export default App;
