import { create } from 'zustand';
import { kitchenApi } from '../services/api';
import type {
  KitchenTicket,
  KitchenTicketStatus,
  KitchenStats,
} from '../types';

interface KitchenState {
  tickets: KitchenTicket[];
  stats: KitchenStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTickets: (status?: KitchenTicketStatus) => Promise<void>;
  fetchStats: () => Promise<void>;
  updateTicketStatus: (
    ticketId: string,
    status: KitchenTicketStatus
  ) => Promise<void>;
  addTicket: (ticket: KitchenTicket) => void;
  updateTicket: (ticket: KitchenTicket) => void;
  clearError: () => void;
}

export const useKitchenStore = create<KitchenState>()((set, get) => ({
  tickets: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchTickets: async (status?: KitchenTicketStatus) => {
    set({ isLoading: true, error: null });
    try {
      const tickets = await kitchenApi.getTickets({ status });
      set({ tickets, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Erro ao buscar tickets',
        isLoading: false,
      });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await kitchenApi.getStats();
      set({ stats });
    } catch (error: any) {
      console.error('Failed to fetch kitchen stats:', error);
    }
  },

  updateTicketStatus: async (ticketId: string, status: KitchenTicketStatus) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTicket = await kitchenApi.updateTicketStatus(
        ticketId,
        status
      );

      // Atualizar ticket na lista
      set((state) => ({
        tickets: state.tickets.map((ticket) =>
          ticket.id === ticketId ? updatedTicket : ticket
        ),
        isLoading: false,
      }));

      // Atualizar stats
      get().fetchStats();
    } catch (error: any) {
      set({
        error:
          error.response?.data?.error || 'Erro ao atualizar status do ticket',
        isLoading: false,
      });
      throw error;
    }
  },

  addTicket: (ticket: KitchenTicket) => {
    set((state) => ({
      tickets: [ticket, ...state.tickets],
    }));

    // Atualizar stats
    get().fetchStats();
  },

  updateTicket: (ticket: KitchenTicket) => {
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
    }));
  },

  clearError: () => set({ error: null }),
}));
