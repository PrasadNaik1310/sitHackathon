import { api } from './api';

export const InvoiceService = {
    getMyInvoices: async (status?: string) => {
        // Only fetch pending and verified invoices, discounted means already loaned
        const query = status ? `?status=${status}` : '';
        const { data } = await api.get(`/invoices/my${query}`);
        return data;
    },

    // Method used for Sandbox uploading
    addInvoice: async (invoice_number: string, amount: number, due_date: string) => {
        const { data } = await api.post('/invoices/add', {
            invoice_number,
            amount,
            due_date
        });
        return data;
    }
};
