import express = require("express");
import type Stripe from "stripe";
const StripeLib = require("stripe");

const stripe = new StripeLib(process.env.STRIPE_SECRET_KEY) as Stripe;

const router = express.Router();

router.post("/create-intent", async (req, res) => {
    console.log("TEST2")
  try {
    const { invoiceId, amount } = req.body;

    if (!invoiceId || !amount) {
      return res.status(400).json({ error: "Missing invoiceId or amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "myr",
      metadata: { invoiceId }, 
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error("Error creating PaymentIntent:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

export = router;
