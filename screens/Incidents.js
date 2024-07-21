import React, { useState, useEffect, useCallback } from "react";
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
import { collection, getDocs, getFirestore, doc, updateDoc, onSnapshot, doc   } from "firebase/firestore";
import app from "../utils/firebase";
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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

  const categories = [
    "All",
    "Natural",
    "Accident",
    "Medical",
    "Environmental",
    "Technological",
    "Miscellaneous",
  ];
  const db = getFirestore(app);

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

    const setupNotificationListener = async () => {
      const phoneNumber = await AsyncStorage.getItem("phoneNumber");
console.log(phoneNumber);
      if (phoneNumber) {
        const userRef = doc(db, "users", phoneNumber);
        unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
          const userData = docSnapshot.data();
          if (userData && userData.isAssigned) {
            await showNotification(
              "New Volunteer Assignment",
              `You've been assigned to: ${userData.assignedIncident.title}`
            );
          }
        });
      }
    };

    setupNotificationListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const showNotification = async (title, body) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
      },
      trigger: null,
    });
  };


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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("ReportIncident")}
        >
          <Icon name="plus-circle" size={28} color="#007bff" />
        </TouchableOpacity>
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
  cardContent: {
    flexDirection: 'row',
    padding: 10,
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
    width: 80,
    height: 80,
    borderRadius: 10,
    marginLeft: 10,
  },
  updateButton: {
    backgroundColor: 'black',
    paddingVertical: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});
