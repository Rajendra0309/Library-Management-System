const prisma = require('../prisma/client');

async function main() {
  const updated = await prisma.user.update({
    where: { email: 'admin@test.com' },
    data: {
      role: 'admin',
      employeeId: 'EMP-ADMIN-002',
      department: 'Systems Operations'
    }
  });
  console.log('Role updated:', updated.role, '| EmployeeId:', updated.employeeId);
  await prisma.$disconnect();
}

main().catch(console.error);
