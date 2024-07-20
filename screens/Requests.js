import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import app from "../utils/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from 'react-i18next';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Requests() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const [refreshing, setRefreshing] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (phoneNumber) {
        const q = query(
          collection(db, "requests"),
          where("contact", "==", phoneNumber)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => {
          const vals = doc.data();
          const id = doc.id;
          return { id, ...vals };
        });
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  useEffect(() => {
    fetchRequests();

    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Handle received notification
      console.log(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle notification response
      console.log(response);
    });

    const unsubscribe = onSnapshot(query(collection(db, "requests"), where("sendAlert", "==", true)), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "modified") {
          const request = change.doc.data();
          schedulePushNotification(request);
        }
      });
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      unsubscribe();
    };
  }, []);
  

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchRequests();
      setRefreshing(false);
    }, 100);
  }, []);

  async function schedulePushNotification(request) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Alert: ${request.requestTitle}`,
        body: `${request.requestDescription}\nNeeded by: ${request.neededBy}`,
      },
      trigger: { seconds: 2 },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Device.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      //   onPress={() => navigation.navigate("RequestDetails", { request: item })}
      className="bg-white m-2 rounded-lg shadow-md overflow-hidden"
    >
      <View className="p-4">
        <Text className="text-lg font-bold text-gray-800">
          {item.requestTitle}
        </Text>
        {item?.requestDescription && (
          <Text className="text-sm text-gray-600 my-1">
            Additional Info: {item.requestDescription}
          </Text>
        )}
        <Text className="text-sm text-gray-500">
          Needed By: {item.neededBy}
        </Text>
        <Text className="text-sm text-gray-500">
          Location: {item.location.latitude}, {item.location.longitude}
        </Text>
        <Text className="text-sm text-gray-500">Severity: {item.severity}</Text>
        {item.alertSent && (
          <Text className="text-sm text-green-500 mt-2">Alert Sent</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-gray-900 p-4 rounded m-4 items-center"
        onPress={() => navigation.navigate("RequestResources")}
      >
        <Text className="text-white font-bold text-lg">Add a Request</Text>
      </TouchableOpacity>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : requests.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg text-gray-600">
            You haven't requested anything yet!!
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 8 }}
        />
      )}
    </View>
  );
}