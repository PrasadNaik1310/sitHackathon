import { api } from './api';

export const KycService = {
    onboard: async (aadhaar_number: string, pan_number: string, gst_number: string) => {
        const { data } = await api.post('/kyc/onboard', {
            aadhaar_number,
            pan_number,
            gst_number
        });
        return data;
    }
};
