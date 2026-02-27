const API_BASE_URL =
    (typeof window !== 'undefined' && window.localStorage.getItem('apiBaseUrl')) ||
    'http://localhost:8000';

type ApiRequestOptions = RequestInit & {
    headers?: Record<string, string>;
};

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data?.message || data?.detail?.[0]?.msg || 'Request failed.');
    }

    return data as T;
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

export const authApi = {
    sendOtp: (payload: SendOtpPayload) =>
        apiRequest('/auth/otp/send', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    verifyOtp: (payload: VerifyOtpPayload) =>
        apiRequest('/auth/otp/verify', {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
};

export { API_BASE_URL };
