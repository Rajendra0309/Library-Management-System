import api from '../api/axios';

/**
 * Fetch aggregated statistics for the dashboard
 * Requires admin or librarian role
 */
export const getDashboardData = async () => {
    try {
        const response = await api.get('/reports/dashboard');
        return response.data;
    } catch (error) {
        throw error;
    }
};
