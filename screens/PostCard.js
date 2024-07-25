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
import { Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc, arrayUnion, arrayRemove,query,where, increment, serverTimestamp, getDoc,collection,getDocs } from 'firebase/firestore';
import { firestore } from '../utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostCard = ({ postId, post }) => {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [showAllComments, setShowAllComments] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const phoneNumber = await AsyncStorage.getItem('phoneNumber');
        setPhoneNumber(phoneNumber);
        if (phoneNumber) {
          fetchUsername(phoneNumber);
        }
      } catch (error) {
        console.error('Error fetching phone number:', error);
      }
    };

    const fetchUsername = async (phoneNumber) => {
      try {
        const usersCollectionRef = collection(firestore, 'users');
        const userQuery = query(usersCollectionRef, where('phoneNumber', '==', phoneNumber));
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
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
      try {
        const postDoc = doc(firestore, 'posts', postId);
        const postData = await getDoc(postDoc);
        if (postData.exists()) {
          const data = postData.data();
          setLikes(data.likes || []);
          setComments(data.comments || []);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      }
    };

    fetchPost();
  }, [postId]);

  const PostActionButton = ({ post }) => {
    return (
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleShare(post)} // Pass the post to the handleShare function
      >
        <Ionicons name="paper-plane-outline" size={24} color="#6B6B6B" />
        <Text style={styles.actionText}>{post.shares || 0}</Text>
      </TouchableOpacity>
    );
  };

  const handleShare = async (post) => {
    try {
      const result = await Share.share({
        message: `Check out this post: ${post.title}\n\n${post.content}`, // Customize the message as needed
      });
  
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with an activity type
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Shared
          console.log('Content shared');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing content:', error.message);
    }
  };
  

  const handleLike = async () => {
    try {
      const postRef = doc(firestore, 'posts', postId);

      if (!phoneNumber) {
        console.error('Phone number is not available.');
        return;
      }

      if (likes.includes(phoneNumber)) {
        await updateDoc(postRef, {
          likes: arrayRemove(phoneNumber),
          likeCount: increment(-1)
        });
        setLikes(prevLikes => prevLikes.filter(like => like !== phoneNumber));
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(phoneNumber),
          likeCount: increment(1)
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
  
        // Create a new comment object with timestamp
        const newCommentObj = {
          userId: username,
          comment: newComment,
          // timestamp: serverTimestamp()
        };
  
        // Add the comment object to the comments array
        await updateDoc(postRef, {
          comments: arrayUnion(newCommentObj)
        });
  
        // Update local state
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
          source={{ uri: post.userAvatar || 'https://via.placeholder.com/40' }}
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
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  actionText: {
    marginLeft: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: '#888',
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B6B6B',
  },
  commentsContainer: {
    marginTop: 8,
  },
  comment: {
    marginBottom: 8,
  },
  commentUser: {
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
  },
  viewAllComments: {
    color: '#007BFF',
    fontSize: 14,
    textAlign: 'center',
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
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
});

export default PostCard;
