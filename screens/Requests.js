import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  collection,
  getDoc,
  getDocs,
  getFirestore,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import app from "../utils/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const db = getFirestore(app);
  const [refreshing, setRefreshing] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState("");
  const [sendAlert, setSendAlert] = useState(false);
  const [phone, setPhone] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  // const reversedFilteredRequests = filteredRequests.slice().reverse();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      setPhone(phoneNumber);
      if (phoneNumber) {
        const q = query(
          collection(db, "requests")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => {
          const vals = doc.data();
          const id = doc.id;
          return { id, ...vals };
        });
        const reversedData = data.reverse();
        setRequests(reversedData);
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
    let unsubscribe;
    let previousSend = null;

    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
        console.log("token:", token);

        const phoneNumber = await AsyncStorage.getItem("phoneNumber");

        // Fetch the user document based on phoneNumber
        const querySnapshot = await getDocs(collection(db, "requests"));
        const requestDoc = querySnapshot.docs.find(
          (doc) => doc.data().contact === phoneNumber
        );

        if (requestDoc) {
          const requestRef = doc(db, "requests", requestDoc.id);

          // Set up Firestore listener for the user document
          unsubscribe = onSnapshot(requestRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
              const requestData = docSnapshot.data();
              console.log("Request data:", requestData);

              const currentAlert = requestData.sendAlert || false;

              if (previousSend !== null && currentAlert !== previousSend) {
                setSendAlert(currentAlert);
                console.log("isSend" + currentAlert);

                if (currentAlert) {
                  await schedulePushNotification(
                    "Request Alert",
                    `Your request about ${requestData.requestTitle} has been published.`
                  );
                }
              }

              previousSend = currentAlert;
            }
          });
        } else {
          console.log("No requests found with the given phone number");
        }

        notificationListener.current = Notifications.addNotificationReceivedListener(
          (notification) => {
            setNotification(notification);
          }
        );

        responseListener.current = Notifications.addNotificationResponseReceivedListener(
          (response) => {
            console.log("Notification response:", response);
          }
        );
      } catch (error) {
        console.error("Error in setupNotifications:", error);
      }
    };

    setupNotifications();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchRequests();
      setRefreshing(false);
    }, 100);
  }, []);

  async function schedulePushNotification(title, body) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: { seconds: 2 },
    });
  }

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }

    if (Device.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return "#e3342f";
      case "Moderate":
        return "#f59e0b";
      case "Low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const filteredRequests = requests.filter((request) =>
    selectedCategory === "All"
      ? true
      : request.contact === phone
  );

  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category}
      activeOpacity={0.7}
      style={[
        styles.categoryButton,
        selectedCategory === category && styles.selectedCategoryButton,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category && styles.selectedCategoryText,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );
  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("RequestDetails", { request: item })}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.requestTitle}</Text>
        {item?.requestDescription && (
          <Text style={styles.description}>
            {item.requestDescription}
          </Text>
        )}
        <Text style={styles.info}>Needed By: {item.neededBy}</Text>
        <Text style={styles.info}>
          Supplied from: {item.warehouseName}
        </Text>
        <Text style={[styles.info, { color: getSeverityColor(item.severity) }]}>
          Severity: {item.severity}
        </Text>
        <View style={styles.deliveryStatus}>
          <View style={styles.greenDot} />
          <Text style={styles.info}>Delivery Status: {item.status}</Text>
        </View>
        {item.alertSent && (
          <Text style={styles.alert}>Alert Sent</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.addButton}
        onPress={() => navigation.navigate("RequestResources")}
      >
        <Text style={styles.addButtonText}>Add a Request</Text>
      </TouchableOpacity>
      <View style={styles.categoryContainer}>
         {["All", "My Requests"].map((category) =>
          renderCategoryItem(category)
        )}
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            You haven't requested anything yet!!
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={filteredRequests}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contentContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 5,
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  selectedCategoryButton: {
    backgroundColor: "#000000",
  },
  categoryText: {
    fontSize: 16,
    color: "#4b5563",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  addButton: {
    backgroundColor: "#000000",
    padding: 15,
    margin: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#4b5563",
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardContent: {
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#4b5563",
  },
  deliveryStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 4,
  },
  alert: {
    fontSize: 14,
    color: "#e3342f",
    marginTop: 8,
  },
  selectedCategoryButton: {
    backgroundColor: "#000000",
  },
});
