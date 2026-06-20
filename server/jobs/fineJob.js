const cron = require('node-cron');
const prisma = require('../prisma/client');
const { calculateFineAmount } = require('../utils/fineCalculator');

/**
 * Scheduled job to calculate fines for overdue active borrows.
 * Runs every day at midnight (00:00).
 */
const startFineJob = () => {
    // CRON schedule: 0 0 * * * (At 00:00 every day)
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily fine calculation job...');

        try {
            const today = new Date();

            // 1. Find all active borrows that are overdue
            const overdueBorrows = await prisma.borrow.findMany({
                where: {
                    status: 'active',
                    dueDate: { lt: today }
                }
            });

            console.log(`Found ${overdueBorrows.length} overdue borrows.`);

            for (const borrow of overdueBorrows) {
                // Calculate days overdue
                const diffInTime = today.getTime() - new Date(borrow.dueDate).getTime();
                const daysOverdue = Math.ceil(diffInTime / (1000 * 3600 * 24));

                if (daysOverdue > 0) {
                    const fineAmount = calculateFineAmount(daysOverdue);

                    // Check if a fine already exists for this borrow
                    const existingFine = await prisma.fine.findFirst({
                        where: {
                            borrowId: borrow.id,
                            status: 'pending'
                        }
                    });

                    if (existingFine) {
                        // Update existing fine
                        await prisma.fine.update({
                            where: { id: existingFine.id },
                            data: {
                                amount: fineAmount,
                                daysOverdue: daysOverdue
                            }
                        });
                        console.log(`Updated fine for borrow ID: ${borrow.id} (Amount: Rs ${fineAmount})`);
                    } else {
                        // Create new fine
                        await prisma.fine.create({
                            data: {
                                amount: fineAmount,
                                daysOverdue: daysOverdue,
                                memberId: borrow.memberId,
                                borrowId: borrow.id,
                                status: 'pending'
                            }
                        });
                        console.log(`Created fine for borrow ID: ${borrow.id} (Amount: Rs ${fineAmount})`);
                    }
                }
            }

            console.log('Daily fine calculation job completed successfully.');
        } catch (error) {
            console.error('Error in daily fine calculation job:', error);
        }
    });

    console.log('Fine calculation job scheduled (00:00 daily).');
};

module.exports = startFineJob;
