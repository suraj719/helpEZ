import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { firestore } from '../utils/firebase'; // Adjust the path as needed
import { doc, getDoc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const generateRandomUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [bio, setBio] = useState("I'm a nurse and I love to help people. I've been working in the healthcare industry for 3 years.");
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('https://cdn.usegalileo.ai/stability/563e97b1-3c37-4960-af0c-ed843bb03196.png');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(generateRandomUserId());

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await AsyncStorage.getItem('name');
        if (name !== null) {
          console.log('Fetched user name from AsyncStorage:', name);
          setUserName(name);
          // Fetch profile by user name
          fetchProfileByName(name);
        }
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };
    fetchUserName();
  }, []);

  const fetchProfileByName = async (name) => {
    try {
      const profilesRef = collection(firestore, 'profiles');
      const q = query(profilesRef, where('name', '==', name));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          setProfileImage(data.profileImage || 'default_image_url');
          setBio(data.bio || 'Default bio');
          console.log('Fetched profile from Firestore:', data);
        });
      } else {
        console.log('No such document!');
        setProfileImage('default_image_url');
        setBio('Default bio');
      }
    } catch (error) {
      console.error("Error fetching profile: ", error);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving profile with name:", userName);
      console.log("Saving profile with bio:", bio);

      const docRef = doc(firestore, 'profiles', userId);
      await setDoc(docRef, {
        name: userName,
        profileImage: profileImage,
        bio: bio,
      }, { merge: true });

      console.log("Profile created/updated successfully!");
      setIsEditing(false);
      Alert.alert("Profile saved successfully!");
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert("Failed to save profile.");
    }
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      console.log("Image URI:", imageUri);

      const storage = getStorage();
      const fileName = imageUri.split('/').pop();
      const storageRef = ref(storage, `profileImages/${fileName}`);

      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      console.log("Download URL:", downloadURL);

      setProfileImage(downloadURL);

      try {
        const docRef = doc(firestore, 'profiles', userId);
        await setDoc(docRef, {
          profileImage: downloadURL,
          name: userName,
          bio: bio
        }, { merge: true });
        console.log("Profile image URL updated in Firestore");
      } catch (error) {
        console.error("Error updating profile image URL in Firestore: ", error);
      }
    }
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleImagePicker}>
          <Image
            style={styles.profileImage}
            source={{ uri: profileImage }}
          />
        </TouchableOpacity>
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>{userName}</Text>
          <Text style={styles.profileJoined}>Joined in 2020</Text>
        </View>
      </View>
      <View style={styles.tagsContainer}>
        {['Volunteer', 'Community', 'Healthcare', 'Firefighter'].map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Safety</Text>
      <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('ReportIncident')}>
        <View style={styles.listItemTextContainer}>
          <Text style={styles.listItemTitle}>Report incident</Text>
          <Text style={styles.listItemSubtitle}>Report an incident to your community</Text>
        </View>
        <ArrowRightIcon />
      </TouchableOpacity>

      <TouchableOpacity style={styles.listItem} onPress={() => navigation.navigate('Tasks')}>
        <View style={styles.listItemTextContainer}>
          <Text style={styles.listItemTitle}>Tasks</Text>
          <Text style={styles.listItemSubtitle}>Find volunteer tasks nearby</Text>
        </View>
        <ArrowRightIcon />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Bio</Text>
      {isEditing ? (
        <View style={styles.bioEditContainer}>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.bioText}>{bio}</Text>
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <EditIcon />
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Alerts</Text>
      <View style={styles.alertContainer}>
        <Image
          style={styles.alertImage}
          source={{ uri: 'https://cdn.usegalileo.ai/stability/24a9eb8d-81e5-4bd3-a0a1-a2021abef114.png' }}
        />
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>Santa Clara County</Text>
          <Text style={styles.alertSubtitle}>2 days ago</Text>
          <Text style={styles.alertSubtitle}>Flood warning</Text>
        </View>
      </View>

      <View style={styles.alertContainer}>
        <Image
          style={styles.alertImage}
          source={{ uri: 'https://cdn.usegalileo.ai/stability/e842a9d1-6423-4bb5-af41-c07db34c24a2.png' }}
        />
        <View style={styles.alertTextContainer}>
          <Text style={styles.alertTitle}>San Jose</Text>
          <Text style={styles.alertSubtitle}>1 month ago</Text>
          <Text style={styles.alertSubtitle}>COVID-19 testing site</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const EditIcon = () => (
  <SvgXml
    xml={`<svg class="feather feather-edit" fill="none" height="24" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`}
    width="24"
    height="24"
  />
);

const ArrowRightIcon = () => (
  <SvgXml
    xml={`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path></svg>`}
    width="24"
    height="24"
  />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf8f8',
    paddingHorizontal: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  profileImage: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: '#e0e0e0',
  },
  profileTextContainer: {
    marginLeft: 16,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b0f0e',
  },
  profileJoined: {
    fontSize: 16,
    color: '#97534e',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 16,
  },
  tag: {
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3e8e7',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#1b0f0e',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1b0f0e',
    marginVertical: 16,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b0f0e',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#97534e',
  },
  bioEditContainer: {
    marginVertical: 16,
  },
  bioInput: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#1b0f0e',
  },
  saveButton: {
    backgroundColor: '#1b0f0e',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  bioText: {
    fontSize: 16,
    color: '#1b0f0e',
  },
  editButton: {
    marginTop: 10,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  alertImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e0e0e0',
  },
  alertTextContainer: {
    marginLeft: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1b0f0e',
  },
  alertSubtitle: {
    fontSize: 14,
    color: '#97534e',
  },
});
