import api from '../api/axios';

/**
 * Fetch a paginated and searchable list of members (role='member')
 * Access: Librarian, Admin
 * 
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Number of records per page
 * @param {string} search - Search query for name, email, or membership ID
 * @returns {Promise<Object>} API response containing members list and total counts
 */
export const getMembers = async (page = 1, limit = 10, search = '') => {
  const response = await api.get('/members', {
    params: { page, limit, search }
  });
  return response.data;
};

/**
 * Fetch detailed profile of a member
 * Access: Librarian, Admin, Self
 * 
 * @param {string} id - Member user ID
 * @returns {Promise<Object>} API response containing member details
 */
export const getMemberById = async (id) => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

/**
 * Register a new member
 * Access: Librarian, Admin
 * 
 * @param {Object} memberData - Member information (name, email, password, phone)
 * @returns {Promise<Object>} API response containing registered member info
 */
export const createMember = async (memberData) => {
  const response = await api.post('/members', memberData);
  return response.data;
};

/**
 * Update member details (name, phone, profileImage)
 * Access: Librarian, Admin, Self
 * 
 * @param {string} id - Member user ID
 * @param {Object} memberData - Fields to update
 * @returns {Promise<Object>} API response containing updated member info
 */
export const updateMember = async (id, memberData) => {
  const response = await api.put(`/members/${id}`, memberData);
  return response.data;
};

/**
 * Suspend, activate, or expire a member account
 * Access: Librarian, Admin
 * 
 * @param {string} id - Member user ID
 * @param {string} status - New status ('active' | 'suspended' | 'expired')
 * @returns {Promise<Object>} API response containing updated status information
 */
export const updateMemberStatus = async (id, status) => {
  const response = await api.put(`/members/${id}/status`, { status });
  return response.data;
};

/**
 * Fetch the borrowing history for a specific member
 * Access: Librarian, Admin, Self
 * 
 * @param {string} id - Member user ID
 * @returns {Promise<Object>} API response containing transaction records list
 */
export const getMemberHistory = async (id) => {
  const response = await api.get(`/members/${id}/history`);
  return response.data;
};
