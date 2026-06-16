const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Initialize database connection
connectDB();

const app = express();

// Standard Express Middlewares
app.use(cors());
app.use(express.json());

// Base status route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'LMS Backend Server running smoothly.' });
});

// Mount routes for Member 3 Modules
app.use('/api/members', require('./routes/member.routes'));
app.use('/api/reservations', require('./routes/reservation.routes'));

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
