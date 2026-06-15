const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMemberReservations,
  cancelReservation,
  getReservationQueue,
  getAllReservations
} = require('../controllers/reservation.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protect all routes under this router
router.use(protect);

// Create reservation or get all reservations
router.route('/')
  .post(createReservation)
  .get(authorize('admin', 'librarian'), getAllReservations);

// Get member reservations
router.get('/:memberId', getMemberReservations);

// Cancel reservation
router.delete('/:id', cancelReservation);

// View queue for a specific book (Librarian/Admin only)
router.get('/book/:bookId', authorize('admin', 'librarian'), getReservationQueue);

module.exports = router;
