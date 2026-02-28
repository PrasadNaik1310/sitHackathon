import { api } from './api';

export const LoanService = {
    getOfferForInvoice: async (invoiceId: string) => {
        try {
            // Try to generate a new offer
            const { data } = await api.post('/offers/generate', { invoice_id: invoiceId });
            return data.offers[0]; // Assuming we get the top offer
        } catch (error: any) {
            // If it's already generated (409 Conflict), fetch the existing ones
            if (error.response?.status === 409) {
                const { data } = await api.get(`/offers/invoice/${invoiceId}`);
                if (data.offers && data.offers.length > 0) {
                    return data.offers[0];
                }
            }
            throw error; // Re-throw if it's a different error or no offers found
        }
    },

    acceptOffer: async (offerId: string) => {
        // Convert an accepted offer into an active loan
        const { data } = await api.post('/loans/sanction', { offer_id: offerId });
        return data;
    },

    getMyLoans: async () => {
        const { data } = await api.get('/loans/user/my');
        return data.loans || [];
    },

    getMyOffers: async () => {
        const { data } = await api.get('/offers/user/my');
        return data.offers || [];
    }
};
