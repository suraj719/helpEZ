import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Text, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from '../utils/firebase';
import { collection, getDocs, doc, updateDoc, getFirestore } from 'firebase/firestore';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

// Define disasterNeeds outside of the component or in a separate file
const disasterNeeds = {
  clothing: [
    "Clothes for adults",
    "Clothes for children",
    "Winter wear",
    "Footwear",
    "Blankets", "shirts", "pants", "kurthi"
  ],
  food: [
    "Non-perishable food items", "rice", "Rice", "Wheat", "Water", "water", "wheat",
    "Canned goods", "Dry foods", "Infant formula", "Emergency rations"
  ],
  transportation: [
    "Emergency vehicles", "Fuel", "Public transport arrangements", "Vehicle repair services", "Road clearing"
  ],
  medical: [
    "First aid kits", "Dettol", "Medications", "Medical supplies", "Vaccinations", "Emergency medical services", "masks", "Syringe"
  ],
  technical: [
    "Communication devices", "Generators", "Power banks", "Technical support for infrastructure", "Wi-Fi and connectivity solutions"
  ],
  rescue: [
    "Search and rescue teams", "Rescue equipment", "Drones", "Rescue boats", "Life vests"
  ],
  housing: [
    "Temporary shelters", "Building materials", "Housing repairs", "Rental assistance", "Emergency housing"
  ],
  sanitation: [
    "Clean water", "Sanitation kits", "Waste management", "Portable toilets", "Hygiene products"
  ]
};

const Donor = () => {
  const navigation = useNavigation();
  const db = getFirestore(app);
  const [phoneNumber, setPhoneNumber] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDonor, setIsDonor] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchPhoneNumber();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const fetchPhoneNumber = async () => {
    try {
      const storedPhoneNumber = await AsyncStorage.getItem('phoneNumber');
      if (storedPhoneNumber) {
        setPhoneNumber(storedPhoneNumber);
        checkIfDonor(storedPhoneNumber);
      }
    } catch (error) {
      console.error('Error fetching phoneNumber from AsyncStorage: ', error);
    }
  };

  const checkIfDonor = async (phoneNumber) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userDoc = querySnapshot.docs.find(doc => doc.data().phoneNumber === phoneNumber);

      if (userDoc) {
        setIsDonor(userDoc.data().isDonor);
        console.log(userDoc.data().isDonor);
      } else {
        setIsDonor(false);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setIsDonor(false);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'requests'));
      const requestsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          requestTitle: data.requestTitle || 'No Title',
          quantity: data.quantity || 'Not Specified',
          image: data.images?.[0] || null,
          severity: data.severity || 'Unknown',
          category: data.category || 'Uncategorized',
        };
      });
      setRequests(requestsData);
      extractUniqueCategories(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to load requests');
    }
    setLoading(false);
  };

  const extractUniqueCategories = (requestsData) => {
    if (!requestsData || !Array.isArray(requestsData)) {
      console.error('Invalid requests data:', requestsData);
      return;
    }
    const uniqueCategories = [...new Set(requestsData.map(request => request.category))];
    setCategories(uniqueCategories);
  };

  const handleBoxPress = () => {
    Alert.alert(
      "Become a Donor",
      "Do you want to become a donor for future events?",
      [
        { text: "No", onPress: () => console.log("No pressed") },
        { text: "Yes", onPress: handleYesPressed }
      ],
      { cancelable: true }
    );
  };

  const handleYesPressed = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userDocId = querySnapshot.docs.find(doc => doc.data().phoneNumber === phoneNumber)?.id;

      if (userDocId) {
        const userRef = doc(db, 'users', userDocId);
        await updateDoc(userRef, { isDonor: true });
        setIsDonor(true);
        Alert.alert('Success', 'You are now a donor!');
      } else {
        Alert.alert('Error', 'User document not found');
      }
    } catch (error) {
      Alert.alert('Error', 'Error updating user details');
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequests().then(() => setRefreshing(false));
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "High":
        return styles.textRed600;
      case "Moderate":
        return styles.textYellow600;
      case "Low":
        return styles.textGreen600;
      default:
        return styles.textGray600;
    }
  };

  const renderRequestItem = ({ item }) => {
    if (!item || !item.category) {
      return null;
    }
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate("DonateDetails", { category: item.category })}
        style={styles.requestItem}
        accessibilityLabel={`Request for ${item.requestTitle}`}
      >
        {item.image ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />
          </View>
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {item.requestTitle}
          </Text>
          <Text style={styles.quantity}>
            Quantity: {item.quantity}
          </Text>
          <Text style={getSeverityColor(item.severity)}>
            Severity: {item.severity}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => {
        // Get the array of items for the selected category
        const categoryItems = disasterNeeds[item] || [];
        // Navigate to DonateDetails screen and pass category and items
        navigation.navigate("DonateDetails", { 
          category: item, 
          items: categoryItems 
        });
      }}
    >
      <Text style={styles.categoryTitle}>{item}</Text>
      {selectedCategory === item && (
        <FlatList
          data={requests.filter(request => request.category === item)}
          renderItem={renderRequestItem}
          keyExtractor={(request) => request.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 4 }}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {!isDonor ? (
        <TouchableOpacity onPress={handleBoxPress} style={styles.box}>
          <View style={styles.iconContainer}>
            <AntDesign name="arrowright" size={22} color="black" style={styles.icon} />
          </View>
          <Text style={styles.boxText}>Subscribe for Further Notification.</Text>
        </TouchableOpacity>
      ) : (
        <View>
          {/* <Text style={styles.donorMemberText}>You are a Donor Member</Text> */}
        </View>
      )}

      {categories.length > 0 ? (
        <FlatList
          data={categories}
          renderItem={renderCategoryCard}
          keyExtractor={(item) => item}
          ListFooterComponent={loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : null}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No requests available</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.donateButton}
        onPress={() => navigation.navigate('DonateMoney')}
      >
        <Text style={styles.donateButtonText}>Donate Money</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    borderWidth: 1,
    borderColor: '#f7b0ab',
    backgroundColor: '#fcdedc',
    padding: 8,
    borderRadius: 8,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,

  },
  icon: {
    alignSelf: 'center',
  },
  boxText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },
  donorMemberContainer: {
    padding: 20,
    backgroundColor: '#d4edda',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  donorMemberText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#155724',
    textAlign: 'center',
  },

  categoryCard: {
    padding: 16,
    backgroundColor: '#fcdedc',
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  requestItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    marginRight: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 14,
    marginVertical: 4,
  },
  textRed600: {
    color: '#dc3545',
  },
  textYellow600: {
    color: '#ffc107',
  },
  textGreen600: {
    color: '#28a745',
  },
  textGray600: {
    color: '#6c757d',
  },
  viewAllContainer: {
    padding: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  donateButton: {
    padding: 16,
    backgroundColor: '#f24459',
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});

export default Donor;
