import { create } from 'zustand';
import { ordersApi, productsApi } from '../services/api';
import type {
  Order,
  Product,
  CreateOrderRequest,
  MarkPaidRequest,
} from '../types';

interface OrderState {
  orders: Order[];
  products: Product[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: (params?: {
    status?: 'open' | 'closed' | 'canceled';
    paymentStatus?: 'paid' | 'unpaid' | 'partial';
  }) => Promise<void>;
  fetchProducts: () => Promise<void>;
  createOrder: (data: CreateOrderRequest) => Promise<Order>;
  markAsPaid: (orderId: string, data: MarkPaidRequest) => Promise<Order>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  products: [],
  isLoading: false,
  error: null,

  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const orders = await ordersApi.getOrders(params);
      set({ orders, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erro ao buscar comandas',
        isLoading: false,
      });
    }
  },

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await productsApi.getProducts({ active: true });
      set({ products, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erro ao buscar produtos',
        isLoading: false,
      });
    }
  },

  createOrder: async (data: CreateOrderRequest) => {
    set({ isLoading: true, error: null });
    try {
      const order = await ordersApi.createOrder(data);

      // Atualizar lista de orders
      set((state) => ({
        orders: [order, ...state.orders],
        isLoading: false,
      }));

      return order;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erro ao criar comanda',
        isLoading: false,
      });
      throw error;
    }
  },

  markAsPaid: async (orderId: string, data: MarkPaidRequest) => {
    set({ isLoading: true, error: null });
    try {
      const updatedOrder = await ordersApi.markAsPaid(orderId, data);

      // Atualizar order na lista
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? updatedOrder : order
        ),
        isLoading: false,
      }));

      return updatedOrder;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erro ao marcar como pago',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
