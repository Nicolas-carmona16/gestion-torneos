/**
 * @file db.js
 * @description This file sets up the MongoDB connection using Mongoose.
 */

import mongoose from "mongoose";

/**
 * @function connectDB
 * @description Connects to the MongoDB database using the MONGO_URI from environment variables.
 * @returns {Promise<void>} A promise that resolves when the connection is successful.
 */

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
