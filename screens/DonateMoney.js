import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert } from "react-native";
import { CardField, useConfirmPayment } from "@stripe/stripe-react-native";

// Replace with your server address if different
const API_URL = "http://localhost:3000";

const DonateMoney = () => {
  const [email, setEmail] = useState("");
  const [cardDetails, setCardDetails] = useState();
  const { confirmPayment, loading } = useConfirmPayment();

  const fetchPaymentIntentClientSecret = async () => {
    try {
      const response = await fetch(`${API_URL}/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Log the response for debugging
      const responseData = await response.json();
      console.log("Server response:", responseData);
  
      const { clientSecret, error } = responseData;
      if (error) {
        console.error("Error fetching client secret:", error);
      }
      return { clientSecret, error };
    } catch (e) {
      console.error("Error fetching client secret:", e);
    }
  };
  

  const handlePayPress = async () => {
    if (!cardDetails?.complete || !email) {
      Alert.alert("Please enter complete card details and email.");
      return;
    }

    const billingDetails = { email };

    try {
      const { clientSecret, error } = await fetchPaymentIntentClientSecret();
      if (error) {
        console.error("Unable to process payment:", error);
        Alert.alert("Error", "Unable to process payment");
        return;
      }

      const { paymentIntent, error: confirmError } = await confirmPayment(clientSecret, {
        type: "Card",
        billingDetails,
      });

      if (confirmError) {
        Alert.alert("Payment Confirmation Error", confirmError.message);
      } else if (paymentIntent) {
        Alert.alert("Payment Successful", "Your payment was successful!");
        console.log("Payment successful:", paymentIntent);
        // Handle any post-payment logic here
      }
    } catch (e) {
      console.error("Error confirming payment:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donate Money</Text>
      <TextInput
        autoCapitalize="none"
        placeholder="E-mail"
        keyboardType="email-address"
        onChangeText={text => setEmail(text)}
        style={styles.input}
        value={email}
      />
      <CardField
        postalCodeEnabled={true}
        placeholder={{
          number: "4242 4242 4242 4242",
        }}
        cardStyle={styles.card}
        style={styles.cardContainer}
        onCardChange={cardDetails => setCardDetails(cardDetails)}
      />
      <Button onPress={handlePayPress} title="Pay" disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    margin: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#efefef",
    borderRadius: 8,
    fontSize: 20,
    height: 50,
    padding: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#efefef",
  },
  cardContainer: {
    height: 50,
    marginVertical: 30,
  },
});

export default DonateMoney;
