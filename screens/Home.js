import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../utils/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Incidents from './Incidents';
import { useTranslation } from 'react-i18next';
import LanguageSwitch from './LanguageSwitch';

export default function Home() {
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

  return (
    <ImageBackground
      source={require("../assets/images/temp.png")}
      style={{ width: "100%", height: "100%" }}
    >
      <View style={styles.header}>
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
        <View style={styles.container}>
          <LanguageSwitch 
            ref={languageSwitchRef} 
            switchLanguage={switchLanguage} 
            selectedLanguage={selectedLanguage} 
          />
        </View>
      </View>


      <View style={styles.content}>
        <Text style={styles.title}>
          {t('hello')}, {userName ? userName : t('user')}
        </Text>

        <View style={styles.searchContainer}>
          <Image
            source={require("../assets/images/search.png")}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder={t('search')}
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Incidents")}
            style={styles.scrollItem}
          >
            <Image
              source={require("../assets/images/p.png")}
              style={styles.scrollItemImage}
            />
          </TouchableOpacity>

          <View style={[styles.scrollItem, styles.scrollItemTrain]}>
            <Ionicons name="train" color="white" size={32} />
          </View>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 66,
              width: 66,
              borderRadius: 50,
              backgroundColor: "#ffa06c",
            }}
          >
            <Ionicons name="bus" color="white" size={32} />
          </View>

          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 66,
              width: 66,
              borderRadius: 50,
              backgroundColor: "#bb32fe",
              marginLeft: 22,
            }}
          >
             <Ionicons name="bus" color="white" size={32} />
          </View>
        </ScrollView>

        <Text
          style={{
            color: "black",
            fontFamily: "RobotoRegular",
            marginTop: 50,
            fontSize: 20, 
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 1,
            textAlign: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
          }}
        >
          {t('recommended')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -40, marginTop: 30 }}
        >
          <View
            style={{
              backgroundColor: "#FEFEFE",
              height: 200,
              width: 190,
              borderRadius: 15,
              padding: 5,
            }}
          >
            <Image
              source={require("../assets/images/1.jpg")}
              style={{ width: 180, borderRadius: 10, height: 130 }}
            />
            <View
              style={{
                flexDirection: "row",
                width: 150,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: "RobotoRegular",
                    fontSize: 11,
                    color: "#a2a2db",
                  }}
                >
                  {t('image_description_1')}
                </Text>
              </View>
              <Ionicons name="location-outline" size={25} color="#ff5c83" />
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#FEFEFE",
              height: 200,
              width: 190,
              borderRadius: 15,
              padding: 5,
              marginHorizontal: 20,
            }}
          >
            <Image
              source={require("../assets/images/2.jpg")}
              style={{ width: 180, borderRadius: 10, height: 130 }}
            />
            <View
              style={{
                flexDirection: "row",
                width: 150,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: "RobotoRegular",
                    fontSize: 11,
                    color: "#a2a2db",
                  }}
                >
                  {t('image_description_2')}
                </Text>
              </View>
              <Ionicons name="location-outline" size={25} color="#5facdb" />
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#FEFEFE",
              height: 200,
              width: 190,
              borderRadius: 15,
              padding: 5,
            }}
          >
            <Image
              source={require("../assets/images/3.jpg")}
              style={{ width: 180, borderRadius: 10, height: 130 }}
            />
            <View
              style={{
                flexDirection: "row",
                width: 150,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontFamily: "RobotoRegular",
                    fontSize: 11,
                    color: "#a2a2db",
                  }}
                >
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                </Text>
              </View>
              <Ionicons name="location-outline" size={25} color="#bb32fe" />
            </View>
          </View>
        </ScrollView>
      </View>
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  content: {
    paddingHorizontal: 40,
    marginTop: 25,
  },
  title: {
    fontSize: 40,
    color: "black",
    fontFamily: "RobotoBold",
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 40,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 30,
  },
  searchIcon: {
    height: 20,
    width: 16,
  },
  searchInput: {
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#ccccef",
  },
  scrollContainer: {
    marginRight: -40,
    marginTop: 30,
  },
  scrollItem: {
    alignItems: "center",
    justifyContent: "center",
    height: 66,
    width: 66,
    borderRadius: 50,
    backgroundColor: "#5facdb",
  },
  scrollItemTrain: {
    backgroundColor: "#ff5c83",
    marginHorizontal: 22,
  },
  scrollItemImage: {
    height: 24,
    width: 24,
  },
});
