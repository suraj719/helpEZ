import { View, Text, Image, StyleSheet } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Bubble, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import GlobalApi from './GlobalApi';
import { FontAwesome } from '@expo/vector-icons';
import ChatFaceData from './ChatFaceData';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatFace, setChatFace] = useState({
    image: 'https://res.cloudinary.com/dknvsbuyy/image/upload/v1685678135/chat_1_c7eda483e3.png',
    color: '#671ddf',
    name: 'React Native',
  });

  useEffect(() => {
    const checkFaceId = async () => {
      try {
        const id = await AsyncStorage.getItem('chatFaceId');
        if (id && ChatFaceData[id]) {
          setChatFace({
            image: ChatFaceData[id].image,
            color: ChatFaceData[id].primary,
            name: ChatFaceData[id].name,
          });
        }
        setMessages([
          {
            _id: 1,
            text: `Hello, I am ${chatFace.name}, How can I help you?`,
            createdAt: new Date(),
            user: {
              _id: 2,
              name: chatFace.name,
              avatar: chatFace.image,
            },
          },
        ]);
      } catch (error) {
        console.error('Error fetching chat face:', error);
      }
    };

    checkFaceId();
  }, [chatFace.name, chatFace.image]);

  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
    if (messages[0].text) {
      getBardResp(messages[0].text);
    }
  }, []);

  const getBardResp = (msg) => {
    setLoading(true);
    GlobalApi.getBardApi(msg).then(resp => {
      setLoading(false);
      const chatAIResp = {
        _id: Math.random() * (9999999 - 1),
        text: resp.data.resp[1]?.content || "Sorry, I cannot help with it",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: chatFace.name,
          avatar: chatFace.image,
        },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, chatAIResp));
    }).catch(error => {
      setLoading(false);
      console.error('Error fetching response:', error);
      const chatAIResp = {
        _id: Math.random() * (9999999 - 1),
        text: "Sorry, I cannot help with it",
        createdAt: new Date(),
        user: {
          _id: 2,
          name: chatFace.name,
          avatar: chatFace.image,
        },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, chatAIResp));
    });
  };

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: chatFace.color,
        },
        left: {
          backgroundColor: '#f0f0f0',
        },
      }}
      textStyle={{
        right: {
          color: '#fff',
        },
        left: {
          color: '#000',
        },
      }}
    />
  );

  const renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={{
        padding: 3,
        backgroundColor: chatFace.color,
      }}
      textInputStyle={{ color: "#fff" }}
    />
  );

  const renderSend = (props) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <FontAwesome name="send" size={24} color="white" />
      </View>
    </Send>
  );

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        isTyping={loading}
        multiline={true}
        onSend={messages => onSend(messages)}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sendButton: {
    marginRight: 10,
    marginBottom: 5,
  },
});
