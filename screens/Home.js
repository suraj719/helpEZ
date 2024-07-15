import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../utils/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Incidents from './Incidents';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';

const Home = () => {
  const [fontsLoaded] = useFonts({
    'NotoSans-Regular': require('../assets/fonts/NotoSans-VariableFont_wdth,wght.ttf'),
    'NotoSans-Bold': require('../assets/fonts/NotoSans-Italic-VariableFont_wdth,wght.ttf'),
    'PublicSans-Regular': require('../assets/fonts/PublicSans-VariableFont_wght.ttf'),
    'PublicSans-Bold': require('../assets/fonts/PublicSans-Italic-VariableFont_wght.ttf'),
  });

  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [newNotifications, setNewNotifications] = useState(false);
  const [userName, setUserName] = useState('');
  const languageSwitchRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    // Fetch user name from AsyncStorage
    const fetchUserName = async () => {
      try {
        const name = await AsyncStorage.getItem('name');
        if (name !== null) {
          setUserName(name);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };
    fetchUserName();
  }, []);

  const db = getFirestore(app);

  // Function to fetch incidents from Firestore and compare with stored incidents
  useFocusEffect(
    React.useCallback(() => {
      const fetchIncidents = async () => {
        const snapshot = await getDocs(collection(db, "incidents"));
        const storedIncidents = await AsyncStorage.getItem('storedIncidents');
        const incidentIds = snapshot.docs.map(doc => doc.id);
        
        if (!storedIncidents || JSON.stringify(incidentIds) !== storedIncidents) {
          setNewNotifications(true);
          await AsyncStorage.setItem('storedIncidents', JSON.stringify(incidentIds));
          showToast(); // Show toast when new incidents are detected
        } else {
          setNewNotifications(false);
        }
      };
      fetchIncidents();
    }, [])
  );

  // Function to show toast message for new incidents
  const showToast = () => {
    Toast.show({
      type: 'info',
      text1: 'New Incidents Detected!',
      text2: 'Check the Notifications tab for details.',
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HelpEZ</Text>
        <View style={styles.headerButton}>
        <View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {
            setNewNotifications(false);
            navigation.navigate('Notifications');
          }}
        >
          <Ionicons 
            name={newNotifications ? "notifications" : "notifications-outline"} 
            size={24} 
            color="black" 
          />
        </TouchableOpacity>
      </View>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profile}>
          <ImageBackground
            style={styles.profileImage}
            source={{ uri: 'https://cdn.usegalileo.ai/stability/40da8e6a-16f8-4274-80c2-9c349493caaa.png' }}
          />
          <View style={styles.profileText}>
          <Text style={styles.title}>
          {t('hello')}, {userName ? userName : t('user')}
        </Text>
            <Text style={styles.status}>You are in a safe area.</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Access</Text>
      <View style={styles.quickAccessSection}>
        <QuickAccessCard title="Report Incident" imageUrl="https://cdn.usegalileo.ai/stability/16d1a4dc-e978-4f52-bc09-9df8bcee6adc.png" />
        <QuickAccessCard title="Request Help" imageUrl="https://cdn.usegalileo.ai/sdxl10/ff21b330-4886-4c44-ac3d-44fdcdc78bb1.png" />
        <QuickAccessCard title="Volunteer Signup" imageUrl="https://cdn.usegalileo.ai/stability/2da7510c-5bd1-46b8-9dc9-858a1d67bf4f.png" />
      </View>

      <Text style={styles.sectionTitle}>Recent Incidents</Text>
      <IncidentCard title="Red flag warning" time="1 hour ago" location="San Francisco Bay Area" />
      <IncidentCard title="Heatwave warning" time="5 hours ago" location="Los Angeles" />
      <IncidentCard title="Tsunami alert" time="12 hours ago" location="Hawaii" />

      <Text style={styles.sectionTitle}>Resources</Text>
      <View style={styles.resourceSection}>
        <ImageBackground
          style={styles.resourceImage}
          source={{ uri: 'https://cdn.usegalileo.ai/maps/837c0b68-3005-4200-b222-e94625e368ee.png' }}
        />
      </View>
    </ScrollView>
  );
};

const QuickAccessCard = ({ title, imageUrl }) => {
  return (
    <ImageBackground
      style={styles.quickAccessCard}
      source={{ uri: imageUrl }}
      imageStyle={styles.cardImage}
    >
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardText}>{title}</Text>
      </View>
    </ImageBackground>
  );
};

const IncidentCard = ({ title, time, location }) => {
  return (
    <View style={styles.incidentCard}>
      <View style={styles.incidentCardText}>
        <Text style={styles.incidentTitle}>{title}</Text>
        <Text style={styles.incidentTime}>{time}</Text>
        <Text style={styles.incidentLocation}>{location}</Text>
      </View>
      <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
    </View>
  );
};

const styles = StyleSheet.create({
  notificationButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  header: {
    flexDirection: "row",
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  notificationButton: {
    marginRight: 20,
  },
  languageSwitch: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    padding: 4,
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  languageButtonSelected: {
    backgroundColor: '#007bff',
  },
  languageButtonText: {
    color: '#000',
    fontSize: 16,
  },
  languageButtonTextSelected: {
    color: '#fff',
  },
  title: {
    fontSize: 40,
    color: "black",
    fontFamily: "RobotoBold",
  },
  languageSwitch: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 25,
    padding: 4,
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  languageButtonSelected: {
    backgroundColor: '#007bff',
  },
  languageButtonText: {
    color: '#000',
    fontSize: 16,
  },
  languageButtonTextSelected: {
    color: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    paddingLeft: 48,
  },
  headerButton: {
    width: 48,
    alignItems: 'flex-end',
  },
  button: {
    padding: 8,
  },
  profileSection: {
    padding: 16,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  profileText: {
    marginLeft: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  status: {
    color: '#6B6B6B',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingLeft: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  quickAccessSection: {
    padding: 16,
  },
  quickAccessCard: {
    height: 200,
    marginBottom: 16,
    justifyContent: 'flex-end',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 16,
  },
  cardTextContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
  },
  cardText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  incidentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  incidentCardText: {
    flex: 1,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  incidentTime: {
    color: '#6B6B6B',
    fontSize: 14,
  },
  incidentLocation: {
    color: '#6B6B6B',
    fontSize: 14,
  },
  resourceSection: {
    padding: 16,
  },
  resourceImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  languageSwitchContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  
});

export default Home;
