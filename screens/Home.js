import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, getFirestore } from "firebase/firestore";
import app from "../utils/firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

export default function Home() {
  const navigation = useNavigation();
  const [newNotifications, setNewNotifications] = useState(false);
  const [userName, setUserName] = useState('');

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

  return (
    <ImageBackground
      source={require("../assets/images/back.png")}
      style={{ width: "100%", height: "100%" }}
    >
      <View
        style={{
          flexDirection: "row",
          marginTop: 40,
          alignItems: "center",
          paddingHorizontal: 40,
        }}
      >
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

      <View style={{ paddingHorizontal: 40, marginTop: 25 }}>
        <Text
          style={{
            fontSize: 40,
            color: "#522289",
            fontFamily: "RobotoBold",
          }}
        >
          Hello, {userName ? userName : 'User'}
        </Text>

        {/* <Text
          style={{
            fontSize: 15,
            paddingVertical: 10,
            paddingRight: 80,
            lineHeight: 22,
            fontFamily: "RobotoRegular",
            color: "#a2a2db",
          }}
        >
          
        </Text> */}

        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#FFF",
            borderRadius: 40,
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 20,
            marginTop: 30,
          }}
        >
          <Image
            source={require("../assets/images/search.png")}
            style={{ height: 14, width: 14 }}
          />
          <TextInput
            placeholder="Lorem ipsum"
            style={{ paddingHorizontal: 20, fontSize: 15, color: "#ccccef" }}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginRight: -40, marginTop: 30 }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("Detail")}
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 66,
              width: 66,
              borderRadius: 50,
              backgroundColor: "#5facdb",
            }}
          >
            <Image
              source={require("../assets/images/p.png")}
              style={{ height: 24, width: 24 }}
            />
          </TouchableOpacity>

          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: 66,
              width: 66,
              borderRadius: 50,
              backgroundColor: "#ff5c83",
              marginHorizontal: 22,
            }}
          >
            <Ionicons name="office-building" color="white" size={32} />
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
            <Ionicons name="dots-horizontal" color="white" size={32} />
          </View>
        </ScrollView>

        <Text
          style={{
            color: "#FFF",
            fontFamily: "RobotoRegular",
            marginTop: 50,
            fontSize: 17,
          }}
        >
          Recommended
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
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                </Text>
              </View>
              <Ionicons name="map-marker" size={25} color="#ff5c83" />
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
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                </Text>
              </View>
              <Ionicons name="map-marker" size={25} color="#5facdb" />
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
              <Ionicons name="map-marker" size={25} color="#bb32fe" />
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
});
