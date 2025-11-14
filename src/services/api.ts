import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];

// Establishments
export const establishmentsApi = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('establishments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('establishments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  create: async (establishment: Tables['establishments']['Insert']) => {
    const { data, error } = await supabase
      .from('establishments')
      .insert(establishment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, establishment: Tables['establishments']['Update']) => {
    const { data, error } = await supabase
      .from('establishments')
      .update(establishment)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Products
export const productsApi = {
  getByEstablishment: async (establishmentId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('establishment_id', establishmentId)
      .order('name');

    if (error) throw error;
    return data;
  },

  getActive: async (establishmentId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('establishment_id', establishmentId)
      .eq('active', true)
      .order('name');

    if (error) throw error;
    return data;
  },

  create: async (product: Tables['products']['Insert']) => {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, product: Tables['products']['Update']) => {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  toggleActive: async (id: string, active: boolean) => {
    const { data, error } = await supabase
      .from('products')
      .update({ active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Orders
export const ordersApi = {
  getByEstablishment: async (establishmentId: string, status?: Enums['order_status']) => {
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        )
      `)
      .eq('establishment_id', establishmentId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        ),
        payments (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  create: async (order: Tables['orders']['Insert']) => {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, order: Tables['orders']['Update']) => {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  close: async (id: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'closed' as Enums['order_status'],
        closed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  cancel: async (id: string) => {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'canceled' as Enums['order_status'],
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Order Items
export const orderItemsApi = {
  create: async (item: Tables['order_items']['Insert']) => {
    const { data, error } = await supabase
      .from('order_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  createMany: async (items: Tables['order_items']['Insert'][]) => {
    const { data, error } = await supabase
      .from('order_items')
      .insert(items)
      .select();

    if (error) throw error;
    return data;
  },

  update: async (id: string, item: Tables['order_items']['Update']) => {
    const { data, error } = await supabase
      .from('order_items')
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('order_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Kitchen Tickets
export const kitchenTicketsApi = {
  getByEstablishment: async (establishmentId: string, status?: Enums['kitchen_status']) => {
    let query = supabase
      .from('kitchen_tickets')
      .select(`
        *,
        orders (
          *,
          order_items (
            *,
            products (*)
          )
        )
      `)
      .eq('establishment_id', establishmentId)
      .order('created_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  },

  create: async (ticket: Tables['kitchen_tickets']['Insert']) => {
    const { data, error } = await supabase
      .from('kitchen_tickets')
      .insert(ticket)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateStatus: async (id: string, status: Enums['kitchen_status']) => {
    const updates: Tables['kitchen_tickets']['Update'] = { status };

    // Set timestamps based on status
    const now = new Date().toISOString();
    if (status === 'preparing') {
      updates.started_at = now;
    } else if (status === 'ready') {
      updates.ready_at = now;
    } else if (status === 'delivered') {
      updates.delivered_at = now;
    }

    const { data, error } = await supabase
      .from('kitchen_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// Payments
export const paymentsApi = {
  getByOrder: async (orderId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .order('received_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  create: async (payment: Tables['payments']['Insert']) => {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// User Roles
export const userRolesApi = {
  getByUser: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        establishments (*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  getByEstablishment: async (establishmentId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        *,
        profiles (*)
      `)
      .eq('establishment_id', establishmentId);

    if (error) throw error;
    return data;
  },

  create: async (role: Tables['user_roles']['Insert']) => {
    const { data, error } = await supabase
      .from('user_roles')
      .insert(role)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Dashboard / Analytics
export const analyticsApi = {
  getDashboardMetrics: async (establishmentId: string, startDate?: string, endDate?: string) => {
    // Get orders in date range
    let query = supabase
      .from('orders')
      .select('*')
      .eq('establishment_id', establishmentId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    // Calculate metrics
    const totalOrders = orders.length;
    const openOrders = orders.filter(o => o.status === 'open').length;
    const closedOrders = orders.filter(o => o.status === 'closed').length;
    const totalRevenue = orders
      .filter(o => o.status === 'closed')
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const averageTicket = closedOrders > 0 ? totalRevenue / closedOrders : 0;

    return {
      totalOrders,
      openOrders,
      closedOrders,
      totalRevenue,
      averageTicket,
      orders,
    };
  },
};
