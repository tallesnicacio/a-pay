import { Request } from 'express';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface JwtPayload {
  id: string;
  email: string;
}

// Database enums
export type AppRole = 'admin_global' | 'owner' | 'waiter' | 'kitchen' | 'cashier';
export type OrderStatus = 'open' | 'closed' | 'canceled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'card' | 'pix';
export type KitchenStatus = 'queue' | 'preparing' | 'ready' | 'delivered';
