require('dotenv').config();
const { generateMembershipId } = require('./utils/membershipId');

async function main() {
  console.log('Testing generateMembershipId...');
  const id1 = await generateMembershipId();
  console.log('Generated ID (next should be LMS-2026-0007):', id1);
}
main().catch(e => console.error('Error:', e.message));
