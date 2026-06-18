const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middlewares
app.use(helmet()); // Sets secure HTTP headers
app.use(cors());

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use('/api', limiter);

// Body Parser
app.use(express.json());

// Routes
const memberRoutes = require('./routes/member.routes');
const reservationRoutes = require('./routes/reservation.routes');
const aiRoutes = require('./routes/ai.routes');

app.use('/api/members', memberRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/ai', aiRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.send('LMS Server is running (PostgreSQL + Prisma)');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
