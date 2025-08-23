const mongoose = require("mongoose");

const dbUrl = process.env.MONGODB_URL || "";

let isConnected = false;

/**
 * Connect to MongoDB
 */
async function connectDB() {
  if (isConnected) {
    console.log("Already connected to MongoDB");
    return;
  }

  try {
    await mongoose.connect(dbUrl);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("Disconnected from MongoDB");
  }
}

module.exports = {
  connectDB,
  disconnectDB,
};