import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  ApiError,
  AuthResponse,
  User,
  Product,
  Order,
  CreateOrderRequest,
  MarkPaidRequest,
  DailyReport,
  PeriodReport,
  EstablishmentDetails,
  UserDetails,
  UserRole,
  CreateEstablishmentRequest,
  UpdateEstablishmentRequest,
  CreateUserRequest,
  UpdateUserRequest,
  CreateUserRoleRequest,
  UpdateUserRoleRequest,
  PaginationParams,
  PaginatedResponse,
} from '../types';

// Auto-detect API URL based on current host (for mobile access)
const getApiUrl = () => {
  // If explicitly set in .env, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Otherwise, use same host as frontend with backend port
  const hostname = window.location.hostname;
  return `http://${hostname}:3000`;
};

const API_URL = getApiUrl();

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('apay_token');
    const establishmentId = localStorage.getItem('apay_establishment_id');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (establishmentId) {
      config.headers['x-establishment-id'] = establishmentId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('apay_token');
      localStorage.removeItem('apay_user');
      localStorage.removeItem('apay_establishment_id');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors (offline)
    if (!error.response && error.message === 'Network Error') {
      console.log('[API] Network error detected, adding to retry queue');

      // Only queue POST, PATCH, PUT, DELETE requests (not GET)
      const config = error.config;
      if (
        config &&
        ['post', 'patch', 'put', 'delete'].includes(config.method?.toLowerCase() || '')
      ) {
        const { retryQueue } = await import('./retryQueue');

        retryQueue.add({
          url: config.url || '',
          method: config.method || 'post',
          data: config.data,
          headers: config.headers as any,
        });

        // Show user-friendly error
        error.message =
          'Sem conexão. A operação será executada quando você voltar online.';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
    });
    return response.data.data;
  },

  verifyToken: async (token: string): Promise<{ user: User }> => {
    const response = await api.post<ApiResponse<{ user: User }>>(
      '/auth/verify',
      { token }
    );
    return response.data.data;
  },

  me: async (): Promise<{ user: User }> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data;
  },
};

// Products API
export const productsApi = {
  getProducts: async (params?: { active?: boolean; search?: string }): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products', {
      params,
    });
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },
};

// Orders API
export const ordersApi = {
  getOrders: async (params?: {
    status?: 'open' | 'closed' | 'canceled';
    paymentStatus?: 'paid' | 'unpaid' | 'partial';
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/orders', {
      params,
    });
    return response.data.data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data.data;
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data.data;
  },

  markAsPaid: async (id: string, data: MarkPaidRequest): Promise<Order> => {
    const response = await api.patch<ApiResponse<Order>>(
      `/orders/${id}/pay`,
      data
    );
    return response.data.data;
  },

  updateStatus: async (
    id: string,
    status: 'open' | 'closed' | 'canceled'
  ): Promise<Order> => {
    const response = await api.patch<ApiResponse<Order>>(
      `/orders/${id}/status`,
      { status }
    );
    return response.data.data;
  },
};

// Kitchen API
export const kitchenApi = {
  getTickets: async (params?: {
    status?: 'queue' | 'preparing' | 'ready' | 'delivered';
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<import('../types').KitchenTicket[]> => {
    const response = await api.get<
      ApiResponse<import('../types').KitchenTicket[]>
    >('/kitchen/tickets', {
      params,
    });
    return response.data.data;
  },

  getTicketById: async (
    id: string
  ): Promise<import('../types').KitchenTicket> => {
    const response = await api.get<
      ApiResponse<import('../types').KitchenTicket>
    >(`/kitchen/tickets/${id}`);
    return response.data.data;
  },

  updateTicketStatus: async (
    id: string,
    status: import('../types').KitchenTicketStatus
  ): Promise<import('../types').KitchenTicket> => {
    const response = await api.patch<
      ApiResponse<import('../types').KitchenTicket>
    >(`/kitchen/tickets/${id}`, { status });
    return response.data.data;
  },

  getStats: async (): Promise<import('../types').KitchenStats> => {
    const response = await api.get<
      ApiResponse<import('../types').KitchenStats>
    >('/kitchen/tickets/stats');
    return response.data.data;
  },
};

// Reports API
export const reportsApi = {
  getDailyReport: async (date?: string): Promise<DailyReport> => {
    const response = await api.get<ApiResponse<DailyReport>>('/reports/daily', {
      params: { date },
    });
    return response.data.data;
  },

  getPeriodReport: async (params: {
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<PeriodReport> => {
    const response = await api.get<ApiResponse<PeriodReport>>('/reports/period', {
      params,
    });
    return response.data.data;
  },

  exportData: async (params: {
    startDate: string;
    endDate: string;
    format?: 'csv' | 'json';
  }): Promise<Blob> => {
    const response = await api.get('/reports/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

// Admin API
export const adminApi = {
  // Establishments
  listEstablishments: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<EstablishmentDetails>> => {
    const response = await api.get<PaginatedResponse<EstablishmentDetails>>(
      '/admin/establishments',
      { params }
    );
    return response.data;
  },

  getEstablishment: async (id: string): Promise<EstablishmentDetails> => {
    const response = await api.get<ApiResponse<EstablishmentDetails>>(
      `/admin/establishments/${id}`
    );
    return response.data.data;
  },

  createEstablishment: async (
    data: CreateEstablishmentRequest
  ): Promise<EstablishmentDetails> => {
    const response = await api.post<ApiResponse<EstablishmentDetails>>(
      '/admin/establishments',
      data
    );
    return response.data.data;
  },

  updateEstablishment: async (
    id: string,
    data: UpdateEstablishmentRequest
  ): Promise<EstablishmentDetails> => {
    const response = await api.patch<ApiResponse<EstablishmentDetails>>(
      `/admin/establishments/${id}`,
      data
    );
    return response.data.data;
  },

  deleteEstablishment: async (id: string): Promise<void> => {
    await api.delete(`/admin/establishments/${id}`);
  },

  // Users
  listUsers: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<UserDetails>> => {
    const response = await api.get<PaginatedResponse<UserDetails>>('/admin/users', {
      params,
    });
    return response.data;
  },

  getUser: async (id: string): Promise<UserDetails> => {
    const response = await api.get<ApiResponse<UserDetails>>(`/admin/users/${id}`);
    return response.data.data;
  },

  createUser: async (data: CreateUserRequest): Promise<UserDetails> => {
    const response = await api.post<ApiResponse<UserDetails>>('/admin/users', data);
    return response.data.data;
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<UserDetails> => {
    const response = await api.patch<ApiResponse<UserDetails>>(
      `/admin/users/${id}`,
      data
    );
    return response.data.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  // User Roles
  createUserRole: async (data: CreateUserRoleRequest): Promise<UserRole> => {
    const response = await api.post<ApiResponse<UserRole>>(
      '/admin/user-roles',
      data
    );
    return response.data.data;
  },

  updateUserRole: async (
    id: string,
    data: UpdateUserRoleRequest
  ): Promise<UserRole> => {
    const response = await api.patch<ApiResponse<UserRole>>(
      `/admin/user-roles/${id}`,
      data
    );
    return response.data.data;
  },

  deleteUserRole: async (id: string): Promise<void> => {
    await api.delete(`/admin/user-roles/${id}`);
  },
};

export default api;
