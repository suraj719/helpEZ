import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Share, ScrollView } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

// Firestore instance
const db = getFirestore();

const DonateDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, requestId } = route.params;

  const [itemQuantities, setItemQuantities] = useState({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestsQuery = query(
          collection(db, 'requests'),
          where('category', '==', category)
        );

        const querySnapshot = await getDocs(requestsQuery);
        const itemCounts = {};
        let total = 0;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          data.items.forEach((item) => {
            const itemName = item.itemName.trim();
            const itemQuantity = parseInt(item.itemQuantity, 10);

            if (itemCounts[itemName]) {
              itemCounts[itemName] += itemQuantity;
            } else {
              itemCounts[itemName] = itemQuantity;
            }
            total += itemQuantity;
          });
        });

        setItemQuantities(itemCounts);
        setTotalQuantity(total);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const handleDonate = () => {
    Alert.alert(
      'Confirm Donation',
      'Are you sure you want to donate? You will be redirected to the donation form.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => navigation.navigate('DonateForm', { requestId }),
        },
      ],
      { cancelable: false }
    );
  };

  const handleShare = async () => {
    try {
      const message = `Present Needs Details:
      Total Quantities Needed: ${totalQuantity}
      Thank you for considering to help!`;

      await Share.share({
        message,
        title: 'Share Request Details'
      });
    } catch (error) {
      console.error('Error sharing details: ', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Text style={styles.itemCardTitle}>{item.name}</Text>
      <Text style={styles.itemCardText}>Quantity: {item.quantity}</Text>
    </View>
  );

  const itemList = Object.keys(itemQuantities).map((itemName) => ({
    name: itemName,
    quantity: itemQuantities[itemName],
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#f53838" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Request Details</Text>

        <Text style={styles.categoryTitle}>{category} Needs</Text>
        {itemList.map((item) => (
          <View style={styles.itemContainer} key={item.name}>
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemSubtext}>{item.quantity} units needed</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${(item.quantity / totalQuantity) * 100}%` }]} />
              <Text style={styles.progressText}>{Math.round((item.quantity / totalQuantity) * 100)}%</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Present Needs</Text>
        <Text style={styles.totalQuantity}>Total quantity needed: {totalQuantity}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressCount}>0/{totalQuantity}</Text>
          <View style={styles.fullProgressBar}>
            <View style={[styles.fullProgress, { width: '0%' }]} />
          </View>
        </View>

        <TouchableOpacity onPress={handleDonate} style={styles.donateButton}>
          <FontAwesome5 name="donate" size={24} color="white" />
          <Text style={styles.donateButtonText}>Donate Now</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-social" size={24} color="black" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#181111',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181111',
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#181111',
  },
  itemSubtext: {
    fontSize: 14,
    color: '#896161',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progress: {
    height: 8,
    backgroundColor: '#181111',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#181111',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181111',
    marginVertical: 16,
  },
  totalQuantity: {
    fontSize: 16,
    color: '#181111',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 16,
    color: '#181111',
  },
  progressCount: {
    fontSize: 14,
    color: '#181111',
  },
  fullProgressBar: {
    height: 8,
    backgroundColor: '#e6dbdb',
    borderRadius: 4,
    marginTop: 4,
  },
  fullProgress: {
    height: 8,
    backgroundColor: '#181111',
    borderRadius: 4,
  },
  donateButton: {
    backgroundColor: '#ee2b2b',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  donateButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shareButton: {
    backgroundColor: '#f4f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#181111',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default DonateDetails;
  