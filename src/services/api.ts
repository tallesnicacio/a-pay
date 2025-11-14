import { apiClient } from '@/lib/api-client';

// Establishments
export const establishmentsApi = {
  getAll: async () => {
    return apiClient.get<any[]>('/establishments');
  },

  getById: async (id: string) => {
    return apiClient.get<any>(`/establishments/${id}`);
  },
};

// Products
export const productsApi = {
  getByEstablishment: async (establishmentId: string) => {
    return apiClient.get<any[]>(`/products?establishment_id=${establishmentId}`);
  },

  getActive: async (establishmentId: string) => {
    return apiClient.get<any[]>(`/products?establishment_id=${establishmentId}&active=true`);
  },

  create: async (product: any) => {
    return apiClient.post<any>('/products', product);
  },

  update: async (id: string, product: any) => {
    return apiClient.put<any>(`/products/${id}`, product);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/products/${id}`);
  },

  toggleActive: async (id: string, active: boolean) => {
    return apiClient.put<any>(`/products/${id}`, { active });
  },
};

// Orders
export const ordersApi = {
  getByEstablishment: async (establishmentId: string, status?: string) => {
    let url = `/orders?establishment_id=${establishmentId}`;
    if (status) {
      url += `&status=${status}`;
    }
    return apiClient.get<any[]>(url);
  },

  getById: async (id: string) => {
    return apiClient.get<any>(`/orders/${id}`);
  },

  create: async (order: any) => {
    return apiClient.post<any>('/orders', order);
  },

  update: async (id: string, order: any) => {
    return apiClient.put<any>(`/orders/${id}`, order);
  },

  close: async (id: string) => {
    return apiClient.post<any>(`/orders/${id}/close`);
  },

  cancel: async (id: string) => {
    return apiClient.post<any>(`/orders/${id}/cancel`);
  },
};

// Order Items (criados junto com o pedido)
export const orderItemsApi = {
  create: async (item: any) => {
    throw new Error('Items are created with the order');
  },
  createMany: async (items: any[]) => {
    throw new Error('Items are created with the order');
  },
};

// Kitchen Tickets
export const kitchenTicketsApi = {
  getByEstablishment: async (establishmentId: string, status?: string) => {
    let url = `/kitchen/tickets?establishment_id=${establishmentId}`;
    if (status) {
      url += `&status=${status}`;
    }
    return apiClient.get<any[]>(url);
  },

  updateStatus: async (id: string, status: string) => {
    return apiClient.put<any>(`/kitchen/tickets/${id}/status`, { status });
  },
};

// Payments
export const paymentsApi = {
  getByOrder: async (orderId: string) => {
    return apiClient.get<any[]>(`/payments/order/${orderId}`);
  },

  create: async (payment: any) => {
    return apiClient.post<any>('/payments', payment);
  },
};

// User Roles
export const userRolesApi = {
  getByUser: async (userId: string) => {
    return apiClient.get<any[]>('/auth/roles');
  },
};

// Analytics
export const analyticsApi = {
  getDashboardMetrics: async (establishmentId: string, startDate?: string, endDate?: string) => {
    let url = `/analytics/dashboard?establishment_id=${establishmentId}`;
    if (startDate) {
      url += `&start_date=${startDate}`;
    }
    if (endDate) {
      url += `&end_date=${endDate}`;
    }
    return apiClient.get<any>(url);
  },
};
