const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');

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

    const where = {
      role: 'member',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { membershipId: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [total, members] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          membershipId: true,
          status: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    res.status(200).json({
      success: true,
      count: members.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: members
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const member = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'member' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        membershipId: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // For manual creation by admin, we also generate membership ID
    const { generateMembershipId } = require('../utils/membershipId');
    const newMembershipId = await generateMembershipId();

    const member = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: 'member',
        status: 'active',
        membershipId: newMembershipId
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        membershipId: true,
        status: true,
        createdAt: true
      }
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const { name, phone } = req.body;
    
    const member = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'member' }
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const updatedMember = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        membershipId: true,
        status: true,
        profileImage: true,
        updatedAt: true
      }
    });

    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const member = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'member' }
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // Check if member has active borrows before deleting
    const activeBorrows = await prisma.borrow.count({
      where: { memberId: req.params.id, status: 'active' }
    });

    if (activeBorrows > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete member. Member has active borrows.' });
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    res.status(200).json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Suspend/Activate/Expire Member
 * Access: Librarian, Admin 
 */
const updateMemberStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'librarian') {
      return res.status(403).json({ success: false, message: 'Access denied. Librarians and Admins only.' });
    }

    const { status } = req.body;
    if (!['active', 'suspended', 'expired'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be active, suspended, or expired.' });
    }

    const member = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'member' }
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const updatedMember = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        membershipId: true
      }
    });

    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const member = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'member' }
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const history = await prisma.borrow.findMany({
      where: { memberId: req.params.id },
      include: {
        book: {
          select: {
            title: true,
            author: true,
            coverImage: true,
            isbn: true
          }
        }
      },
      orderBy: { issueDate: 'desc' }
    });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
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
