import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Text
} from 'react-native';
import Header from './Header';
import CategoryFilter from './CategoryFilter';
import PostCard from './PostCard';
import BottomNavBar from './BottomNavBar';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../utils/firebase';

const CommunityScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    setRefreshing(true);
    try {
      const postsCollection = collection(firestore, 'posts');
      let postQuery = postsCollection;

      if (selectedCategory) {
        postQuery = query(postsCollection, where('category', '==', selectedCategory));
      }

      const postSnapshot = await getDocs(postQuery);
      const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    } catch (error) {
      console.error("Error fetching posts: ", error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <CategoryFilter onSelectCategory={setSelectedCategory} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.postsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchPosts} />
        }
      />
      <TouchableOpacity
        style={styles.createPostButton}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Text style={styles.createPostButtonText}>Create Post</Text>
      </TouchableOpacity>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  postsList: {
    paddingHorizontal: 4,
  },
  createPostButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  createPostButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CommunityScreen;
