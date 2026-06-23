import api from '../api/axios';

export const getFines = async (status = '') => {
    const response = await api.get(`/fines${status ? `?status=${status}` : ''}`);
    return response.data;
};

export const getFineSummary = async () => {
    const response = await api.get('/fines/summary');
    return response.data;
};

export const getMemberFines = async (memberId) => {
    const response = await api.get(`/fines/${memberId}`);
    return response.data;
};

export const payFine = async (id) => {
    const response = await api.put(`/fines/pay/${id}`);
    return response.data;
};

export const waiveFine = async (id, reason) => {
    const response = await api.put(`/fines/waive/${id}`, { reason });
    return response.data;
};
