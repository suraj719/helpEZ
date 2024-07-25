import express from "express";
import Stripe from "stripe";

const app = express();
const port = 3000;
const PUBLISHABLE_KEY = "pk_test_51PfyNNSIFOnTo8EmSKccro3cOJUwDmHBl5UqVbnWs9svBLOVckXBeyovRyXgMvhjvMxBbGbIRuRg2uYHeGfSthCk00DPtz0853";
const SECRET_KEY = "sk_test_51PfyNNSIFOnTo8EmAyBYXbxBbwZWACRq9VWUBKuZ4LkXL8cLRqEaBwQx9tBdhhGnDJU0Pgc3Dq66BVmLmHfPc4NG00sFSo9Riu";

const stripe = Stripe(SECRET_KEY, { apiVersion: "2020-08-27" });

app.use(express.json());

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const amount = 100; // Example amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr", 
      payment_method_types: ["card"], 
    });

    console.log('Payment Intent:', paymentIntent); 
    if (paymentIntent && paymentIntent.client_secret) {
      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } else {
      throw new Error('Client secret is not available');
    }
  } catch (e) {
    console.error('Error:', e); 
    res.status(500).json({ error: e.message });
  }
});
