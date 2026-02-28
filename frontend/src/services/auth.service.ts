import { api } from './api';

export const AuthService = {
    sendOTP: async (phone: string) => {
        const { data } = await api.post('/auth/otp/send', { phone });
        return data;
    },
    verifyOTP: async (phone: string, otp: string) => {
        const { data } = await api.post('/auth/otp/verify', { phone, otp, role: 'BORROWER' });
        return data;
    }
};
