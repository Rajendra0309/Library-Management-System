import api from '../api/axios';

/**
 * Place a book reservation hold
 * Access: Authenticated User (Self), Librarian, Admin
 * 
 * @param {string} bookId - Book ID to reserve
 * @param {string} [memberId] - Optional member ID (defaults to logged-in user inside backend if not passed)
 * @returns {Promise<Object>} API response containing created reservation info
 */
export const createReservation = async (bookId, memberId = '') => {
  const payload = { bookId };
  if (memberId) {
    payload.memberId = memberId;
  }
  const response = await api.post('/reservations', payload);
  return response.data;
};

/**
 * Fetch all reservations for a specific library member
 * Access: Librarian, Admin, Self
 * 
 * @param {string} memberId - Member user ID
 * @returns {Promise<Object>} API response containing member's reservations
 */
export const getMemberReservations = async (memberId) => {
  const response = await api.get(`/reservations/${memberId}`);
  return response.data;
};

/**
 * Cancel an active book reservation hold
 * Access: Librarian, Admin, Self
 * 
 * @param {string} id - Reservation document ID
 * @returns {Promise<Object>} API response containing cancelled reservation info
 */
export const cancelReservation = async (id) => {
  const response = await api.delete(`/reservations/${id}`);
  return response.data;
};

/**
 * Fetch reservation queue for a specific book
 * Access: Librarian, Admin
 * 
 * @param {string} bookId - Book ID
 * @returns {Promise<Object>} API response containing reservations list sorted by creation date
 */
export const getReservationQueue = async (bookId) => {
  const response = await api.get(`/reservations/book/${bookId}`);
  return response.data;
};

/**
 * Fetch all reservations across the library
 * Access: Librarian, Admin
 * 
 * @returns {Promise<Object>} API response containing all reservations
 */
export const getAllReservations = async () => {
  const response = await api.get('/reservations');
  return response.data;
};
