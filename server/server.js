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

// ─── Routes ─────────────────────────────────────────────────────────────────

// // Module 1: Auth + Staff Management
const authRoutes = require('./routes/auth.routes');
const staffRoutes = require('./routes/staff.routes');

// // Module 3: Members + Reservations
const memberRoutes = require('./routes/member.routes');
const reservationRoutes = require('./routes/reservation.routes');
const bookRoutes = require('./routes/book.routes');
const aiRoutes = require('./routes/ai.routes');
const reportRoutes = require('./routes/report.routes');
const borrowRoutes = require('./routes/borrow.routes');
const fineRoutes = require('./routes/fine.routes');
const uploadRoutes = require("./routes/upload.routes");

// // -----------s3 route---------------------------
// const s3 = require("./config/s3");


app.use('/api/auth', authRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/fines', fineRoutes);
app.use("/api/uploads", uploadRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LMS Server is running (PostgreSQL + Prisma)',
    version: '1.0.0'
  });
});

// // -------------------------checking s3-------------------------
// app.get("/test-s3", async (req, res) => {
//   try {
//     const data = await s3.listBuckets().promise();

//     res.json({
//       success: true,
//       buckets: data.Buckets,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });


// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ LMS Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
