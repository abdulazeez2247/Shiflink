const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    // More detailed error logging
    if (err.message.includes('bad auth')) {
      console.error('Double check your username and password in .env');
      console.error('Remember to URL-encode special characters in password');
    }
    process.exit(1);
  }
};

mongoose.connection.on('error', err => {
  console.log('MongoDB runtime error:', err);
});

module.exports = connectDB;