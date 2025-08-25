import metadata = require('./metadata');
import type { MongooseError } from "mongoose";
import schemas = require('./models/dbScheme');
import mailing = require('./mailing');

const mongoose = require('mongoose');
const { connectDB } = require("./models/database");
const { Invoice, Customer, Order, InvoiceStatus } = schemas;
const { sendEmail } = mailing;
const { calculateCustomerRisk, getRiskLevel } = require("./models/threshold");

const stripe = require('stripe')(process.env.STRIPE_SECRET);

async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to database. Exiting.");
    process.exit(1);
  }
}

startServer();

const updateInvoiceStatus = async (): Promise<void> => {
  try {
    console.log('Starting daily invoice status update...');

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); 

    // 1. Increment payday for all invoices by 1
    const payDayUpdateResult = await Invoice.updateMany(
      {
        duedate: { $gte: currentDate }, 
        status: InvoiceStatus.PENDING   
      }, 
      { 
        $inc: { payday: 1 } 
      }
    );

    // 3. Customer follow-up
    const invoiceFollowUp = await Invoice.find({ status: "PENDING" });

    for (const invoice of invoiceFollowUp) {
      try {
        const order = await Order.findOne({ ordernumber: invoice.ordernumber });
        if (!order) {
          throw new Error(`Order not found for invoice ${invoice._id}`);
        }

        const customer = await Customer.findOne({ customerid: order.customerid });
        if (!customer) {
          throw new Error(`Customer not found for order ${order.ordernumber}`);
        }

        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeinvoiceid);
        if (!stripeInvoice.invoice_pdf) {
          throw new Error("PDF not available");
        }

        const dueDate = new Date(invoice.duedate);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - currentDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (invoice.payday === 30 || diffDays === 60){
          try {
            await sendEmail({
              payload: {
                to: customer.email,
                subject: `Reminder: Payment Due for Invoice ${invoice.invoicenumber}`,
                html: `
                  <p>Dear ${customer.name},</p>
                  <p>This is a friendly reminder that your invoice <strong>${invoice.invoicenumber}</strong> is due in <strong>60 days</strong> (due date: ${invoice.duedate.toDateString()}).</p>
                  <p>Please take a moment to review your invoice and ensure payment is arranged in time.</p>
                  <p>You can view and pay the invoice here: <a href="${stripeInvoice.invoice_pdf}">View Invoice</a></p>
                  <p>Thank you for your prompt attention.</p>
                `
              },
            });
          } catch (emailErr) {
            console.error("Failed to send email:", emailErr);
          }
        }

        if (invoice.payday === 60 || diffDays === 30){
          try {
            await sendEmail({
              payload: {
                to: customer.email,
                subject: `Urgent: Invoice ${invoice.invoicenumber} Due in 30 Days`,
                html: `
                  <p>Dear ${customer.name},</p>
                  <p>This is a reminder that your invoice <strong>${invoice.invoicenumber}</strong> is due in <strong>30 days</strong> (due date: ${invoice.duedate.toDateString()}).</p>
                  <p>We kindly request that you arrange payment soon to avoid any late fees or service interruptions.</p>
                  <p>You can review and pay the invoice here: <a href="${stripeInvoice.invoice_pdf}">View Invoice</a></p>
                  <p>Thank you for your cooperation.</p>
                `
              },
            });
          } catch (emailErr) {
            console.error("Failed to send email:", emailErr);
          }
        }

        if ((invoice.payday && invoice.payday >= 87 && invoice.payday < 90) || diffDays > 0 && diffDays < 3){
          try {
            await sendEmail({
              payload: {
                to: "tengstc@gmail.com",
                subject: `Final Notice: Invoice ${invoice.invoicenumber} Due soon`,
                html: `
                  <p>Dear ${customer.name},</p>
                  <p>This is the final reminder that your invoice <strong>${invoice.invoicenumber}</strong> is due in <strong>5 days</strong> (due date: ${invoice.duedate.toDateString()}).</p>
                  <p>Please ensure payment is completed before the due date to avoid penalties or service suspension.</p>
                  <p>You can pay the invoice here: <a href="${stripeInvoice.invoice_pdf}">Pay Invoice</a></p>
                  <p>We greatly appreciate your prompt action on this matter.</p>
                `
              },
            });
          } catch (emailErr) {
            console.error("Failed to send email:", emailErr);
          }
        }

      } catch (err) {
        console.error(err);
      }
    };

    // 4. Client due email
    const invoiceOverdue = await Invoice.find({ 
      status: "PENDING",
      // duedate: { $lt: currentDate }, 
      payday: "90" // Simulation
    });

    for (const invoice of invoiceOverdue){
      try {
        const order = await Order.findOne({ ordernumber: invoice.ordernumber });
        if (!order) {
          throw new Error(`Order not found for invoice ${invoice._id}`);
        }

        const customer = await Customer.findOne({ customerid: order.customerid });
        if (!customer) {
          throw new Error(`Customer not found for order ${order.ordernumber}`);
        }

        const stripeInvoice = await stripe.invoices.retrieve(invoice.stripeinvoiceid);
        if (!stripeInvoice.invoice_pdf) {
          throw new Error("PDF not available");
        }

        try {
          await sendEmail({
            payload: {
              to: customer.email,
              subject: `Invoice ${invoice.invoicenumber} is Due Today`,
              html: `
                <p>Dear ${customer.name},</p>
                <p>This is a notice that your invoice <strong>${invoice.invoicenumber}</strong> is <strong>due today (${invoice.duedate.toDateString()})</strong>.</p>
                <p>If you have already made the payment, please disregard this message. Otherwise, we kindly request you to complete the payment immediately to avoid any late fees or service interruptions.</p>
                <p>You can review and pay your invoice here: <a href="${stripeInvoice.invoice_pdf}">Pay Invoice</a></p>
                <p>Thank you for your prompt attention to this matter.</p>
              `
            },
          });

        } catch (emailErr) {
          console.error("Failed to send email:", emailErr);
        }
      } catch (err) {
        console.error(err);
      };
    };

    // 2. Update status to OVERDUE for invoices past due date
    const overdueUpdateResult = await Invoice.updateMany(
      {
        // duedate: { $lt: currentDate }, 
        payday: 90, // This is use for simulation since real date wont update
        status: InvoiceStatus.PENDING 
      },
      { 
        $set: { status: InvoiceStatus.OVERDUE } 
      }
    );
    
    // Log
    const totalOverdueInvoices = await Invoice.countDocuments({ 
      status: InvoiceStatus.OVERDUE 
    });
    
  } catch (error) {
    console.error('Error updating invoice status:', error);
  }
};

const runDailyUpdate = async (): Promise<void> => {
  try {
    await updateInvoiceStatus();
  } catch (error) {
    console.error('Failed to run daily update:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the update
runDailyUpdate();