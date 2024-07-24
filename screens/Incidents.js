import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { collection, getDoc, getDocs, getFirestore, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { app } from "../utils/firebase";
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as Device from 'expo-device';
import Icon from 'react-native-vector-icons/FontAwesome';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export default function Incidents() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [disabledButtons, setDisabledButtons] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const db = getFirestore(app);

  const categories = [
    "All",
    "Natural",
    "Accident",
    "Medical",
    "Environmental",
    "Technological",
    "Miscellaneous",
  ];

  const fetchIncidents = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "incidents"));
    const data = snapshot.docs.map((doc) => {
      const vals = doc.data();
      const id = doc.id;
      return { id, ...vals };
    });
    setIncidents(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchIncidents();
    }, [])
  );

  useEffect(() => {
    fetchIncidents();
  }, []);
  useEffect(() => {
    let unsubscribe;
    let previousIsAssigned = null;

    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        setExpoPushToken(token);
        console.log("token:", token);

        const phoneNumber = await AsyncStorage.getItem("phoneNumber");

        // Fetch the user document based on phoneNumber
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userDoc = querySnapshot.docs.find(doc => doc.data().phoneNumber === phoneNumber);

        if (userDoc) {
          const userRef = doc(db, 'users', userDoc.id);

          // Set up Firestore listener for the user document
          unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
              const userData = docSnapshot.data();
              console.log("User data:", userData);

              const currentIsAssigned = userData.isAssigned || false;

              if (previousIsAssigned !== null && currentIsAssigned !== previousIsAssigned) {
                setIsAssigned(currentIsAssigned);
                console.log("isassigned" + currentIsAssigned);

                if (currentIsAssigned) {
                  await schedulePushNotification(
                    "New Volunteer Assignment",
                    `You've been assigned to: ${userData.assignedIncident?.title || 'an incident'}`
                  );
                } else {
                  await schedulePushNotification(
                    "Your volunteer status",
                    `You've been removed from volunteering for: ${userData.assignedIncident?.title || 'an incident'}`
                  );
                }
              }

              previousIsAssigned = currentIsAssigned;
            }
          });
        } else {
          console.log("No user found with the given phone number");
        }

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
          setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
          console.log("Notification response:", response);
        });
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

  const scheduleStaticNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification with static content.",
      },
      trigger: { seconds: 2 },
    });
    Alert.alert("Notification Scheduled", "You should receive a notification in 2 seconds.");
  };

  async function schedulePushNotification(title, body) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: { seconds: 2 },
    });
    Alert.alert("Notification Scheduled", "You should receive a notification in 5 seconds.");
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
      console.log(token);
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


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      fetchIncidents();
      setRefreshing(false);
    }, 100);
  }, []);

  const filteredIncidents =
    selectedCategory !== "All"
      ? incidents.filter((incident) => incident.category === selectedCategory)
      : incidents;

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

  const handleVote = async (incidentId, voteType) => {
    if (!phoneNumber) {
      console.error("Phone number not found in AsyncStorage");
      return;
    }

    const incidentRef = doc(db, "incidents", incidentId);
    try {
      const incidentDoc = await getDoc(incidentRef);
      const incidentData = incidentDoc.data();

      // Initialize upvotes and downvotes if they are undefined
      if (incidentData.upvotes === undefined) {
        incidentData.upvotes = 0;
      }
      if (incidentData.downvotes === undefined) {
        incidentData.downvotes = 0;
      }

      const userVote = incidentData.votes ? incidentData.votes[phoneNumber] : null;

      let updatedData = { ...incidentData };
      let newVotes = { ...incidentData.votes, [phoneNumber]: voteType };

      if (userVote === voteType) {
        // If user clicks the same vote type again, remove their vote
        delete newVotes[phoneNumber];
        if (voteType === "upvote") {
          updatedData.upvotes -= 1;
        } else if (voteType === "downvote") {
          updatedData.downvotes -= 1;
        }
      } else {
        if (userVote === "upvote") {
          updatedData.upvotes -= 1;
        } else if (userVote === "downvote") {
          updatedData.downvotes -= 1;
        }
        if (voteType === "upvote") {
          updatedData.upvotes += 1;
        } else if (voteType === "downvote") {
          updatedData.downvotes += 1;
        }
      }

      updatedData.votes = newVotes;

      // Optimistic update: Update incidents state
      const updatedIncidents = incidents.map((item) =>
        item.id === incidentId ? { ...item, ...updatedData } : item
      );
      setIncidents(updatedIncidents);

      // Update Firestore
      await updateDoc(incidentRef, updatedData);
    } catch (error) {
      console.error("Error updating incident vote:", error);
      fetchIncidents();
    }
  };



  const renderEventItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("IncidentDetails", { incident: item })}
        style={styles.card}
      >
        {item?.images?.length > 0 ? (
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.description}>
                {item.description}
              </Text>
              <Text style={[styles.severity, { color: getSeverityColor(item.severity) }]}>
                Severity: {item.severity}
              </Text>
            </View>
            <Image
              source={{ uri: item.images[0] }}
              style={styles.image}
            />
            <View className="flex-row mt-2 items-center" style={styles.vote}>
              <TouchableOpacity
                onPress={() => handleVote(item.id, "upvote")}
                className="flex-row items-center"
              >
                <MaterialCommunityIcons name="arrow-up-bold-outline" size={24} color="grey" />
                <Text className="text-grey-500 ml-2">({item.upvotes || 0})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleVote(item.id, "downvote")}
                className="flex-row items-center"
              >
                <MaterialCommunityIcons name="arrow-down-bold-outline" size={24} color="grey" />
                <Text className="text-grey-500 ml-2">({item.downvotes || 0})</Text>
              </TouchableOpacity>
            </View>

          </View>
        ) : (
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text numberOfLines={2} style={styles.description}>
                {item.description}
              </Text>
              <Text style={[styles.severity, { color: getSeverityColor(item.severity) }]}>
                Severity: {item.severity}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.updateButton,
          disabledButtons.includes(item.id) && styles.disabledButton,
        ]}
        onPress={() => handleSignUpToVolunteer(item.id)}
        disabled={disabledButtons.includes(item.id)}
      >
        <Text style={styles.updateButtonText}>Sign Up to Volunteer</Text>
      </TouchableOpacity>
    </View>
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

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const phoneNumber = await AsyncStorage.getItem('phoneNumber');
        if (phoneNumber !== null) {
          setPhoneNumber(phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching phone number:', error);
      }
    };
    fetchPhoneNumber();
  }, []);

  const handleSignUpToVolunteer = async (incidentId) => {
    try {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
      console.log('Retrieved phone number for update:', phoneNumber);

      if (phoneNumber !== null) {
        const incidentRef = doc(db, "incidents", incidentId);

        const incidentSnapshot = await getDoc(incidentRef);
        const currentData = incidentSnapshot.data();
        const currentVolunteerUsers = currentData.VolunteerUsers || [];

        if (!currentVolunteerUsers.includes(phoneNumber)) {
          const updatedVolunteerUsers = [...currentVolunteerUsers, phoneNumber];
          await updateDoc(incidentRef, { VolunteerUsers: updatedVolunteerUsers });
        }

        setDisabledButtons([...disabledButtons, incidentId]);
        fetchIncidents();
        Alert.alert("Success", "You have signed up to volunteer!");
      } else {
        console.error("No phone number found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error updating incident: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map(renderCategoryItem)}
        </ScrollView>

      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : filteredIncidents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No incidents reported in this category.
          </Text>
        </View>
      ) : (
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={filteredIncidents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatListContainer}
          ListFooterComponent={<View style={styles.footer} />}
        />
      )}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("ReportIncident")}
        style={styles.plusIcon}
      >
        <Icon name="plus-circle" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e5e5',
  },
  categoryScroll: {
    flexGrow: 0,
    marginHorizontal: 10,
  },
  categoryButton: {
    height: 40,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'transparent',
  },
  selectedCategoryButton: {
    borderBottomColor: '#007bff',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
  selectedCategoryText: {
    color: '#007bff',
  },
  cardContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  Icon: {
    position: 'absolute',
    bottom: -680,
    right: 20,
    zIndex: 10,
  },
  vote: {
    position: 'absolute',
    bottom: -10, // Place it at the bottom of the card
    right: 0, // Align it to the right side of the screen
    backgroundColor: 'white',
    borderColor: 'grey',
    borderRadius: '70%',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center', // Center items vertically
  },
  cardContent: {
    flexDirection: 'row',
    padding: 10,
    paddingBottom: 10, // Add padding to avoid overlap with vote section
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  severity: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginLeft: 10,
    top: -20,
  },
  updateButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    marginTop: 10, // Add margin to separate from the card content
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  plusIcon: {
    backgroundColor: "#383838",
    position: "absolute",
    bottom: 20,
    right: 20,
    borderRadius: 20,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  flatListContainer: {
    padding: 15,
  },
  footer: {
    height: 80,
  },
  testNotificationButton: {
    backgroundColor: '#007bff',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  testNotificationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});