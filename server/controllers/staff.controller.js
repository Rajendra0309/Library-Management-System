const prisma = require('../prisma/client');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all staff (admin and librarian roles)
 * @route   GET /api/staff
 * @access  Admin only
 */
const getStaff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const where = {
      role: { in: ['admin', 'librarian'] },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
          { employeeId: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [total, staff] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          department: true,
          employeeId: true,
          status: true,
          profileImage: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Staff list fetched successfully.',
      count: staff.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: staff
    });
  } catch (error) {
    console.error('[staff.controller] getStaff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching staff.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get a single staff member by ID
 * @route   GET /api/staff/:id
 * @access  Admin only
 */
const getStaffById = async (req, res) => {
  try {
    const staff = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        role: { in: ['admin', 'librarian'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        employeeId: true,
        status: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
        error: 'Not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Staff member fetched successfully.',
      data: staff
    });
  } catch (error) {
    console.error('[staff.controller] getStaffById error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching staff member.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create a new staff member
 * @route   POST /api/staff
 * @access  Admin only
 */
const createStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array().map((e) => e.msg).join(', ')
      });
    }

    const { name, email, password, phone, role, department, employeeId } = req.body;

    // Check duplicate email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email already exists.',
        error: 'Duplicate email'
      });
    }

    // Check duplicate employeeId if provided
    if (employeeId) {
      const existingEmpId = await prisma.user.findUnique({ where: { employeeId } });
      if (existingEmpId) {
        return res.status(409).json({
          success: false,
          message: 'A staff member with this Employee ID already exists.',
          error: 'Duplicate employeeId'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: role || 'librarian',
        department: department || null,
        employeeId: employeeId || null,
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        employeeId: true,
        status: true,
        createdAt: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Staff member created successfully.',
      data: staff
    });
  } catch (error) {
    console.error('[staff.controller] createStaff error:', error);
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: `A user with this ${error.meta?.target?.join(', ')} already exists.`,
        error: 'Duplicate field'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while creating staff member.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Update a staff member's details
 * @route   PUT /api/staff/:id
 * @access  Admin only
 */
const updateStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: errors.array().map((e) => e.msg).join(', ')
      });
    }

    // Find existing staff
    const existing = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        role: { in: ['admin', 'librarian'] }
      }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
        error: 'Not found'
      });
    }

    const { name, phone, role, department, employeeId, status } = req.body;

    // Check duplicate employeeId (if changing and not own record)
    if (employeeId && employeeId !== existing.employeeId) {
      const empIdConflict = await prisma.user.findFirst({
        where: { employeeId, NOT: { id: req.params.id } }
      });
      if (empIdConflict) {
        return res.status(409).json({
          success: false,
          message: 'Another staff member with this Employee ID already exists.',
          error: 'Duplicate employeeId'
        });
      }
    }

    const updatedStaff = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(department !== undefined && { department }),
        ...(employeeId !== undefined && { employeeId }),
        ...(status && { status })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        department: true,
        employeeId: true,
        status: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Staff member updated successfully.',
      data: updatedStaff
    });
  } catch (error) {
    console.error('[staff.controller] updateStaff error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: `A user with this ${error.meta?.target?.join(', ')} already exists.`,
        error: 'Duplicate field'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error while updating staff member.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Delete a staff member
 * @route   DELETE /api/staff/:id
 * @access  Admin only
 * @rule    Admin cannot delete their own account
 */
const deleteStaff = async (req, res) => {
  try {
    // Business rule: Admin cannot delete their own account
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
        error: 'Self-deletion not allowed'
      });
    }

    const staff = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        role: { in: ['admin', 'librarian'] }
      }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found.',
        error: 'Not found'
      });
    }

    await prisma.user.delete({ where: { id: req.params.id } });

    return res.status(200).json({
      success: true,
      message: `Staff member "${staff.name}" deleted successfully.`,
      data: null
    });
  } catch (error) {
    console.error('[staff.controller] deleteStaff error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting staff member.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getStaff, getStaffById, createStaff, updateStaff, deleteStaff };
