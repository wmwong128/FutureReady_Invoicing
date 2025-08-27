import express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Invoice } = require("../models/dbScheme");

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
    
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  if (event.type === "invoice.payment_succeeded") {
    const stripeInvoice = event.data.object;

    try {
      await Invoice.updateOne(
        { stripeinvoiceid: stripeInvoice.id }, 
        {
          $set: {
            status: "PAID",
            paymentdate: new Date()
          }
        }
      );
      console.log("Invoice updated for Stripe invoice:", stripeInvoice.id);
    } catch (dbErr) {
      console.error("Failed to update invoice in DB:", dbErr);
    }
  }

  res.json({ received: true });
});

module.exports = router;
