import React from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ChatScreen = ({ route }) => {
  const { memberName, memberPhoneNumber } = route.params;
  const navigation = useNavigation();

  // Mock data for initial messages
  const [messages, setMessages] = React.useState([
    {
      _id: 1,
      text: `Hi ${memberName}, how are you?`,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'React Native',
        avatar: 'https://placeimg.com/140/140/any',
      },
    },
  ]);

  // Handler for sending messages
  const onSend = (newMessages = []) => {
    setMessages(GiftedChat.append(messages, newMessages));
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
        user={{ _id: 1 }} // Replace with your user ID logic
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
