const mongoose = require('mongoose');

const connectDB = async (databaseURL) => {
  const conn = await mongoose.connect(databaseURL);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
};

module.exports = connectDB;
