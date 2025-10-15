// User & Auth
export interface AuthUserRole {
  establishmentId: string | null;
  establishmentName?: string;
  establishmentSlug?: string;
  role: 'admin_global' | 'owner' | 'user';
  hasKitchen?: boolean;
  hasOrders?: boolean;
  hasReports?: boolean;
  onlineOrdering?: boolean;
  active?: boolean;
  permissions?: {
    modules: {
      orders: boolean;
      kitchen: boolean;
      reports: boolean;
    };
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  active: boolean;
  roles: AuthUserRole[];
}

export interface Establishment {
  id: string;
  name: string;
  slug?: string;
  role: string;
  hasKitchen?: boolean;
  hasOrders?: boolean;
  hasReports?: boolean;
  onlineOrdering?: boolean;
  active?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Product
export interface Product {
  id: string;
  establishmentId: string;
  name: string;
  price: number;
  active: boolean;
  createdAt: string;
}

// Order
export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  qty: number;
  unitPrice: number;
  note?: string;
  product?: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  method: 'cash' | 'card' | 'pix';
  amount: number;
  receivedAt: string;
}

export interface Order {
  id: string;
  establishmentId: string;
  code?: string;
  status: 'open' | 'closed' | 'canceled';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  totalAmount: number;
  paidAmount: number;
  createdAt: string;
  closedAt?: string;
  items: OrderItem[];
  payments?: Payment[];
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  kitchenTickets?: {
    ticketNumber: number;
  }[];
}

// Create Order
export interface CreateOrderItem {
  productId: string;
  qty: number;
  note?: string;
}

export interface CreateOrderRequest {
  code?: string;
  items: CreateOrderItem[];
  payNow?: boolean;
  paymentMethod?: 'cash' | 'card' | 'pix';
}

// Mark Paid
export interface MarkPaidRequest {
  method: 'cash' | 'card' | 'pix';
  amount?: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

// Kitchen Ticket
export type KitchenTicketStatus = 'queue' | 'preparing' | 'ready' | 'delivered';

export interface KitchenTicket {
  id: string;
  orderId: string;
  ticketNumber: number;
  status: KitchenTicketStatus;
  createdAt: string;
  updatedAt: string;
  order: Order;
}

export interface UpdateTicketStatusRequest {
  status: KitchenTicketStatus;
}

export interface KitchenStats {
  queue: number;
  preparing: number;
  ready: number;
  delivered: number;
  averageTimeMinutes: number;
}

// Reports
export interface DailySalesData {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  averageTicket: number;
  paymentMethods: {
    cash: number;
    credit_card: number;
    debit_card: number;
    pix: number;
  };
}

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface HourlyDistribution {
  hour: number;
  orders: number;
  revenue: number;
}

export interface DailyReport {
  establishment: {
    id: string;
    name: string;
  };
  period: {
    date: string;
    dayOfWeek: string;
  };
  sales: DailySalesData;
  topProducts: TopProduct[];
  hourlyDistribution: HourlyDistribution[];
}

export interface PeriodSalesData {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  averageTicket: number;
}

export interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface PeriodReport {
  establishment: {
    id: string;
    name: string;
  };
  period: {
    startDate: string;
    endDate: string;
    groupBy: string;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
    totalPaid: number;
    averageTicket: number;
    totalDays: number;
  };
  salesByPeriod: PeriodSalesData[];
  topProducts: TopProduct[];
  paymentMethods: PaymentMethodData[];
}

// Admin
export interface EstablishmentDetails extends Establishment {
  slug: string;
  hasKitchen: boolean;
  hasOrders: boolean;
  hasReports: boolean;
  isActive: boolean;
  createdAt: string;
  userRoles?: UserRole[];
  _count?: {
    userRoles: number;
    products: number;
    orders: number;
  };
}

export interface UserDetails extends User {
  active: boolean;
  createdAt: string;
  userRoles?: UserRole[];
}

export interface UserRole {
  id: string;
  userId: string;
  establishmentId: string;
  role: 'admin_global' | 'owner' | 'waiter' | 'kitchen' | 'cashier';
  user?: {
    id: string;
    email: string;
    name: string;
  };
  establishment?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateEstablishmentRequest {
  name: string;
  slug: string;
  hasKitchen?: boolean;
  hasOrders?: boolean;
  hasReports?: boolean;
  isActive?: boolean;
}

export interface UpdateEstablishmentRequest {
  name?: string;
  slug?: string;
  hasKitchen?: boolean;
  hasOrders?: boolean;
  hasReports?: boolean;
  isActive?: boolean;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  active?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  active?: boolean;
}

export interface CreateUserRoleRequest {
  userId: string;
  establishmentId: string;
  role: 'admin_global' | 'owner' | 'waiter' | 'kitchen' | 'cashier';
}

export interface UpdateUserRoleRequest {
  role: 'admin_global' | 'owner' | 'waiter' | 'kitchen' | 'cashier';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Employee
export interface Employee {
  id: string;
  userId: string;
  email: string;
  name: string;
  active: boolean;
  role: 'owner' | 'user';
  permissions?: {
    modules: {
      orders: boolean;
      kitchen: boolean;
      reports: boolean;
    };
  } | null;
  createdAt: string;
}

export interface CreateEmployeeRequest {
  email: string;
  name: string;
  password: string;
  role: 'owner' | 'user';
  permissions?: {
    modules: {
      orders: boolean;
      kitchen: boolean;
      reports: boolean;
    };
  };
}

export interface UpdateEmployeeRequest {
  name?: string;
  email?: string;
  active?: boolean;
  permissions?: {
    modules: {
      orders: boolean;
      kitchen: boolean;
      reports: boolean;
    };
  };
}
