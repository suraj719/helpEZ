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
  const [currentUserPhoneNumber, setCurrentUserPhoneNumber] = useState(null);
   const [currentUserName, setCurrentUserName] = useState(null);

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

  return (
    <View style={{ flex: 1 }}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{memberName}</Text>
      </View>
      <GiftedChat
        messages={messages}
        onSend={newMessages => onSend(newMessages)}
        user={{
          _id: currentUserPhoneNumber,
          name: memberName,
        }}
      />
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
});

export default ChatScreen;