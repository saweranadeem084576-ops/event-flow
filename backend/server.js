const dotenv = require('dotenv');

// Load env vars BEFORE anything else
dotenv.config({ path: './.env' });

const app = require('./app');
const connectDB = require('./config/db');

// Handle uncaught exceptions (sync errors)
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Connect to database
const DB =
  process.env.NODE_ENV === 'production'
    ? process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
    : process.env.DATABASE_LOCAL;

connectDB(DB);

// Start server
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App running in ${process.env.NODE_ENV} mode on port ${port}...`);
});

// Handle unhandled promise rejections (async errors)
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
