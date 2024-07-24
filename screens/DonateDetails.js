import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, query, where, getDocs, doc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';

// Firestore instance
const db = getFirestore();

const DonateDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params;

  const [itemQuantities, setItemQuantities] = useState({});
  const [itemSatisfied, setItemSatisfied] = useState({});
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalSatisfied, setTotalSatisfied] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationQuantities, setDonationQuantities] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const requestsQuery = query(
          collection(db, 'requests'),
          where('category', '==', category)
        );

        const querySnapshot = await getDocs(requestsQuery);
        const itemCounts = {};
        const itemSatisfiedCounts = {};
        let total = 0;
        let satisfiedTotal = 0;

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

        // Fetch satisfied counts from itemSummary collection
        const itemSummaryQuery = query(collection(db, 'itemSummary'));
        const itemSummarySnapshot = await getDocs(itemSummaryQuery);
        itemSummarySnapshot.forEach((doc) => {
          const data = doc.data();
          itemSatisfiedCounts[data.itemName] = data.satisfiedCount;
          satisfiedTotal += data.satisfiedCount;
        });

        // Update Firestore itemSummary collection
        for (const itemName in itemCounts) {
          await setDoc(doc(db, 'itemSummary', itemName), {
            itemName,
            totalNeeded: itemCounts[itemName],
            satisfiedCount: itemSatisfiedCounts[itemName] || 0,
          });
        }

        setItemQuantities(itemCounts);
        setItemSatisfied(itemSatisfiedCounts);
        setTotalQuantity(total);
        setTotalSatisfied(satisfiedTotal);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const handleDonateNow = () => {
    if (Object.keys(donationQuantities).length === 0) {
      Alert.alert('No items selected', 'Please enter quantities for donation.');
      return;
    }

    navigation.navigate('DonateForm', { donationQuantities, category });
  };

  const handleInputChange = (itemName, text) => {
    const quantity = parseInt(text, 10);
    if (!isNaN(quantity) && quantity >= 0) {
      setDonationQuantities((prev) => ({ ...prev, [itemName]: quantity }));
    } else {
      setDonationQuantities((prev) => ({ ...prev, [itemName]: 0 }));
    }
  };

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

  const itemList = Object.keys(itemQuantities).map((itemName) => ({
    name: itemName,
    quantity: itemQuantities[itemName],
    satisfied: itemSatisfied[itemName] || 0,
  }));

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
              <Text style={styles.itemSubtext}>{item.satisfied} units satisfied</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: `${(item.satisfied / item.quantity) * 100}%` }]} />
              <Text style={styles.progressText}>{Math.round((item.satisfied / item.quantity) * 100)}%</Text>
            </View>
            <View style={styles.donateInputContainer}>
              <TextInput
                style={styles.donateInput}
                keyboardType="numeric"
                placeholder="Qty"
                onChangeText={(text) => handleInputChange(item.name, text)}
              />
            </View>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Present Needs</Text>
        <Text style={styles.totalQuantity}>Total quantity needed: {totalQuantity}</Text>
        <Text style={styles.totalQuantity}>Total quantity satisfied: {totalSatisfied}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressCount}>{totalSatisfied}/{totalQuantity}</Text>
          <View style={styles.fullProgressBar}>
            <View style={[styles.fullProgress, { width: `${(totalSatisfied / totalQuantity) * 100}%` }]} />
          </View>
        </View>

        <TouchableOpacity onPress={handleDonateNow} style={styles.donateButton}>
          <Text style={styles.donateButtonText}>Donate Now</Text>
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
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  itemContainer: {
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemSubtext: {
    fontSize: 14,
    color: '#888',
  },

  progressText: {
    marginLeft: 18,
    fontSize: 12,
    width: 35,
  },
  donateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  donateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    flex: 1,
    marginRight: 8,
  },
  donateButton: {
    backgroundColor: '#ee2b2b',
    padding: 16,
    borderRadius: 4,
    marginTop: 16,
    alignItems: 'center',
  },
  donateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  totalQuantity: {
    fontSize: 16,
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressCount: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    // flexDirection: 'row',
    // alignItems: 'center',
    // marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: '#ddd',
    overflow: 'hidden',
  },
  progress: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#181111',

    // height: 10,
    // borderRadius: 5,
    // backgroundColor: '#181111',
    // flex: 1,
  },
  fullProgressBar: {
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ddd',
    overflow: 'hidden',
  },
  fullProgress: {
    height: 20,
    borderRadius: 10,
    backgroundColor: '#181111',
  },
});

export default DonateDetails;
