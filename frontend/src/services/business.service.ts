import { api } from './api';

export const BusinessService = {
    getProfile: async () => {
        const { data } = await api.get('/businesses/me');
        return data;
    },
    getDashboard: async () => {
        const { data } = await api.get('/businesses/me/dashboard');
        return data;
    },
    getCreditScore: async () => {
        const { data } = await api.get('/businesses/me/credit-score');
        return data;
    },
    recalculateCreditScore: async () => {
        const { data } = await api.post('/businesses/me/credit-score/recalculate');
        return data;
    }
};
