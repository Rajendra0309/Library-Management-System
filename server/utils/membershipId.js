const prisma = require('../prisma/client');

/**
 * Generates a unique membership ID in the format LMS-YYYY-XXXX
 * where YYYY is the current year, and XXXX is a zero-padded sequence number.
 * 
 * @returns {Promise<string>} The generated membership ID
 */
async function generateMembershipId() {
  const currentYear = new Date().getFullYear();
  
  // Count how many users have a membership ID starting with LMS-YYYY
  const count = await prisma.user.count({
    where: {
      membershipId: {
        startsWith: `LMS-${currentYear}-`
      }
    }
  });
  
  // Increment count and pad to 4 digits
  const sequenceStr = String(count + 1).padStart(4, '0');
  
  return `LMS-${currentYear}-${sequenceStr}`;
}

module.exports = { generateMembershipId };
