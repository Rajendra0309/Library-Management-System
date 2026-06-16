const mongoose = require('mongoose');

/**
 * Generates a unique membership ID in the format LMS-YYYY-XXXX
 * where YYYY is the current year, and XXXX is a zero-padded sequence number.
 * Uses dynamic model loading to prevent circular dependencies.
 * 
 * @returns {Promise<string>} The generated membership ID
 */
async function generateMembershipId() {
  const currentYear = new Date().getFullYear();
  const User = mongoose.model('User');
  
  // Create a regex to match membership IDs generated in the current year
  const yearPrefixRegex = new RegExp(`^LMS-${currentYear}-\\d{4}$`);
  
  // Count how many users have a membership ID matching this year
  const count = await User.countDocuments({ membershipId: yearPrefixRegex });
  
  // Increment count and pad to 4 digits
  const sequenceStr = String(count + 1).padStart(4, '0');
  
  return `LMS-${currentYear}-${sequenceStr}`;
}

module.exports = { generateMembershipId };
