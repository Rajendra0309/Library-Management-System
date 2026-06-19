const prisma = require('../prisma/client');

async function main() {
  const updated = await prisma.user.update({
    where: { email: 'jane@lib.com' },
    data: { status: 'suspended' }
  });
  console.log('Status set to:', updated.status);
  await prisma.$disconnect();
}

main().catch(console.error);
