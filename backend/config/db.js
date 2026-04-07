const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, {
        authSource: 'admin'
      });
      console.log("MongoDB Connected");
      isConnected = true;
    } else {
      console.log("MongoDB URI not configured - running in offline mode");
      isConnected = false;
    }
  } catch (error) {
    console.log("MongoDB connection failed - running in offline mode");
    console.error('MongoDB Error Details:', error.message);
    if (error.message.includes('authentication failed')) {
      console.log('Fix: Check MONGO_URI credentials/IP whitelist in Atlas.');
    }
    isConnected = false;
  }
};

const getConnectionStatus = () => isConnected;

module.exports = { connectDB, getConnectionStatus };

