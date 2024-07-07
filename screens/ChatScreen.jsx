import React, { useState, useEffect } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, query, orderBy, where, onSnapshot, getFirestore, serverTimestamp } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import app from '../utils/firebase';

const ChatScreen = ({ route }) => {
  const { memberName, memberPhoneNumber } = route.params;
  const navigation = useNavigation();
  const db = getFirestore(app);
  const messagesCollection = collection(db, 'messages');
  const [messages, setMessages] = useState([]);
  
  // Function to create a unique conversation ID using hashing
  const createConversationId = (phoneNumber1, phoneNumber2) => {
    const sortedNumbers = [phoneNumber1, phoneNumber2].sort().join('_');
    return CryptoJS.SHA256(sortedNumbers).toString(CryptoJS.enc.Hex);
  };

  useEffect(() => {
    const fetchStoredUserPhoneNumber = async () => {
      const storedUserPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      const conversationId = createConversationId(storedUserPhoneNumber, memberPhoneNumber);

      const unsubscribe = onSnapshot(
        query(
          messagesCollection,
          orderBy('createdAt', 'desc'),
          where('conversationId', '==', conversationId)
        ),
        (snapshot) => {
          const updatedMessages = snapshot.docs.map((doc) => ({
            _id: doc.id,
            ...doc.data(),
          }));
          setMessages(updatedMessages);
        }
      );

      return () => unsubscribe();
    };

    fetchStoredUserPhoneNumber();
  }, [memberPhoneNumber]);

  const onSend = async (newMessages = []) => {
    const message = newMessages[0];
    const storedUserPhoneNumber = await AsyncStorage.getItem("phoneNumber");
    const conversationId = createConversationId(storedUserPhoneNumber, memberPhoneNumber);
    try {
      await addDoc(messagesCollection, {
        text: message.text,
        createdAt: serverTimestamp(),
        user: {
          _id: storedUserPhoneNumber,
          name: message.user.name,
        },
        members: [storedUserPhoneNumber, memberPhoneNumber],
        conversationId: conversationId,
      });
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{memberName}</Text>
          <Text style={styles.headerSubtitle}>{memberPhoneNumber}</Text>
        </View>
      </View>

      {/* GiftedChat component */}
      <GiftedChat
        messages={messages}
        onSend={newMessages => onSend(newMessages)}
        user={{ _id: memberPhoneNumber, name: memberName }} // Adjust as per your user structure
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'gray',
  },
});

export default ChatScreen;
