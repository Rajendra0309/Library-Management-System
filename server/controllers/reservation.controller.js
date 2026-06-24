const prisma = require('../prisma/client');

/**
 * Helper to auto-expire reservations and notify next in queue.
 * Can be run on requests to ensure queue status stays current.
 */
const autoExpireReservations = async () => {
  try {
    const now = new Date();
    // Find all pending, notified reservations that have expired
    const expiredReservations = await prisma.reservation.findMany({
      where: {
        status: 'pending',
        notified: true,
        expiresAt: { lt: now }
      }
    });

    for (const resDoc of expiredReservations) {
      await prisma.reservation.update({
        where: { id: resDoc.id },
        data: { status: 'expired' }
      });
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
    const nextReservation = await prisma.reservation.findFirst({
      where: {
        bookId,
        status: 'pending',
        notified: false
      },
      orderBy: { reservedAt: 'asc' }
    });

    if (nextReservation) {
      const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
      
      await prisma.reservation.update({
        where: { id: nextReservation.id },
        data: {
          notified: true,
          expiresAt
        }
      });

      // Trigger Email Notification (if mailer exists)
      const member = await prisma.user.findUnique({ where: { id: nextReservation.memberId } });
      const book = await prisma.book.findUnique({ where: { id: nextReservation.bookId } });

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
            text: `Hello ${member.name},\n\nYour reserved book "${book.title}" is now available for borrowing. You have 3 days (until ${expiresAt.toLocaleDateString()}) to borrow this book before your reservation expires.\n\nThank you,\nLibrary Management System`
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
    let memberId = req.user.id;
    
    // Admins/Librarians can reserve for others
    if ((req.user.role === 'admin' || req.user.role === 'librarian') && req.body.memberId) {
      memberId = req.body.memberId;
    }

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Book ID is required' });
    }

    // 1. Verify Member Status
    const member = await prisma.user.findUnique({ where: { id: memberId } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    if (member.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Suspended members cannot reserve books' });
    }

    // 2. Verify Book Availability
    const book = await prisma.book.findUnique({ where: { id: bookId } });
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
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        memberId,
        bookId,
        status: 'pending'
      }
    });

    if (existingReservation) {
      return res.status(400).json({ success: false, message: 'You already have an active reservation for this book.' });
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        memberId,
        bookId,
        status: 'pending',
        notified: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'Book reserved successfully',
      data: reservation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const reservations = await prisma.reservation.findMany({
      where: { memberId },
      include: {
        book: {
          select: { title: true, author: true, coverImage: true, isbn: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Auth check
    if (req.user.role === 'member' && req.user.id !== reservation.memberId) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only cancel your own reservations.' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot cancel a reservation that is already ${reservation.status}` });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    // If this reservation was already notified pass the book to the next person in queue.
    if (reservation.notified) {
      await notifyNextInQueue(reservation.bookId);
    }

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: updatedReservation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const queue = await prisma.reservation.findMany({
      where: {
        bookId,
        status: 'pending'
      },
      include: {
        member: {
          select: { name: true, email: true, membershipId: true, status: true }
        }
      },
      orderBy: { reservedAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: queue.length,
      data: queue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get all reservations
 * Access: Librarian, Admin
 */
const getAllReservations = async (req, res) => {
  try {
    await autoExpireReservations();

    const reservations = await prisma.reservation.findMany({
      include: {
        member: { select: { name: true, email: true, membershipId: true, status: true } },
        book: { select: { title: true, author: true, coverImage: true, isbn: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  createReservation,
  getMemberReservations,
  cancelReservation,
  getReservationQueue,
  getAllReservations,
  notifyNextInQueue
};
