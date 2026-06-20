/**
 * Calculates the fine amount based on the number of days overdue.
 * @param {number} daysOverdue - Number of days the book is overdue.
 * @returns {number} - Calculated fine amount.
 */
const calculateFineAmount = (daysOverdue) => {
  if (daysOverdue <= 0) return 0;
  
  const FINE_RATE_PER_DAY = 2; // Rs 2 per day
  const MAX_FINE_PER_BOOK = 500; // Rs 500 cap
  
  const calculatedFine = daysOverdue * FINE_RATE_PER_DAY;
  return Math.min(calculatedFine, MAX_FINE_PER_BOOK);
};

module.exports = {
  calculateFineAmount,
};
