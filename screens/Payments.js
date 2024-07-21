import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { MaterialIcons, FontAwesome, Entypo } from '@expo/vector-icons';

const Payments = ({ route }) => {
  const { amount } = route.params;
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [bankDetails, setBankDetails] = useState({ bankName: '', accountNumber: '' });
  const [upiId, setUpiId] = useState('');

  const handlePayment = () => {
    if (selectedMethod) {
      const options = {
        description: 'Donation',
        image: '../assets/logo.png', // Replace with your logo URL
        currency: 'INR',
        key: 'your-razorpay-key-id', // Replace with your Razorpay Key ID
        amount: amount * 100, // Razorpay works with paise, so multiply by 100
        name: 'HelpEZ',
        prefill: {
          email: 'sajjadileep2003@gmail.com.com', // Optional: pre-fill user's email
          contact: '+91 7981305975', // Optional: pre-fill user's contact
          name: 'HelpEZ', // Optional: pre-fill user's name
        },
        theme: { color: '#007bff' },
      };

      RazorpayCheckout.open(options)
        .then((data) => {
          // Handle success
          Alert.alert('Payment Successful', `Payment ID: ${data.razorpay_payment_id}`);
        })
        .catch((error) => {
          // Handle failure
          Alert.alert('Payment Failed', error.description);
        });
    } else {
      Alert.alert('Error', 'Please select a payment method.');
    }
  };

  const renderPaymentDetails = () => {
    switch (selectedMethod) {
      case 'Bank Card':
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              keyboardType="numeric"
              value={cardDetails.number}
              onChangeText={(text) => setCardDetails({ ...cardDetails, number: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Expiry Date (MM/YY)"
              keyboardType="numeric"
              value={cardDetails.expiry}
              onChangeText={(text) => setCardDetails({ ...cardDetails, expiry: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="CVV"
              keyboardType="numeric"
              secureTextEntry
              value={cardDetails.cvv}
              onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
            />
          </View>
        );
      case 'Internet Banking':
        return (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Bank Name"
              value={bankDetails.bankName}
              onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              keyboardType="numeric"
              value={bankDetails.accountNumber}
              onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
            />
          </View>
        );
      case 'UPI':
        return (
          <TextInput
            style={styles.input}
            placeholder="UPI ID"
            value={upiId}
            onChangeText={setUpiId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Payment Method</Text>
      <Text style={styles.amount}>Amount: ₹{amount}</Text>
      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[styles.paymentOption, selectedMethod === 'Bank Card' && styles.selectedOption]}
          onPress={() => setSelectedMethod('Bank Card')}
        >
          <MaterialIcons name="credit-card" size={24} color="black" />
          <Text style={styles.optionText}>Bank Card</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paymentOption, selectedMethod === 'Internet Banking' && styles.selectedOption]}
          onPress={() => setSelectedMethod('Internet Banking')}
        >
          <FontAwesome name="bank" size={24} color="black" />
          <Text style={styles.optionText}>Internet Banking</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.paymentOption, selectedMethod === 'UPI' && styles.selectedOption]}
          onPress={() => setSelectedMethod('UPI')}
        >
          <Entypo name="wallet" size={24} color="black" />
          <Text style={styles.optionText}>UPI</Text>
        </TouchableOpacity>
      </View>
      {selectedMethod && (
        <View style={styles.detailsContainer}>
          {renderPaymentDetails()}
          <TouchableOpacity style={styles.backButton} onPress={() => setSelectedMethod(null)}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handlePayment}>
            <Text style={styles.confirmButtonText}>Confirm Payment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  amount: {
    fontSize: 20,
    marginBottom: 20,
    color: '#666',
  },
  paymentOptions: {
    width: '100%',
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  detailsContainer: {
    width: '100%',
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  backButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Payments;
