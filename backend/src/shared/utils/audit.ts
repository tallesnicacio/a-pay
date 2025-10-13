import { prisma } from '../database/prisma.service';
import logger from './logger';

export interface AuditLogData {
  establishmentId?: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  payload?: Record<string, any>;
}

/**
 * Cria um log de auditoria
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        establishmentId: data.establishmentId,
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        payload: data.payload || {},
      },
    });

    logger.debug(
      {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
      },
      'Audit log created'
    );
  } catch (error) {
    // Não falhar a operação principal se audit log falhar
    logger.error({ error, data }, 'Failed to create audit log');
  }
}

/**
 * Ações comuns de auditoria
 */
export const AuditActions = {
  // Orders
  CREATE_ORDER: 'create_order',
  UPDATE_ORDER: 'update_order',
  CANCEL_ORDER: 'cancel_order',
  MARK_PAID: 'mark_paid',

  // Kitchen
  CHANGE_KITCHEN_STATUS: 'change_kitchen_status',

  // Products
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',

  // Admin
  CREATE_ESTABLISHMENT: 'create_establishment',
  UPDATE_ESTABLISHMENT: 'update_establishment',
  CREATE_USER: 'create_user',
  ASSIGN_ROLE: 'assign_role',
};

/**
 * Entidades para auditoria
 */
export const AuditEntities = {
  ORDER: 'order',
  ORDER_ITEM: 'order_item',
  KITCHEN_TICKET: 'kitchen_ticket',
  PAYMENT: 'payment',
  PRODUCT: 'product',
  ESTABLISHMENT: 'establishment',
  USER: 'user',
  USER_ROLE: 'user_role',
};
