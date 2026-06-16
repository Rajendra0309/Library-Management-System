const mongoose = require('mongoose');
const User = require('../models/User');

// Helper to lazily load Borrow and Book models for history population
const getBorrowModel = () => {
  if (mongoose.models.Borrow) {
    return mongoose.models.Borrow;
  }
  return mongoose.model('Borrow', new mongoose.Schema({
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    issueDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: { type: String, enum: ['active', 'returned', 'overdue'], default: 'active' },
    renewalCount: { type: Number, default: 0 }
  }, { timestamps: true, collection: 'borrows' }));
};

const getBookModel = () => {
  if (mongoose.models.Book) {
    return mongoose.models.Book;
  }
  return mongoose.model('Book', new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: { type: String },
    isbn: { type: String, required: true }
  }, { timestamps: true, collection: 'books' }));
};

/**
 * Get all members (Paginated, Searchable)
 * Access: Librarian, Admin
 */
const getMembers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = { role: 'member' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { membershipId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const members = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: members.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: members
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get single member details
 * Access: Librarian, Admin, Self
 */
const getMemberById = async (req, res) => {
  try {
    // Protect: Members can only see their own details
    if (req.user.role === 'member' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own profile.' });
    }

    const member = await User.findOne({ _id: req.params.id, role: 'member' }).select('-password');
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create a new member (Self registration is normally handled in Auth, this is for Librarian/Admin creation)
 * Access: Librarian, Admin
 */
const createMember = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const member = new User({
      name,
      email,
      password, // Pre-save hook will hash this
      phone,
      role: 'member',
      status: 'active'
    });

    await member.save();

    const responseData = member.toObject();
    delete responseData.password;

    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update member details
 * Access: Librarian, Admin, Self (restricted fields)
 */
const updateMember = async (req, res) => {
  try {
    if (req.user.role === 'member' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only update your own profile.' });
    }

    const { name, phone, profileImage } = req.body;
    
    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Apply updates
    if (name) member.name = name;
    if (phone) member.phone = phone;
    if (profileImage) member.profileImage = profileImage;

    await member.save();

    const responseData = member.toObject();
    delete responseData.password;

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete a member
 * Access: Admin only
 */
const deleteMember = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }

    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Check if member has active borrows before deleting
    const Borrow = getBorrowModel();
    const activeBorrows = await Borrow.countDocuments({ memberId: req.params.id, status: 'active' });
    if (activeBorrows > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete member. Member has active borrows.' });
    }

    await member.deleteOne();

    res.status(200).json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Suspend/Activate/Expire Member
 * Access: Librarian, Admin (only Admin can waive/suspend according to some sections, but PRD says librarian/admin can edit members)
 */
const updateMemberStatus = async (req, res) => {
  try {
    // Only Admin or Librarian can change status
    if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
      return res.status(403).json({ success: false, message: 'Access denied. Librarians and Admins only.' });
    }

    const { status } = req.body;
    if (!['active', 'suspended', 'expired'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active, suspended, or expired.' });
    }

    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    member.status = status;
    await member.save();

    const responseData = member.toObject();
    delete responseData.password;

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get borrowing history for a member
 * Access: Librarian, Admin, Self
 */
const getMemberHistory = async (req, res) => {
  try {
    if (req.user.role === 'member' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view your own history.' });
    }

    const member = await User.findOne({ _id: req.params.id, role: 'member' });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const Borrow = getBorrowModel();
    getBookModel(); // load model definition

    const history = await Borrow.find({ memberId: req.params.id })
      .populate('bookId', 'title author coverImage isbn')
      .sort({ issueDate: -1 });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  updateMemberStatus,
  getMemberHistory
};
