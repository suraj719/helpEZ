import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useFonts } from 'expo-font';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, getFirestore, query, where } from "firebase/firestore";

import app from "../utils/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Incidents from './Incidents';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';
import { getLocationName } from './reverseGeocode';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

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
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [userName, setUserName] = useState('');
  const languageSwitchRef = useRef(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [incidents, setIncidents] = useState([]); // Added incidents state

  const fetchUserImage = async (userName) => {
    try {
      const db = getFirestore(app);
      const profilesRef = collection(db, "profiles");
      const q = query(profilesRef, where("name", "==", userName));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        if (data.profileImage) {
          setProfileImageUrl(data.profileImage);
        } else {
          // Fallback image if no profileImage is found
          setProfileImageUrl('https://cdn.usegalileo.ai/stability/40da8e6a-16f8-4274-80c2-9c349493caaa.png');
        }
      } else {
        console.log('No matching user found');
        // Fallback image if no user document is found
        setProfileImageUrl('https://cdn.usegalileo.ai/stability/40da8e6a-16f8-4274-80c2-9c349493caaa.png');
      }
    } catch (error) {
      console.error('Error fetching user image:', error);
      // Fallback image on error
      setProfileImageUrl('https://cdn.usegalileo.ai/stability/40da8e6a-16f8-4274-80c2-9c349493caaa.png');
    }
  };
  
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('name');
        if (name !== null) {
          setUserName(name);
          fetchUserImage(name);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
    fetchIncidents(); // Fetch incidents when the component mounts
  }, []);
  
  const db = getFirestore(app);

  const fetchIncidents = async () => {
    try {
      const snapshot = await getDocs(collection(db, "incidents"));
      const allIncidents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Shuffle and select 3 random incidents
      const shuffled = allIncidents.sort(() => 0.5 - Math.random());
      const topThree = shuffled.slice(0, 3);
      
      setIncidents(topThree);

      const storedIncidents = await AsyncStorage.getItem('storedIncidents');
      const incidentIds = snapshot.docs.map(doc => doc.id);
      
      if (!storedIncidents || JSON.stringify(incidentIds) !== storedIncidents) {
        setNewNotifications(true);
        await AsyncStorage.setItem('storedIncidents', JSON.stringify(incidentIds));
        showToast();
      } else {
        setNewNotifications(false);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

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
      <LanguageSwitch
          switchLanguage={switchLanguage}
          selectedLanguage={selectedLanguage}
        />
        <Text style={styles.headerTitle}>{t('HelpEZ')}</Text>
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
            source={{ uri: profileImageUrl || 'https://cdn.usegalileo.ai/stability/40da8e6a-16f8-4274-80c2-9c349493caaa.png' }}
          />
          <View style={styles.profileText}>
            <Text style={styles.title}>
              {t('hello')}, {userName ? userName : t('user')}
            </Text>
            <Text style={styles.status}>{t('You are in a safe area.')}</Text>
          </View>
        </View>
      </View>


      <Text style={styles.sectionTitle}>{t('Quick Access')}</Text>
      <View style={styles.quickAccessSection}>
        <QuickAccessCard
          title={t('Report Incident')}
          imageUrl="https://cdn.usegalileo.ai/stability/16d1a4dc-e978-4f52-bc09-9df8bcee6adc.png"
          onPress={() => navigation.navigate('Incidents')}
        />
        <QuickAccessCard
          title={t('Request Help')}
          imageUrl="https://cdn.usegalileo.ai/sdxl10/ff21b330-4886-4c44-ac3d-44fdcdc78bb1.png"
          onPress={() => navigation.navigate('Requests')}
        />
        <QuickAccessCard
          title={t('Volunteer Signup')}
          imageUrl="https://cdn.usegalileo.ai/stability/2da7510c-5bd1-46b8-9dc9-858a1d67bf4f.png"
          onPress={() => navigation.navigate('VolunteerSignup')}
        />
        <QuickAccessCard
          title={t('User Guide')}
          imageUrl="https://cdn.usegalileo.ai/stability/2da7510c-5bd1-46b8-9dc9-858a1d67bf4f.png"
          onPress={() => navigation.navigate('UserGuide')}
        />
      </View>
      

      <Text style={styles.sectionTitle}>{t('Recent Incidents')}</Text>
    {incidents.length === 0 ? (
      <ActivityIndicator size="large" color="#0000ff" />
    ) : (
      incidents.map((incident) => (
        <IncidentCard
          key={incident.id}
          title={incident.title || 'Untitled'}
          location={incident.location || { latitude: 0, longitude: 0 }}
          onPress={() => navigation.navigate('IncidentDetails', { incident })}
        />
      ))
    )}

      <Text style={styles.sectionTitle}>{t('Resources')}</Text>
      <View style={styles.resourceSection}>
        <ImageBackground
          style={styles.resourceImage}
          source={{ uri: 'https://cdn.usegalileo.ai/maps/837c0b68-3005-4200-b222-e94625e368ee.png' }}
        />
      </View>
    </ScrollView>
  );
};

const QuickAccessCard = ({ title, imageUrl, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <ImageBackground
        style={styles.quickAccessCard}
        source={{ uri: imageUrl }}
        imageStyle={styles.cardImage}
      >
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardText}>{title}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};


const IncidentCard = ({ title, location, onPress }) => {
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    const fetchLocationName = async () => {
      const name = await getLocationName(location.latitude, location.longitude);
      setLocationName(name);
    };

    fetchLocationName();
  }, [location.latitude, location.longitude]);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.incidentCard}>
        <View style={styles.incidentCardText}>
          <Text style={styles.incidentTitle}>{title || 'Untitled'}</Text>
          <Text style={styles.incidentLocation}>{locationName || 'Fetching location...'}</Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={24} color="black" />
      </View>
    </TouchableOpacity>
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