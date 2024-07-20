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
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <View style={styles.backButtonContent}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text>Back</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.title}>Request Details</Text>

        <Text style={styles.title}>{category} Needs</Text>
        
          {itemList.length > 0 ? (
            <FlatList
              data={itemList}
              keyExtractor={(item) => item.name}
              renderItem={renderItem}
            />
          ) : (
            <Text style={styles.noItemsText}>No items needed for this category.</Text>
          )}
        

        <View style={styles.needsBox}>
          <FontAwesome5 name="donate" size={24} color="black" style={styles.needsBoxIcon} />
          <View style={styles.needsBoxContent}>
            <Text style={styles.needsBoxTitle}>Present Needs</Text>
            <Text style={styles.needsBoxText}>
              Total Quantities Needed: {totalQuantity}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button1} onPress={handleDonate}>
          <Text style={styles.buttonText}>Donate Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Text style={styles.buttonText1}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    marginTop: 30,
    paddingHorizontal: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemCardText: {
    fontSize: 14,
  },
  noItemsText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  needsBox: {
    padding: 20,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  needsBoxIcon: {
    marginRight: 15,
  },
  needsBoxContent: {
    flex: 1,
  },
  needsBoxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  needsBoxText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#ffcccb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  button1: {
    backgroundColor: '#f53838',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonText1: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DonateDetails;
