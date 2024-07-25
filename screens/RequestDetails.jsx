import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StatusProgressBar from './StatusProgressBar';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialIcons';

const RequestDetails = ({ route }) => {
  const { request } = route.params;
  const navigation = useNavigation();

  const renderStatusComponent = () => {
    if (request.status.toLowerCase() === 'pending') {
      return (
        <View style={styles.pendingBlock}>
          <Text style={styles.pendingText}>Request is not validated</Text>
        </View>
      );
    } else {
      return <StatusProgressBar currentStatus={request.status} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={24} color="black" />
        <Text>Back</Text>
      </TouchableOpacity>
      {renderStatusComponent()}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{request.requestTitle}</Text>
          <Text style={styles.description}>{request.requestDescription}</Text>

          <DetailItem label="Category" value={request.category} />
          <DetailItem label="Needed By" value={request.neededBy} />
          <DetailItem label="Severity" value={request.severity} />
          <DetailItem label="Status" value={request.status} />

          <Text style={styles.sectionTitle}>Items:</Text>
          <View style={styles.itemsContainer}>
            {request.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.itemName}</Text>
                <Text style={styles.itemQuantity}>{item.itemQuantity}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Warehouse Information:</Text>
          <DetailItem label="Name" value={request.warehouseName} />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.navigateButton}
        onPress={() => navigation.navigate('ResourceRouteScreen', {
          originCords: request.warehouseLocation,
          destCords: request.location
        })}
      >
        <Icon name="directions" size={24} color="#fff" />
        <Text style={styles.navigateButtonText}>Navigate to Destination</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const DetailItem = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 100,
    color: '#555',
  },
  detailValue: {
    fontSize: 18,
    flex: 1,
    color: '#333',
  },
  itemsContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#666',
  },
  navigateButton: {
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  navigateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  pendingBlock: {
    backgroundColor: 'red',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
  },
  pendingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RequestDetails;
