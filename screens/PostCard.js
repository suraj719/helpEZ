import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  Button
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, serverTimestamp, getDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { firestore } from '../utils/firebase'; // Adjust this import based on your file structure
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostCard = ({ postId, post }) => {
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showAllComments, setShowAllComments] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const phoneNumber = await AsyncStorage.getItem('phoneNumber');
      setPhoneNumber(phoneNumber);
      fetchUsername(phoneNumber);
    };

    const fetchUsername = async (phoneNumber) => {
      try {
        // Create a reference to the 'users' collection
        const usersCollectionRef = collection(firestore, 'users');
        
        // Create a query to find the document where the phoneNumber field matches the provided phone number
        const userQuery = query(usersCollectionRef, where('phoneNumber', '==', phoneNumber));
        
        // Execute the query
        const querySnapshot = await getDocs(userQuery);
        
        if (!querySnapshot.empty) {
          // Assuming there is only one document with the given phone number
          const userDoc = querySnapshot.docs[0].data();
          
          // Set the username from the user data or default to 'Unknown'
          setUsername(userDoc.name || 'Unknown');
        } else {
          console.log('No user found with the provided phone number.');
          setUsername('Unknown');
        }
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      const postDoc = doc(firestore, 'posts', postId);
      const postData = await getDoc(postDoc);
      if (postData.exists()) {
        const data = postData.data();
        setLikes(data.likes || []);
        setComments(data.comments || []);
      }
    };
    fetchPost();
  }, [postId]);

  const handleLike = async () => {
    try {
      const postRef = doc(firestore, 'posts', postId);

      if (likes.includes(phoneNumber)) {
        await updateDoc(postRef, {
          likes: arrayRemove(phoneNumber),
          likeCount: increment(-1) // Decrease the like count
        });
        setLikes(prevLikes => prevLikes.filter(like => like !== phoneNumber));
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(phoneNumber),
          likeCount: increment(1) // Increase the like count
        });
        setLikes(prevLikes => [...prevLikes, phoneNumber]);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleComment = async () => {
    try {
      if (newComment.trim()) {
        const postRef = doc(firestore, 'posts', postId);
        const newCommentObj = {
          userId: phoneNumber,
          comment: newComment,
          timestamp: serverTimestamp() // Add timestamp
        };
        await updateDoc(postRef, {
          comments: arrayUnion(newCommentObj)
        });
        setComments(prevComments => [...prevComments, newCommentObj]);
        setNewComment('');
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Error handling comment:', error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.userInfo}>
        <Image
          source={{ uri: post.userAvatar || 'https://via.placeholder.com/40' }} // Placeholder if avatar is missing
          style={styles.avatar}
        />
        <View>
          <Text style={styles.username}>{username || 'Unknown'}</Text>
          <Text style={styles.timestamp}>
            {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 'No Timestamp'}
          </Text>
        </View>
      </View>
      <Text style={styles.content}>{post.content || 'No Content'}</Text>
      {post.imageUrls && post.imageUrls.length > 0 && (
        <Image source={{ uri: post.imageUrls[0] }} style={styles.image} />
      )}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Ionicons name={likes.includes(phoneNumber) ? "heart" : "heart-outline"} size={24} color="#6B6B6B" />
          <Text style={styles.actionText}>{likes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#6B6B6B" />
          <Text style={styles.actionText}>{comments.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="paper-plane-outline" size={24} color="#6B6B6B" />
          <Text style={styles.actionText}>{post.shares || 0}</Text>
        </TouchableOpacity>
      </View>
      {comments.length > 0 && (
        <View style={styles.commentsContainer}>
          <FlatList
            data={showAllComments ? comments : comments.slice(0, 1)}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <Text style={styles.commentUser}>{item.userId || 'Anonymous'}</Text>
                <Text style={styles.commentText}>{item.comment || 'No Comment'}</Text>
              </View>
            )}
          />
          {!showAllComments && comments.length > 1 && (
            <TouchableOpacity onPress={() => setShowAllComments(true)}>
              <Text style={styles.viewAllComments}>View All Comments</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Modal for Adding Comments */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              value={newComment}
              onChangeText={setNewComment}
            />
            <Button title="Post Comment" onPress={handleComment} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  content: {
    fontSize: 14,
    marginVertical: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
    color: '#6B6B6B',
  },
  commentsContainer: {
    marginTop: 8,
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  commentText: {
    fontSize: 14,
  },
  viewAllComments: {
    color: '#007BFF',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
});

export default PostCard;
