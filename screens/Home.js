import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { useFonts } from "expo-font";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import LanguageSwitch from "./LanguageSwitch";
import { getLocationName } from "./reverseGeocode";
import app from "../utils/firebase";

const { width } = Dimensions.get("window");

const Home = () => {
  const [fontsLoaded] = useFonts({
    "NotoSans-Regular": require("../assets/fonts/NotoSans-VariableFont_wdth,wght.ttf"),
    "NotoSans-Bold": require("../assets/fonts/NotoSans-Italic-VariableFont_wdth,wght.ttf"),
    "PublicSans-Regular": require("../assets/fonts/PublicSans-VariableFont_wght.ttf"),
    "PublicSans-Bold": require("../assets/fonts/PublicSans-Italic-VariableFont_wght.ttf"),
  });

  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [newNotifications, setNewNotifications] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [userName, setUserName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [incidents, setIncidents] = useState([]);

  const fetchUserImage = useCallback(async (userName) => {
    try {
      const db = getFirestore();
      const profilesRef = collection(db, "profiles");
      const q = query(profilesRef, where("name", "==", userName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        setProfileImageUrl(
          data.profileImage ||
            "https://cdn.usegalileo.ai/stability/40da8e6a-16f8-4274-80c2-9c349493caaa.png"
        );
      } else {
        setProfileImageUrl(
          "https://cdn.usegalileo.ai/stability/40da8e6a-16f8-4274-80c2-9c349493caaa.png"
        );
      }
    } catch (error) {
      console.error("Error fetching user image:", error);
      setProfileImageUrl(
        "https://cdn.usegalileo.ai/stability/40da8e6a-16f8-4274-80c2-9c349493caaa.png"
      );
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const name = await AsyncStorage.getItem("name");
        if (name !== null) {
          setUserName(name);
          fetchUserImage(name);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
    fetchIncidents();
  }, [fetchUserImage]);

  const db = getFirestore(app);

  const fetchIncidents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "incidents"));
      const allIncidents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const shuffled = allIncidents.sort(() => 0.5 - Math.random());
      const topThree = shuffled.slice(0, 3);

      setIncidents(topThree);

      const storedIncidents = await AsyncStorage.getItem("storedIncidents");
      const incidentIds = snapshot.docs.map((doc) => doc.id);

      if (!storedIncidents || JSON.stringify(incidentIds) !== storedIncidents) {
        setNewNotifications(true);
        await AsyncStorage.setItem(
          "storedIncidents",
          JSON.stringify(incidentIds)
        );
        showToast();
      } else {
        setNewNotifications(false);
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  const showToast = () => {
    Toast.show({
      type: "info",
      text1: "New Incidents Detected!",
      text2: "Check the Notifications tab for details.",
      visibilityTime: 7000,
      autoHide: true,
      topOffset: 30,
      bottomOffset: 40,
    });
  };

  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.header}>
        <LanguageSwitch
          switchLanguage={switchLanguage}
          selectedLanguage={selectedLanguage}
        />
        <Text style={styles.headerTitle}>{t("HelpEZ")}</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {
            setNewNotifications(false);
            navigation.navigate("Notifications");
          }}
        >
          <Ionicons
            name={newNotifications ? "notifications" : "notifications-outline"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profile}>
          <Image
            style={styles.profileImage}
            source={{
              uri:
                profileImageUrl ||
                "https://cdn.usegalileo.ai/stability/40da8e6a-16f8-4274-80c2-9c349493caaa.png",
            }}
          />
          <View style={styles.profileText}>
            <Text style={styles.title}>
              {t("hello")}, {userName ? userName : t("user")}
            </Text>
            <Text style={styles.status}>{t("You are in a safe area.")}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>{t("Quick Access")}</Text>
      <View style={styles.quickAccessSection}>
        <QuickAccessCard
          title={t("Report Incident")}
          imageUrl="https://img.freepik.com/premium-vector/emergency-alarm-icon-flat-style-alert-lamp-vector-illustration-isolated-background-police-urgency-sign-business-concept_157943-917.jpg?uid=R110274580&ga=GA1.1.1726183600.1719757584&semt=sph"
          onPress={() => navigation.navigate("Incidents")}
        />
        <QuickAccessCard
          title={t("Request Help")}
          imageUrl="https://img.freepik.com/premium-vector/two-women-packing-box-with-t-shirts-heart-it-volunteer-day-design_278713-650.jpg?uid=R110274580&ga=GA1.1.1726183600.1719757584&semt=ais_user"
          onPress={() => navigation.navigate("Requests")}
        />
        <QuickAccessCard
          title={t("Volunteer Signup")}
          imageUrl="https://firebasestorage.googleapis.com/v0/b/helpez.appspot.com/o/home3.png?alt=media&token=72b81e8f-99df-4c46-a8f4-9093d6685d34"
          onPress={() => navigation.navigate("MemberSignup")}
        />
        <QuickAccessCard
          title={t("User Guide")}
          imageUrl="https://img.freepik.com/free-vector/person39s-personal-data-biography-vector_530521-1773.jpg?uid=R110274580&ga=GA1.1.1726183600.1719757584&semt=ais_user"
          onPress={() => navigation.navigate("UserGuide")}
        />
      </View>

      <Text style={styles.sectionTitle}>{t("Recent Incidents")}</Text>
      {incidents.length === 0 ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        incidents.map((incident) => (
          <IncidentCard
            key={incident.id}
            title={incident.title || "Untitled"}
            location={incident.location || { latitude: 0, longitude: 0 }}
            onPress={() => navigation.navigate("IncidentDetails", { incident })}
          />
        ))
      )}

      <Text style={styles.sectionTitle}>{t("Resources")}</Text>
      <View style={styles.resourceSection}>
        <ImageBackground
          style={styles.resourceImage}
          source={{
            uri: "https://cdn.usegalileo.ai/maps/837c0b68-3005-4200-b222-e94625e368ee.png",
          }}
        />
      </View>
      {/* <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => navigation.navigate('ChatBot')}
      >
        <MaterialIcons name="chat" size={40} color="#fff" />
      </TouchableOpacity> */}
      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => {
          //scrollToTop();
          navigation.navigate("ChatBot"); // Uncomment if you want to navigate to ChatBot
        }}
      >
        <MaterialIcons name="chat" size={40} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const QuickAccessCard = ({ title, imageUrl, onPress }) => {
  return (
    <TouchableOpacity style={styles.quickAccessCard} onPress={onPress}>
      <Image style={styles.quickAccessImage} source={{ uri: imageUrl }} />
      <Text style={styles.quickAccessText}>{title}</Text>
    </TouchableOpacity>
  );
};

const IncidentCard = ({ title, location, onPress }) => {
  const [locationName, setLocationName] = useState("Fetching location...");
  const locationRef = useRef(location);

  useEffect(() => {
    if (location) {
      getLocationName(location.latitude, location.longitude)
        .then((name) => setLocationName(name))
        .catch(() => setLocationName("Location not found"));
    }
  }, [location]);

  return (
    <TouchableOpacity style={styles.incidentCard} onPress={onPress}>
      <View style={styles.incidentCardText}>
        <Text style={styles.incidentCardTitle}>{title}</Text>
        <Text style={styles.incidentCardSubtitle}>{locationName}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "PublicSans-Bold",
  },
  notificationButton: {
    padding: 8,
  },
  profileSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: "#ccc",
    borderWidth: 2,
  },
  profileText: {
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: "NotoSans-Bold",
  },
  status: {
    fontSize: 16,
    fontFamily: "NotoSans-Regular",
    color: "#555",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PublicSans-Bold",
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  quickAccessSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAccessCard: {
    width: (width - 48) / 2,
    height: 160,
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAccessImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  quickAccessText: {
    position: "absolute",
    paddingTop: 10,
    bottom: 5,
    left: 8,
    right: 8,
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "PublicSans-Bold",
  },
  incidentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  incidentCardText: {
    flex: 1,
  },
  incidentCardTitle: {
    fontSize: 16,
    fontFamily: "PublicSans-Bold",
  },
  incidentCardSubtitle: {
    fontSize: 14,
    fontFamily: "PublicSans-Regular",
    color: "#555",
  },
  resourceSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  resourceImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
  },
  chatbotButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "black",
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
});

export default Home;
