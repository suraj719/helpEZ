import {React,  useState,useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, Modal, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import * as Location from 'expo-location';
import axios from 'axios';
import { collection, getDocs,addDoc ,updateDoc,query,where} from 'firebase/firestore';
import { firestore } from '../utils/firebase'; // Ensure correct import
import AsyncStorage from '@react-native-async-storage/async-storage';


const warehouses = [
  { id: '1', name: 'Warehouse 1', latitude: 37.7749, longitude: -122.4194 },
  { id: '2', name: 'Warehouse 2', latitude: 37.8049, longitude: -122.2711 },
  { id: '3', name: 'Warehouse 3', latitude: 37.7849, longitude: -122.3994 },
  // Add more warehouse locations or fetch from an API
];

const DonateForm = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [location, setLocation] = useState("");
    const [currentLocation, setCurrentLocation] = useState(null);
    const [pickupDetails, setPickupDetails] = useState({
        address: '',
        date: new Date(),
        time: new Date(),
    });
    const [dropOff, setDropOff] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showWarehouseModal, setShowWarehouseModal] = useState(false);
    const [nearbyWarehouses, setNearbyWarehouses] = useState([]);
    const { donationQuantities,category } = route.params; // Get donation quantities from route params
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

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setPickupDetails(prev => ({
                ...prev,
                date: selectedDate,
            }));
        }
    };

    const handleTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setPickupDetails(prev => ({
                ...prev,
                time: selectedTime,
            }));
        }
    };

    const fetchNearbyWarehouses = async (latitude, longitude) => {
        // Replace this with an API call if needed
        return warehouses;
    };

    const handleWareHouseLocationFetch = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Location Permission Denied', 'Please enable location permissions in your device settings.');
            return;
        }

        try {
            let locationData = await Location.getCurrentPositionAsync({});
            let { latitude, longitude } = locationData.coords;

            const nearbyWarehouses = await fetchNearbyWarehouses(latitude, longitude);
            setNearbyWarehouses(nearbyWarehouses);
            setShowWarehouseModal(true);
        } catch (error) {
           // console.error('Error fetching location:', error);
         //   Alert.alert('Error', 'Failed to fetch location');
        }
    };

    const handleLocationFetch = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Location permission denied', 'Please enable location permissions in your device settings.');
            return;
        }

        try {
            let locationData = await Location.getCurrentPositionAsync({});
            let { latitude, longitude } = locationData.coords;
            setCurrentLocation({ latitude, longitude });

            const response = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAcRopFCtkeYwaYEQhw1lLF2bbU50RsQgc`
            );

            if (response.data.results.length > 0) {
                const addressComponents = response.data.results[0].address_components;
                let village = "";
                let state = "";

                for (let component of addressComponents) {
                    if (component.types.includes('locality')) {
                        village = component.long_name;  
                    }
                    if (component.types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    }
                }

                let areaName = `${village}, ${state}`;
                setLocation(areaName);
            } else {
              //  Alert.alert('Location Not Found', 'Unable to fetch location details');
            }
        } catch (error) {
            console.error('Error fetching location:', error);
          //  Alert.alert('Error', 'Failed to fetch location');
        }
    };

    const handleWarehouseSelect = (warehouse) => {
        setLocation(warehouse.name);
        setShowWarehouseModal(false);
    };
    const handleWarehouse=()=>{
        navigation.navigate("DropOffScreen");
    };

    const handleSubmit = async () => {
        const formattedDate = pickupDetails.date.toISOString().split('T')[0];
        const formattedTime = pickupDetails.time.toTimeString().split(' ')[0];
        console.log(pickupDetails);
        try {
            if (dropOff) {
                Alert.alert('Thank you!', 'Please visit our nearest warehouse to drop off your items.');
                // Optionally handle drop-off logic here
            } else if (location && formattedDate && formattedTime) {
                await addDoc(collection(firestore, 'pickupRequests'), {
                    username,
                    phoneNumber,
                    category,
                    address: location,
                    date: formattedDate,
                    time: formattedTime,
                    location: location,
                    donationQuantities, // Save donation quantities
                });
                Alert.alert('Pickup Scheduled', `Your pickup has been scheduled on ${formattedDate} at ${formattedTime}.`);
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Please fill in all pickup details.');
            }
        } catch (error) {
            console.error('Error submitting pickup request:', error);
            Alert.alert('Error', 'Failed to schedule pickup.');
        }
    };

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
                <Text style={styles.title}>Donation Form</Text>

                <TouchableOpacity
                    style={[styles.optionButton, dropOff && styles.selectedOption]}
                    onPress={() => {
                        handleWarehouse();
                        setDropOff(true);
                        setPickupDetails(prev => ({
                            ...prev,
                            address: '' // Clear address if drop-off is selected
                        }));
                        handleWareHouseLocationFetch();
                    }}
                >
                    <Ionicons name="home" size={20} color="#fff" />
                    <Text style={styles.optionText}>Drop off at Nearest Warehouse</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.optionButton, !dropOff && styles.selectedOption]}
                    onPress={() => {
                        setDropOff(false);
                        setLocation(''); // Clear location if pickup is selected
                    }}
                >
                    <FontAwesome6 name="boxes-packing" size={20} color="#fff" />
                    <Text style={styles.optionText}>Schedule Pickup</Text>
                </TouchableOpacity>

                {!dropOff && (
                    <View style={styles.pickupForm}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Pickup Location:</Text>
                            <View style={styles.locationContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={location}
                                    onChangeText={setLocation}
                                    placeholder="Enter your pickup location"
                                    editable={true}
                                />
                                <TouchableOpacity onPress={handleLocationFetch} style={styles.locationButton}>
                                    <Ionicons name="location" size={24} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                            <Ionicons name="calendar" size={20} color="#000" style={styles.icon} />
                            <Text style={styles.dateButtonText}>
                                {pickupDetails.date.toISOString().split('T')[0] || 'Select Date'}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={pickupDetails.date}
                                mode="date"
                                is24Hour={true}
                                display="default"
                                onChange={handleDateChange}
                            />
                        )}
                        <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                            <Ionicons name="time" size={20} color="#000" style={styles.icon} />
                            <Text style={styles.timeButtonText}>
                                {pickupDetails.time.toTimeString().split(' ')[0] || 'Select Time'}
                            </Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                testID="timePicker"
                                value={pickupDetails.time}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={handleTimeChange}
                            />
                        )}
                    </View>
                )}

                <TouchableOpacity  
                className="bg-green-500 rounded-lg p-2 my-4"
                onPress={handleSubmit}>
                    <Text className="text-xl text-center">Submit</Text>
                </TouchableOpacity>

                {/* Warehouse Modal */}
                {/*
                <Modal
                    visible={showWarehouseModal}
                    transparent={true}
                    animationType="slide"
                >
                    <View style={styles.modalContainer}>
                        <FlatList
                            data={nearbyWarehouses}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.warehouseItem}
                                    onPress={() => handleWarehouseSelect(item)}
                                >
                                    <Text style={styles.warehouseName}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowWarehouseModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Modal> */}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    backButton: {
        padding: 10,
        marginBottom: 10,
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        backgroundColor: '#007bff',
        borderRadius: 5,
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: '#0056b3',
    },
    optionText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    pickupForm: {
        marginTop: 20,
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 5,
    },
    locationButton: {
        backgroundColor: '#007bff',
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 5,
        marginLeft: 10,
        marginLeft: 10,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 10,
        marginTop: 10,
    },
    dateButtonText: {
        marginLeft: 10,
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    icon: {
        marginRight: 10,
    },
    dateButtonText: {
        fontSize: 16,
    },
    timeButtonText: {
        marginLeft: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    modalCloseButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#fff',
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#fff',
    },
});

export default DonateForm;
