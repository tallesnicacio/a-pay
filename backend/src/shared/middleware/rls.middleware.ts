import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../database/prisma.service';
import logger from '../utils/logger';

/**
 * Middleware de Row Level Security (RLS)
 *
 * Define o establishment_id no contexto do PostgreSQL para filtrar automaticamente
 * todas as queries através de policies RLS.
 *
 * IMPORTANTE: Este middleware deve ser executado APÓS o authMiddleware.
 */
export async function rlsMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const establishmentId = request.establishmentId;

  if (!establishmentId) {
    // Admin global sem establishment específico - não define contexto
    logger.debug('RLS: No establishment context (admin global)');
    return;
  }

  try {
    // Define o establishment_id no contexto da sessão PostgreSQL
    // Isso será usado pelas policies RLS para filtrar dados
    await prisma.$executeRawUnsafe(
      `SET LOCAL app.current_establishment = '${establishmentId}'`
    );

    logger.debug(`RLS: Context set to establishment ${establishmentId}`);
  } catch (error) {
    logger.error({ error, establishmentId }, 'Failed to set RLS context');
    // Não bloquear a requisição, mas logar o erro
  }
}

/**
 * Helper para criar policies RLS no PostgreSQL
 *
 * Execute estas queries no banco para habilitar RLS:
 *
 * -- Para cada tabela com establishment_id:
 *
 * ALTER TABLE products ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY products_isolation ON products
 *   USING (
 *     establishment_id::text = current_setting('app.current_establishment', true)
 *   );
 *
 * -- Permitir admin global ver tudo (opcional):
 * CREATE POLICY products_admin_all ON products
 *   USING (
 *     current_setting('app.current_establishment', true) IS NULL
 *     OR current_setting('app.current_establishment', true) = ''
 *   );
 */
export const RLS_SETUP_SQL = `
-- Enable RLS for all relevant tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Products isolation
DROP POLICY IF EXISTS products_isolation ON products;
CREATE POLICY products_isolation ON products
  USING (
    establishment_id::text = current_setting('app.current_establishment', true)
    OR current_setting('app.current_establishment', true) IS NULL
  );

-- Orders isolation
DROP POLICY IF EXISTS orders_isolation ON orders;
CREATE POLICY orders_isolation ON orders
  USING (
    establishment_id::text = current_setting('app.current_establishment', true)
    OR current_setting('app.current_establishment', true) IS NULL
  );

-- Audit logs isolation
DROP POLICY IF EXISTS audit_logs_isolation ON audit_logs;
CREATE POLICY audit_logs_isolation ON audit_logs
  USING (
    establishment_id::text = current_setting('app.current_establishment', true)
    OR current_setting('app.current_establishment', true) IS NULL
  );
`;
