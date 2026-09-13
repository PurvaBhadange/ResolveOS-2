const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
const API_BASE_URL = `${cleanBaseUrl}/api/v1`;

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response error' }));
    throw new Error(errorData.detail || `API request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  getCustomers: () => fetchFromAPI('/customers'),
  getCustomer: (id: number) => fetchFromAPI(`/customers/${id}`),
  getOrder: (id: number) => fetchFromAPI(`/orders/${id}`),
  getOrderByNumber: (orderNumber: string) => fetchFromAPI(`/orders/number/${orderNumber}`),
  getCustomerOrders: (customerId: number) => fetchFromAPI(`/orders/customer/${customerId}`),
  getVariantInventory: (variantId: number) => fetchFromAPI(`/inventory/variant/${variantId}`),
  getActivePolicy: (code: string) => fetchFromAPI(`/policies/active/${code}`),
  searchPolicy: (query: string) => fetchFromAPI(`/policies/search?query=${encodeURIComponent(query)}`),
  getCases: () => fetchFromAPI('/cases'),
  getCase: (id: number) => fetchFromAPI(`/cases/${id}`),
  getCaseEvents: (id: number) => fetchFromAPI(`/cases/${id}/events`),
  createCase: (data: { customer_id: number; order_id?: number; title: string; description: string; category?: string }) =>
    fetchFromAPI('/cases', { method: 'POST', body: JSON.stringify(data) }),
  runAgentOnCase: (caseId: number) => fetchFromAPI(`/cases/${caseId}/run`, { method: 'POST' }),
  getApprovals: (status = 'pending') => fetchFromAPI(`/approvals?status_filter=${status}`),
  submitApprovalDecision: (approvalId: number, decision: 'approved' | 'rejected', reason?: string) =>
    fetchFromAPI(`/approvals/${approvalId}/decision`, { method: 'POST', body: JSON.stringify({ decision, reason }) }),
  getEscalations: () => fetchFromAPI('/escalations'),
};
