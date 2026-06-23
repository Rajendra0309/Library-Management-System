import api from '../api/axios';

export const issueBook = async (memberId, bookId) => {
    const response = await api.post('/borrow/issue', { memberId, bookId });
    return response.data;
};

export const returnBook = async (id) => {
    const response = await api.post(`/borrow/return/${id}`);
    return response.data;
};

export const renewBook = async (id) => {
    const response = await api.put(`/borrow/renew/${id}`);
    return response.data;
};

export const getActiveBorrows = async () => {
    const response = await api.get('/borrow/active');
    return response.data;
};

export const getOverdueBorrows = async () => {
    const response = await api.get('/borrow/overdue');
    return response.data;
};

export const getBorrowHistory = async (memberId) => {
    const response = await api.get(`/borrow/history/${memberId}`);
    return response.data;
};
