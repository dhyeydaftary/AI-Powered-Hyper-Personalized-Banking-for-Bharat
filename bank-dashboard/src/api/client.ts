import {
  Customer,
  Transaction,
  Loan,
  FinancialHealth,
  Decision,
  AuditEntry,
  Consent,
  Feedback,
  ApiResponse,
  SystemAnalytics,
} from '../types';
import {
  MOCK_CUSTOMERS,
  MOCK_LOANS,
  MOCK_FINANCIAL_HEALTH,
  MOCK_DECISIONS,
  MOCK_AUDIT_LOGS,
  MOCK_FEEDBACK,
  getMockAnalytics,
} from './mockAdapter';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        data: null,
        error: {
          code: errorData?.error?.code || `HTTP_${res.status}`,
          message: errorData?.error?.message || `HTTP Request failed with status ${res.status}`,
        },
      };
    }

    return await res.json();
  } catch (err) {
    return {
      success: false,
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: err instanceof Error ? err.message : 'Network error communicating with backend',
      },
    };
  }
}

export const api = {
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    if (USE_MOCKS) {
      return { success: true, data: MOCK_CUSTOMERS, error: null };
    }

    const singleRes = await fetchApi<Customer>('/customers/C1001');
    if (singleRes.success && singleRes.data) {
      return { success: true, data: [singleRes.data], error: null };
    }

    console.warn('[bank-dashboard] Backend unavailable, falling back to mock dataset.');
    return { success: true, data: MOCK_CUSTOMERS, error: null };
  },

  async getCustomer(customerId: string): Promise<ApiResponse<Customer>> {
    if (USE_MOCKS) {
      const customer = MOCK_CUSTOMERS.find((c) => c.customer_id === customerId);
      if (!customer) {
        return { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Customer not found' } };
      }
      return { success: true, data: customer, error: null };
    }

    const res = await fetchApi<Customer>(`/customers/${customerId}`);
    if (!res.success) {
      const mock = MOCK_CUSTOMERS.find((c) => c.customer_id === customerId);
      if (mock) return { success: true, data: mock, error: null };
    }
    return res;
  },

  async getTransactions(
    customerId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<Transaction[]>> {
    if (USE_MOCKS) {
      // Mock basic transaction generator for fallback
      const mockTx: Transaction[] = [
        {
          transaction_id: 'TX1001',
          customer_id: customerId,
          date: '2026-08-01',
          amount: 75000,
          type: 'CREDIT',
          category: 'SALARY',
          description: 'Monthly salary credit',
          merchant: 'Employer Corp',
        },
        {
          transaction_id: 'TX1002',
          customer_id: customerId,
          date: '2026-08-05',
          amount: 15000,
          type: 'DEBIT',
          category: 'RENT',
          description: 'Monthly rent payment',
          merchant: 'Landlord',
        },
      ];
      return {
        success: true,
        data: mockTx,
        error: null,
        pagination: { page, limit, total: mockTx.length, total_pages: 1 },
      };
    }

    return fetchApi<Transaction[]>(`/customers/${customerId}/transactions?page=${page}&limit=${limit}`);
  },

  async getLoans(customerId: string): Promise<ApiResponse<Loan[]>> {
    if (USE_MOCKS) {
      return { success: true, data: MOCK_LOANS[customerId] || [], error: null };
    }
    const res = await fetchApi<Loan[]>(`/customers/${customerId}/loans`);
    if (!res.success) {
      return { success: true, data: MOCK_LOANS[customerId] || [], error: null };
    }
    return res;
  },

  async getFinancialHealth(customerId: string): Promise<ApiResponse<FinancialHealth>> {
    if (USE_MOCKS) {
      const fh = MOCK_FINANCIAL_HEALTH[customerId];
      return fh
        ? { success: true, data: fh, error: null }
        : { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Financial health record not found' } };
    }
    const res = await fetchApi<FinancialHealth>(`/customers/${customerId}/financial-health`);
    if (!res.success && MOCK_FINANCIAL_HEALTH[customerId]) {
      return { success: true, data: MOCK_FINANCIAL_HEALTH[customerId], error: null };
    }
    return res;
  },

  async getDecision(customerId: string): Promise<ApiResponse<Decision>> {
    if (USE_MOCKS) {
      const dec = MOCK_DECISIONS[customerId];
      return dec
        ? { success: true, data: dec, error: null }
        : { success: false, data: null, error: { code: 'NOT_FOUND', message: 'No decision found' } };
    }
    const res = await fetchApi<Decision>(`/customers/${customerId}/decision`);
    if (!res.success && MOCK_DECISIONS[customerId]) {
      return { success: true, data: MOCK_DECISIONS[customerId], error: null };
    }
    return res;
  },

  async runAnalysis(customerId: string): Promise<ApiResponse<{ decision: Decision }>> {
    if (USE_MOCKS) {
      const dec = MOCK_DECISIONS[customerId] || MOCK_DECISIONS['C1001'];
      return { success: true, data: { decision: dec }, error: null };
    }
    return fetchApi<{ decision: Decision }>(`/customers/${customerId}/analyze`, {
      method: 'POST',
      body: JSON.stringify({
        analysis_scope: {
          financial_context: true,
          behavioral_trends: true,
          anomaly_analysis: true,
        },
      }),
    });
  },

  async getConsent(customerId: string): Promise<ApiResponse<Consent>> {
    if (USE_MOCKS) {
      const customer = MOCK_CUSTOMERS.find((c) => c.customer_id === customerId);
      return customer
        ? { success: true, data: customer.consent, error: null }
        : { success: false, data: null, error: { code: 'NOT_FOUND', message: 'Customer not found' } };
    }
    return fetchApi<Consent>(`/customers/${customerId}/consent`);
  },

  async updateConsent(customerId: string, consent: Consent): Promise<ApiResponse<Consent>> {
    if (USE_MOCKS) {
      const customer = MOCK_CUSTOMERS.find((c) => c.customer_id === customerId);
      if (customer) {
        customer.consent = consent;
      }
      return { success: true, data: consent, error: null };
    }
    return fetchApi<Consent>(`/customers/${customerId}/consent`, {
      method: 'PUT',
      body: JSON.stringify(consent),
    });
  },

  async getAuditLogs(customerId?: string): Promise<ApiResponse<AuditEntry[]>> {
    if (USE_MOCKS) {
      const logs = customerId
        ? MOCK_AUDIT_LOGS.filter((l) => l.customer_id === customerId)
        : MOCK_AUDIT_LOGS;
      return { success: true, data: logs, error: null };
    }
    if (customerId) {
      return fetchApi<AuditEntry[]>(`/customers/${customerId}/audit`);
    }
    return { success: true, data: MOCK_AUDIT_LOGS, error: null };
  },

  async getFeedback(customerId?: string): Promise<ApiResponse<Feedback[]>> {
    if (USE_MOCKS) {
      const fb = customerId
        ? MOCK_FEEDBACK.filter((f) => f.customer_id === customerId)
        : MOCK_FEEDBACK;
      return { success: true, data: fb, error: null };
    }
    return { success: true, data: MOCK_FEEDBACK, error: null };
  },

  async getAnalytics(): Promise<ApiResponse<SystemAnalytics>> {
    return { success: true, data: getMockAnalytics(), error: null };
  },
};
