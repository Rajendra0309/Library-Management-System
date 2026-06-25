const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get global config
exports.getConfig = async (req, res) => {
  try {
    let config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
    if (!config) {
      config = await prisma.systemConfig.create({ data: { id: 'global' } });
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update global config
exports.updateConfig = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can update library configuration.' });
    }

    const { loanPeriod, maxBorrows, fineRate, reservationExpiry, autoRenew, preDueReminders, enforceFineCaps } = req.body;

    const config = await prisma.systemConfig.upsert({
      where: { id: 'global' },
      update: {
        loanPeriod: loanPeriod !== undefined ? parseInt(loanPeriod) : undefined,
        maxBorrows: maxBorrows !== undefined ? parseInt(maxBorrows) : undefined,
        fineRate: fineRate !== undefined ? parseFloat(fineRate) : undefined,
        reservationExpiry: reservationExpiry !== undefined ? parseInt(reservationExpiry) : undefined,
        autoRenew: autoRenew !== undefined ? Boolean(autoRenew) : undefined,
        preDueReminders: preDueReminders !== undefined ? Boolean(preDueReminders) : undefined,
        enforceFineCaps: enforceFineCaps !== undefined ? Boolean(enforceFineCaps) : undefined,
      },
      create: {
        id: 'global',
        loanPeriod: parseInt(loanPeriod) || 14,
        maxBorrows: parseInt(maxBorrows) || 5,
        fineRate: parseFloat(fineRate) || 0.25,
        reservationExpiry: parseInt(reservationExpiry) || 48,
        autoRenew: autoRenew !== undefined ? Boolean(autoRenew) : true,
        preDueReminders: preDueReminders !== undefined ? Boolean(preDueReminders) : true,
        enforceFineCaps: enforceFineCaps !== undefined ? Boolean(enforceFineCaps) : false,
      }
    });

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
