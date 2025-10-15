import { EventEmitter } from 'events';

export interface Notification {
  id: string;
  type: 'new_order' | 'order_updated' | 'order_paid' | 'kitchen_ready';
  establishmentId: string;
  title: string;
  message: string;
  data?: any;
  createdAt: Date;
}

/**
 * Serviço de notificações em tempo real usando EventEmitter
 */
class NotificationsService extends EventEmitter {
  private notifications: Map<string, Notification[]> = new Map();
  private readonly MAX_NOTIFICATIONS_PER_ESTABLISHMENT = 100;

  /**
   * Emitir notificação para um estabelecimento
   */
  emit(event: string, notification: Notification): boolean {
    // Salvar notificação no histórico
    this.saveNotification(notification);

    // Emitir evento
    return super.emit(event, notification);
  }

  /**
   * Salvar notificação no histórico em memória
   */
  private saveNotification(notification: Notification): void {
    const key = notification.establishmentId;

    if (!this.notifications.has(key)) {
      this.notifications.set(key, []);
    }

    const notifications = this.notifications.get(key)!;
    notifications.unshift(notification);

    // Limitar quantidade de notificações
    if (notifications.length > this.MAX_NOTIFICATIONS_PER_ESTABLISHMENT) {
      notifications.pop();
    }
  }

  /**
   * Buscar notificações recentes de um estabelecimento
   */
  getRecentNotifications(establishmentId: string, limit: number = 10): Notification[] {
    const notifications = this.notifications.get(establishmentId) || [];
    return notifications.slice(0, limit);
  }

  /**
   * Limpar notificações antigas
   */
  clearOldNotifications(establishmentId: string): void {
    this.notifications.delete(establishmentId);
  }

  /**
   * Criar e emitir notificação de novo pedido
   */
  notifyNewOrder(establishmentId: string, orderData: any): void {
    const notification: Notification = {
      id: `order-${orderData.id}-${Date.now()}`,
      type: 'new_order',
      establishmentId,
      title: 'Novo Pedido!',
      message: `Pedido ${orderData.code || '#' + orderData.id.slice(0, 8)} - ${orderData.customerName || 'Cliente'}`,
      data: {
        orderId: orderData.id,
        code: orderData.code,
        customerName: orderData.customerName,
        totalAmount: orderData.totalAmount,
        itemsCount: orderData.items?.length || 0,
      },
      createdAt: new Date(),
    };

    this.emit(`notification:${establishmentId}`, notification);
  }

  /**
   * Criar e emitir notificação de pedido atualizado
   */
  notifyOrderUpdated(establishmentId: string, orderData: any): void {
    const notification: Notification = {
      id: `order-update-${orderData.id}-${Date.now()}`,
      type: 'order_updated',
      establishmentId,
      title: 'Pedido Atualizado',
      message: `Pedido ${orderData.code || '#' + orderData.id.slice(0, 8)} foi atualizado`,
      data: {
        orderId: orderData.id,
        code: orderData.code,
        status: orderData.status,
      },
      createdAt: new Date(),
    };

    this.emit(`notification:${establishmentId}`, notification);
  }

  /**
   * Criar e emitir notificação de pedido pago
   */
  notifyOrderPaid(establishmentId: string, orderData: any): void {
    const notification: Notification = {
      id: `order-paid-${orderData.id}-${Date.now()}`,
      type: 'order_paid',
      establishmentId,
      title: 'Pedido Pago',
      message: `Pedido ${orderData.code || '#' + orderData.id.slice(0, 8)} foi pago`,
      data: {
        orderId: orderData.id,
        code: orderData.code,
        totalAmount: orderData.totalAmount,
      },
      createdAt: new Date(),
    };

    this.emit(`notification:${establishmentId}`, notification);
  }
}

export const notificationsService = new NotificationsService();
