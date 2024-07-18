import React, { useState, useEffect } from 'react';
import { GiftedChat, Bubble, Send, Composer } from 'react-native-gifted-chat';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, PermissionsAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, query, orderBy, where, onSnapshot, getFirestore, serverTimestamp } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import app from '../utils/firebase';
import { useTranslation } from 'react-i18next';
import * as Network from 'expo-network';
import Toast from 'react-native-toast-message';
import { BleManager } from 'react-native-ble-plx';
import * as Linking from 'expo-linking';

const ChatScreen = ({ route }) => {
  const { t } = useTranslation();
  const { memberName, memberPhoneNumber } = route.params;
  const navigation = useNavigation();
  const db = getFirestore(app);
  const messagesCollection = collection(db, 'messages');
  const [messages, setMessages] = useState([]);
  const [currentUserPhoneNumber, setCurrentUserPhoneNumber] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const manager = new BleManager();
  
  // Function to create a unique conversation ID using hashing
  const createConversationId = (phoneNumber1, phoneNumber2) => {
    const sortedNumbers = [phoneNumber1, phoneNumber2].sort().join('_');
    return CryptoJS.SHA256(sortedNumbers).toString(CryptoJS.enc.Hex);
  };

  useEffect(() => {
    const fetchStoredUserPhoneNumber = async () => {
      const storedUserPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      const storedUserName = await AsyncStorage.getItem("name");
      setCurrentUserPhoneNumber(storedUserPhoneNumber);
      setCurrentUserName(storedUserName);
      const conversationId = createConversationId(storedUserPhoneNumber, memberPhoneNumber);

      const unsubscribe = onSnapshot(
        query(
          messagesCollection,
          orderBy('createdAt', 'desc'),
          where('conversationId', '==', conversationId)
        ),
        (snapshot) => {
          const updatedMessages = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              _id: doc.id,
              ...data,
              createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
            };
          });
          setMessages(updatedMessages);
        }
      );

      return () => unsubscribe();
    };

    fetchStoredUserPhoneNumber();
  }, [memberPhoneNumber]);

  useEffect(() => {
    const checkNetworkState = async () => {
      const state = await Network.getNetworkStateAsync();
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Toast.show({
          type: 'error',
          text1: 'Switching to offline mode!',
          text2: 'Tap to connect via Bluetooth.',
          onPress: handleBluetoothConnection,
          position: 'top',
        });
      }
    };

    checkNetworkState();
    const interval = setInterval(checkNetworkState, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleBluetoothConnection = async () => {
    // Request Bluetooth permission for Android 12 (API 31) and above
    if (Platform.OS === 'android' && Platform.Version >= 31) {
        const { status } = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
                title: 'Bluetooth Permission',
                message: 'HELPEZ needs access to Bluetooth to connect to devices.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            }
        );
        // if (status !== 'granted') {
        //     Alert.alert('Permission denied', 'Bluetooth permission is required to connect.');
        //     // return;
        // }
    }

    // Check Bluetooth state
    manager.state().then((state) => {
        if (state === 'PoweredOff') {
            // Ask user if they want to turn on Bluetooth
            Alert.alert(
                'Bluetooth is off',
                'HELPEZ needs Bluetooth to be turned on. Would you like to turn it on?',
                [
                    {
                        text: 'Yes',
                        onPress: () => {
                            // Set up listener for state change
                            manager.onStateChange((newState) => {
                                if (newState === 'PoweredOn') {
                                    redirectToFlutterApp();
                                }
                            }, true);

                            // Attempt to enable Bluetooth
                            if (Platform.OS === 'android') {
                                manager.enable().then(() => {
                                    console.log('Bluetooth enabled successfully');
                                }).catch((error) => {
                                    console.error('Failed to enable Bluetooth:', error);
                                    Alert.alert('Error', 'Failed to enable Bluetooth. Please turn it on manually.');
                                });
                            } else {
                                Alert.alert('Turn on Bluetooth', 'Please turn on Bluetooth in your device settings.');
                            }
                        }
                    },
                ]
            );
        } else {
            redirectToFlutterApp();
        }
    });
};

// const fetchMessages = async () => {
//   const storedUserPhoneNumber = await AsyncStorage.getItem("phoneNumber");
//   const conversationId = createConversationId(storedUserPhoneNumber, memberPhoneNumber);
  
//   const q = query(
//     messagesCollection,
//     orderBy('createdAt', 'desc'),
//     where('conversationId', '==', conversationId)
//   );
  
//   const querySnapshot = await getDocs(q);
//   return querySnapshot.docs.map(doc => ({
//     id: doc.id,
//     ...doc.data()
//   }));
// };

const redirectToFlutterApp = async () => {
  // const fetchedMessages = await fetchMessages();
  // const encodedMessages = encodeURIComponent(JSON.stringify(fetchedMessages));
  const url = `bridgefysample://open?name=${memberName}&phone=${memberPhoneNumber}&messages=${messages}`;
  Linking.openURL(url).catch(err => console.error('Error: ', err));
};

  const onSend = async (newMessages = []) => {
    const message = newMessages[0];
    try {
      await addDoc(messagesCollection, {
        text: message.text,
        createdAt: serverTimestamp(),
        user: {
          _id: currentUserPhoneNumber,
          name: currentUserName,
        },
        members: [currentUserPhoneNumber, memberPhoneNumber],
        conversationId: createConversationId(currentUserPhoneNumber, memberPhoneNumber),
      });
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };
  const OnlineStatusButton = () => (
    <View style={styles.onlineButtonContainer}>
      <View style={[styles.dot, { backgroundColor: isConnected ? 'green' : 'red' }]} />
      <Text style={styles.onlineButtonText}>{isConnected ? 'Online' : 'Offline'}</Text>
    </View>

  );

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: 'black',
          },
          left: {
            backgroundColor: 'lightgrey',
          },
        }}
        textStyle={{
          right: {
            color: 'white',
          },
          left: {
            color: 'black',
          },
        }}
      />
    );
  };

  const renderComposer = (props) => {
    return (
      <Composer
        {...props}
        textInputStyle={{
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 8,
          marginLeft: 0,
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={24} color="black" />
        </View>
      </Send>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{memberName}</Text>
          <Text style={styles.headerSubtitle}>{memberPhoneNumber}</Text>
        </View>
        <OnlineStatusButton/>
      </View>
      <GiftedChat
        messages={messages}
        onSend={newMessages => onSend(newMessages)}
        user={{
          _id: currentUserPhoneNumber,
          name: memberName,
        }}
        renderBubble={renderBubble}
        renderComposer={renderComposer}
        renderSend={renderSend}
        alwaysShowSend
      />

      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 10,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'gray',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  onlineButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  onlineButtonText: {
    fontSize: 14,
  },
});

export default ChatScreen;
