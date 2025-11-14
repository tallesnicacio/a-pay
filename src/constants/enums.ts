// Enums matching database types
export enum AppRole {
  ADMIN_GLOBAL = 'admin_global',
  OWNER = 'owner',
  WAITER = 'waiter',
  KITCHEN = 'kitchen',
  CASHIER = 'cashier',
}

export enum OrderStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELED = 'canceled',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  PIX = 'pix',
}

export enum KitchenStatus {
  QUEUE = 'queue',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
}

// Display labels for enums
export const AppRoleLabels: Record<AppRole, string> = {
  [AppRole.ADMIN_GLOBAL]: 'Administrador Global',
  [AppRole.OWNER]: 'Proprietário',
  [AppRole.WAITER]: 'Garçom',
  [AppRole.KITCHEN]: 'Cozinha',
  [AppRole.CASHIER]: 'Caixa',
};

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.OPEN]: 'Aberto',
  [OrderStatus.CLOSED]: 'Fechado',
  [OrderStatus.CANCELED]: 'Cancelado',
};

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'Não Pago',
  [PaymentStatus.PARTIAL]: 'Parcial',
  [PaymentStatus.PAID]: 'Pago',
};

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Dinheiro',
  [PaymentMethod.CARD]: 'Cartão',
  [PaymentMethod.PIX]: 'PIX',
};

export const KitchenStatusLabels: Record<KitchenStatus, string> = {
  [KitchenStatus.QUEUE]: 'Na Fila',
  [KitchenStatus.PREPARING]: 'Preparando',
  [KitchenStatus.READY]: 'Pronto',
  [KitchenStatus.DELIVERED]: 'Entregue',
};

// Color classes for different statuses
export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.OPEN]: 'bg-blue-500',
  [OrderStatus.CLOSED]: 'bg-green-500',
  [OrderStatus.CANCELED]: 'bg-red-500',
};

export const PaymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'bg-red-500',
  [PaymentStatus.PARTIAL]: 'bg-yellow-500',
  [PaymentStatus.PAID]: 'bg-green-500',
};

export const KitchenStatusColors: Record<KitchenStatus, string> = {
  [KitchenStatus.QUEUE]: 'bg-gray-500',
  [KitchenStatus.PREPARING]: 'bg-blue-500',
  [KitchenStatus.READY]: 'bg-green-500',
  [KitchenStatus.DELIVERED]: 'bg-gray-400',
};
