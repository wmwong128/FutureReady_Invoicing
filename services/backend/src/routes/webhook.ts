import express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Invoice, Customer, Order } = require("../models/dbScheme");
const { calculateCustomerRisk, getRiskLevel } = require("../models/threshold");

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

      const invoice = await Invoice.findOne({ stripeinvoiceid: stripeInvoice.id });
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      const order = await Order.findOne({ ordernumber: invoice.ordernumber });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      const customer = await Customer.findOne({ customerid: order.customerid });
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const riskScore = await calculateCustomerRisk(customer.customerid);
      const riskLevel = getRiskLevel(riskScore);

      await Customer.findOneAndUpdate(
      { customerid: customer.customerid },
        { 
          $inc: { 
            totaloutstanding: -invoice.totalamount,
            totalinvoices: -1
          },
          $set: { 
            riskscore: riskScore,
            dangerlevel: riskLevel 
          }
        },
        { new: true }
      );
    } catch (dbErr) {
      console.error("Failed to update invoice in DB:", dbErr);
    }
  }

  res.json({ received: true });
});

module.exports = router;
