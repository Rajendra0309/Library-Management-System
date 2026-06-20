const prisma = require('../prisma/client');

/**
 * Generates a unique membership ID in the format LMS-YYYY-XXXX
 * where YYYY is the current year, and XXXX is a zero-padded sequence number.
 * Uses the MAX existing sequence to avoid collisions when there are gaps.
 * 
 * @returns {Promise<string>} The generated membership ID
 */
async function generateMembershipId() {
  const currentYear = new Date().getFullYear();
  const prefix = `LMS-${currentYear}-`;

  // Fetch all IDs for the current year to find the highest sequence number
  const existingMembers = await prisma.user.findMany({
    where: {
      membershipId: { startsWith: prefix }
    },
    select: { membershipId: true }
  });

  let maxSeq = 0;
  for (const m of existingMembers) {
    const seqPart = parseInt(m.membershipId.replace(prefix, ''), 10);
    if (!isNaN(seqPart) && seqPart > maxSeq) {
      maxSeq = seqPart;
    }
  }

  const nextSeq = maxSeq + 1;
  const sequenceStr = String(nextSeq).padStart(4, '0');

  return `${prefix}${sequenceStr}`;
}

module.exports = { generateMembershipId };
