const API_BASE_URL =
    (typeof window !== 'undefined' && window.localStorage.getItem('apiBaseUrl')) ||
    'http://localhost:8000';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

type ApiRequestOptions = RequestInit & {
    headers?: Record<string, string>;
    skipAuth?: boolean;
};

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const token = getAccessToken();

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(!options.skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    if (response.status === 401 && !options.skipAuth) {
        const refreshed = await tryRefreshToken();

        if (refreshed) {
            return apiRequest<T>(path, options);
        }
    }

    const data: any = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.message || data?.detail?.[0]?.msg || 'Request failed.');
    }

    return data as T;
}

function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken?: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return;

    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
}

function clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function tryRefreshToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
        const data: any = await apiRequest('/auth/token/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: refreshToken }),
            skipAuth: true,
        });

        const newAccessToken = data?.access_token || data?.accessToken;
        const newRefreshToken = data?.refresh_token || data?.refreshToken;

        if (!newAccessToken) {
            return false;
        }

        setTokens(newAccessToken, newRefreshToken);
        return true;
    } catch {
        clearTokens();
        return false;
    }
}

export type UserRole = 'BORROWER' | 'CREDIT_OFFICER' | 'ADMIN';

export interface SendOtpPayload {
    phone: string;
}

export interface VerifyOtpPayload {
    phone: string;
    otp: string;
    role?: UserRole;
}

export interface RefreshTokenPayload {
    refresh_token: string;
}

export interface BusinessProfileResponse {
    id: string;
    user_id: string;
    gst_number: string;
    pan_number: string;
    created_at: string;
}

export type RiskGrade = 'A' | 'B' | 'C';

export interface CreditScoreResponse {
    id: string;
    business_id: string;
    external_score: number;
    internal_score: number;
    final_score: number;
    risk_grade: RiskGrade;
    created_at: string;
}

export type InvoiceStatus = 'UNPAID' | 'OFFER_GENERATED' | 'FINANCED' | 'REPAID' | 'DEFAULTED';

export interface InvoiceResponse {
    id: string;
    business_id: string;
    invoice_number: string;
    amount: number;
    due_date: string;
    delay_days: number;
    status: InvoiceStatus;
    created_at: string;
}

export interface AddInvoicePayload {
    invoice_number: string;
    amount: number;
    due_date: string;
    delay_days?: number;
}

export interface GenerateOfferPayload {
    invoice_id: string;
}

export interface OfferResponse {
    id?: string;
    offer_id?: string;
    [key: string]: any;
}

export interface SanctionLoanPayload {
    offer_id: string;
    asset_description?: string | null;
    asset_value?: number | null;
}

export interface LoanResponse {
    id?: string;
    loan_id?: string;
    principal_amount?: number;
    outstanding_amount?: number;
    amount_repaid?: number;
    interest_rate?: number;
    tenure_months?: number;
    status?: string;
    [key: string]: any;
}

export interface EmiResponse {
    id?: string;
    emi_id?: string;
    amount?: number;
    due_date?: string;
    status?: string;
    paid_amount?: number;
    [key: string]: any;
}

export interface KycOnboardPayload {
    aadhaar_number: string;
    pan_number: string;
    gst_number: string;
}

export const authApi = {
    sendOtp: (payload: SendOtpPayload) =>
        apiRequest('/auth/otp/send', {
            method: 'POST',
            body: JSON.stringify(payload),
            skipAuth: true,
        }),

    verifyOtp: (payload: VerifyOtpPayload) =>
        apiRequest('/auth/otp/verify', {
            method: 'POST',
            body: JSON.stringify(payload),
            skipAuth: true,
        }),

    refreshToken: (payload: RefreshTokenPayload) =>
        apiRequest('/auth/token/refresh', {
            method: 'POST',
            body: JSON.stringify(payload),
            skipAuth: true,
        }),
};

export const authStorage = {
    getAccessToken,
    getRefreshToken,
    setTokens,
    clearTokens,
};

export const businessesApi = {
    getMyBusiness: () => apiRequest<BusinessProfileResponse>('/businesses/me'),
    getCreditScore: () => apiRequest<CreditScoreResponse>('/businesses/me/credit-score'),
    recalculateCreditScore: () =>
        apiRequest<CreditScoreResponse>('/businesses/me/credit-score/recalculate', {
            method: 'POST',
        }),
};

export const invoicesApi = {
    listMyInvoices: (status?: InvoiceStatus) =>
        apiRequest<InvoiceResponse[]>(`/invoices/my${status ? `?status=${status}` : ''}`),

    getInvoice: (invoiceId: string) => apiRequest<InvoiceResponse>(`/invoices/${invoiceId}`),

    addInvoice: (payload: AddInvoicePayload) =>
        apiRequest<InvoiceResponse>('/invoices/add', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
};

export const offersApi = {
    generate: (payload: GenerateOfferPayload) =>
        apiRequest<any>('/offers/generate', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    listForInvoice: (invoiceId: string) =>
        apiRequest<OfferResponse[] | { offers?: OfferResponse[] } | OfferResponse>(
            `/offers/invoice/${invoiceId}`,
        ),
};

export const loansApi = {
    sanction: (payload: SanctionLoanPayload) =>
        apiRequest<LoanResponse>('/loans/sanction', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    getLoan: (loanId: string) => apiRequest<LoanResponse>(`/loans/${loanId}`),
};

export const repaymentsApi = {
    listEmis: (loanId: string) => apiRequest<EmiResponse[] | { emis?: EmiResponse[] }>(`/repayments/loan/${loanId}/emis`),

    payEmi: (emiId: string) =>
        apiRequest(`/repayments/emi/${emiId}/pay`, {
            method: 'POST',
        }),

    bounceEmi: (emiId: string) =>
        apiRequest(`/repayments/emi/${emiId}/bounce`, {
            method: 'POST',
        }),
};

export const kycApi = {
    onboard: (payload: KycOnboardPayload) =>
        apiRequest('/kyc/onboard', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
};

export { API_BASE_URL };
