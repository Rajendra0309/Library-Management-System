const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateMembershipId } = require('../utils/membershipId');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['admin', 'librarian', 'member'],
    default: 'member'
  },
  phone: {
    type: String,
    trim: true
  },
  membershipId: {
    type: String,
    unique: true,
    sparse: true // Allows null/missing values to avoid unique conflict on multiple admins/librarians without membership IDs
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'expired'],
    default: 'active'
  },
  profileImage: {
    type: String
  }
}, {
  timestamps: true
});

// Pre-save hook to hash password and auto-generate membershipId for members
UserSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Auto-generate membershipId if role is member and not already set
  if (this.role === 'member' && !this.membershipId) {
    try {
      this.membershipId = await generateMembershipId();
    } catch (err) {
      return next(err);
    }
  }
  
  next();
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
