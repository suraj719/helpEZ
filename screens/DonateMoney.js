import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';

const DonateMoney = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleDonate = async () => {
    try {
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: 'YOUR_CLIENT_SECRET', // Get this from your server
      });

      if (!error) {
        const { error } = await presentPaymentSheet();
        if (error) {
          Alert.alert("Payment failed", error.message);
        } else {
          Alert.alert("Payment succeeded");
        }
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View>
      <Text>Donate Money</Text>
      <Button title="Donate" onPress={handleDonate} />
    </View>
  );
};

export default () => (
  <StripeProvider publishableKey="pk_test_51Ol2WYSHReUGwLFzxQalFabnup0O24BbbXnhVzICOhithYWOnWhPF1sioMh6TmFbKA7AH3HtRyzqZi3qm36toE1900xA57P7SC">
    <DonateMoney />
  </StripeProvider>
);
