export type AppRole = 'admin_global' | 'owner' | 'waiter' | 'kitchen' | 'cashier';
export type OrderStatus = 'open' | 'closed' | 'canceled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'card' | 'pix';
export type KitchenStatus = 'queue' | 'preparing' | 'ready' | 'delivered';

export interface Establishment {
  id: string;
  name: string;
  has_kitchen: boolean;
  has_orders: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  establishment_id: string;
  role: AppRole;
  created_at: string;
}

export interface Product {
  id: string;
  establishment_id: string;
  name: string;
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  establishment_id: string;
  code: string | null;
  customer_name: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  paid_amount: number;
  created_by: string | null;
  created_at: string;
  closed_at: string | null;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  note: string | null;
  created_at: string;
}

export interface KitchenTicket {
  id: string;
  order_id: string;
  establishment_id: string;
  ticket_number: number;
  status: KitchenStatus;
  created_at: string;
  started_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  amount: number;
  received_by: string | null;
  received_at: string;
  created_at: string;
}
