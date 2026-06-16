const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// Helper to lazily load Book model
const getBookModel = () => {
  if (mongoose.models.Book) {
    return mongoose.models.Book;
  }
  return mongoose.model('Book', new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: { type: String },
    isbn: { type: String, required: true },
    availableCopies: { type: Number, default: 0 }
  }, { timestamps: true, collection: 'books' }));
};

/**
 * Helper to auto-expire reservations and notify next in queue.
 * Can be run on requests to ensure queue status stays current.
 */
const autoExpireReservations = async () => {
  try {
    const now = new Date();
    // Find all pending, notified reservations that have expired
    const expiredReservations = await Reservation.find({
      status: 'pending',
      notified: true,
      expiresAt: { $lt: now }
    });

    for (const resDoc of expiredReservations) {
      resDoc.status = 'expired';
      await resDoc.save();
      // Notify the next person in queue
      await notifyNextInQueue(resDoc.bookId);
    }
  } catch (error) {
    console.error('Error in autoExpireReservations:', error);
  }
};

/**
 * Helper to notify the next member in the queue for a book
 */
const notifyNextInQueue = async (bookId) => {
  try {
    // Find next pending, unnotified reservation sorted by reservedAt
    const nextReservation = await Reservation.findOne({
      bookId,
      status: 'pending',
      notified: false
    }).sort({ reservedAt: 1 });

    if (nextReservation) {
      nextReservation.notified = true;
      // Expires 3 days from now
      nextReservation.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      await nextReservation.save();

      // Trigger Email Notification (if mailer exists)
      const Book = getBookModel();
      const member = await User.findById(nextReservation.memberId);
      const book = await Book.findById(nextReservation.bookId);

      if (member && book) {
        let mailer;
        try {
          mailer = require('../utils/mailer');
        } catch (e) {
          console.log(`[Notification Stub] Email to ${member.email}: Reserved book "${book.title}" is now available. Please borrow it within 3 days.`);
        }

        if (mailer && typeof mailer.sendMail === 'function') {
          await mailer.sendMail({
            to: member.email,
            subject: 'Reserved Book Available - LMS',
            text: `Hello ${member.name},\n\nYour reserved book "${book.title}" is now available for borrowing. You have 3 days (until ${nextReservation.expiresAt.toLocaleDateString()}) to borrow this book before your reservation expires.\n\nThank you,\nLibrary Management System`
          });
        }
      }
    }
  } catch (error) {
    console.error('Error notifying next in queue:', error);
  }
};

/**
 * Create a book reservation
 * Access: Member (Self), Librarian, Admin
 */
const createReservation = async (req, res) => {
  try {
    await autoExpireReservations();

    const { bookId } = req.body;
    // For Admins/Librarians, allow passing memberId in body. Otherwise, default to logged-in user.
    let memberId = req.user.id;
    if ((req.user.role === 'admin' || req.user.role === 'librarian') && req.body.memberId) {
      memberId = req.body.memberId;
    }

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    // 1. Verify Member Status
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    if (member.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Suspended members cannot reserve books' });
    }

    // 2. Verify Book Availability
    const Book = getBookModel();
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // If copies are available, redirect or advise to borrow directly
    if (book.availableCopies > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Book is currently available (${book.availableCopies} copy/copies left). Please borrow it directly instead of reserving.` 
      });
    }

    // 3. Enforce maximum 1 active reservation per book per member
    const existingReservation = await Reservation.findOne({
      memberId,
      bookId,
      status: 'pending'
    });

    if (existingReservation) {
      return res.status(400).json({ success: false, message: 'You already have an active reservation for this book.' });
    }

    // Create reservation
    const reservation = new Reservation({
      memberId,
      bookId,
      status: 'pending',
      notified: false
    });

    await reservation.save();

    res.status(201).json({
      success: true,
      message: 'Book reserved successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get reservations for a member
 * Access: Librarian, Admin, Self
 */
const getMemberReservations = async (req, res) => {
  try {
    await autoExpireReservations();

    const { memberId } = req.params;

    if (req.user.role === 'member' && req.user.id !== memberId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own reservations.' });
    }

    const Book = getBookModel(); // Ensure model loaded
    const reservations = await Reservation.find({ memberId })
      .populate('bookId', 'title author coverImage isbn')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Cancel a reservation
 * Access: Librarian, Admin, Self (own reservation)
 */
const cancelReservation = async (req, res) => {
  try {
    await autoExpireReservations();

    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Auth check
    if (req.user.role === 'member' && req.user.id !== reservation.memberId.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only cancel your own reservations.' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot cancel a reservation that is already ${reservation.status}` });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    // If this reservation was already notified (meaning book was allocated to them),
    // and they cancel, we pass the book to the next person in queue.
    if (reservation.notified) {
      await notifyNextInQueue(reservation.bookId);
    }

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get reservation queue for a specific book
 * Access: Librarian, Admin
 */
const getReservationQueue = async (req, res) => {
  try {
    await autoExpireReservations();

    const { bookId } = req.params;

    const queue = await Reservation.find({
      bookId,
      status: 'pending'
    })
    .populate('memberId', 'name email membershipId status')
    .sort({ reservedAt: 1 });

    res.status(200).json({
      success: true,
      count: queue.length,
      data: queue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get all reservations
 * Access: Librarian, Admin
 */
const getAllReservations = async (req, res) => {
  try {
    await autoExpireReservations();

    const Book = getBookModel(); // Ensure model loaded
    const reservations = await Reservation.find()
      .populate('memberId', 'name email membershipId status')
      .populate('bookId', 'title author coverImage isbn')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReservation,
  getMemberReservations,
  cancelReservation,
  getReservationQueue,
  getAllReservations,
  notifyNextInQueue // Exported for use on borrowing return updates
};
