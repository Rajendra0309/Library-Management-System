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
const jwt = require('jsonwebtoken');
const prisma = require('./prisma/client');

// --- DEVELOPMENT MOCK LOGIN ---
app.post('/api/mock-login', async (req, res) => {
  const { role } = req.body; // 'admin', 'librarian', or 'member'
  const email = `mock${role}@library.com`;
  
  try {
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          email: email,
          password: 'mockpassword', // Usually this would be hashed, but it's a mock
          role: role,
          status: 'active',
          membershipId: `LMS-MOCK-${Math.floor(Math.random() * 10000)}`
        }
      });
    }

    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'your_super_secret_key', 
      { expiresIn: '1d' }
    );

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// ------------------------------

app.use('/api/members', memberRoutes);
app.use('/api/reservations', reservationRoutes);

// Base route for health check
app.get('/', (req, res) => {
  res.send('LMS Server is running (PostgreSQL + Prisma)');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
