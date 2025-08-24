import metadata = require('./metadata');
import type { MongooseError } from "mongoose";
import schemas = require('./models/dbScheme');

const mongoose = require('mongoose');
const { Invoice, Customer, Order, InvoiceStatus } = schemas;

// const name = metadata.packageData['name'] as string;
// console.log(`Daily routine of ${name} executed.`);

const dbUrl = process.env.MONGODB_URL;

mongoose.connect(dbUrl)
  .then(() => {
      console.log('Connected to MongoDB');
  })
  .catch((error: MongooseError) => {
      console.error('Error connecting to MongoDB:', error.message);
      if (error.name === 'MongoNetworkError') {
          console.error('Network error occurred. Check your MongoDB server.');
      } else if (error.name === 'MongooseServerSelectionError') {
          console.error('Server selection error. Ensure'
              + ' MongoDB is running and accessible.');
      } else {
          console.error('An unexpected error occurred:', error);
      }
  });

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
    
    console.log(`Updated payday for ${payDayUpdateResult.modifiedCount} invoices`);
    
    // 2. Update status to OVERDUE for invoices past due date
    const overdueUpdateResult = await Invoice.updateMany(
      {
        duedate: { $lt: currentDate }, 
        status: InvoiceStatus.PENDING 
      },
      { 
        $set: { status: InvoiceStatus.OVERDUE } 
      }
    );
    
    console.log(`Updated ${overdueUpdateResult.modifiedCount} invoices to OVERDUE status`);
    
    // Optional: Log some statistics
    const totalOverdueInvoices = await Invoice.countDocuments({ 
      status: InvoiceStatus.OVERDUE 
    });
    
    console.log(`Total overdue invoices: ${totalOverdueInvoices}`);
    console.log('Daily invoice status update completed successfully');
    
  } catch (error) {
    console.error('Error updating invoice status:', error);
  }
};

// Execute the update function
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