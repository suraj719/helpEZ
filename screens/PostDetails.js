// screens/PostDetails.js
import React from 'react';
import { View, Text, Image, FlatList, TextInput, Button } from 'react-native';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from '../utils/firebase';

const PostDetails = ({ route }) => {
  const { post } = route.params;

  const handleLike = async (postId) => {
    const postRef = doc(firestore, 'posts', postId);
    await updateDoc(postRef, {
      likes: arrayUnion('userId') // Replace 'userId' with the actual user ID
    });
  };

  const handleComment = async (postId, comment) => {
    const postRef = doc(firestore, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion({ userId: 'userId', comment }) // Replace 'userId' with the actual user ID
    });
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 30 }}>{post.title}</Text>
      <Text>{post.content}</Text>
      {post.imageUrls && post.imageUrls.map((url, index) => (
        <Image key={index} source={{ uri: url }} style={{ width: '100%', height: 200 }} />
      ))}
      {post.videoUrls && post.videoUrls.map((url, index) => (
        <Video
          key={index}
          source={{ uri: url }}
          style={{ width: '100%', height: 200 }}
          useNativeControls
          resizeMode="contain"
        />
      ))}
      <Text style={{ fontSize: 20, marginTop: 20 }}>Category: {post.category}</Text>
      <Text style={{ fontSize: 20, marginTop: 20 }}>Location: {post.location}</Text>
      <Text style={{ fontSize: 20, marginTop: 20 }}>Tags: {post.tags.join(', ')}</Text>
      <Text style={{ fontSize: 20, marginTop: 20 }}>Likes: {post.likes.length}</Text>
      <FlatList
        data={post.comments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.userId}</Text>
            <Text>{item.comment}</Text>
          </View>
        )}
      />
      <TextInput placeholder="Add a comment" onSubmitEditing={(e) => handleComment(post.id, e.nativeEvent.text)} />
      <Button title="Like" onPress={() => handleLike(post.id)} />
    </View>
  );
};

export default PostDetails;
