import type { FastifyInstance } from 'fastify';
import { ReportsController } from './reports.controller';
import { authMiddleware } from '../../shared/middleware/auth.middleware';

export async function reportsRoutes(fastify: FastifyInstance) {
  const controller = new ReportsController();

  // Todas as rotas de reports requerem autenticação
  fastify.addHook('onRequest', authMiddleware);

  /**
   * GET /reports/daily
   * Relatório de vendas do dia
   * Query params: ?date=YYYY-MM-DD (opcional, default: hoje)
   */
  fastify.get('/daily', async (request, reply) => {
    return controller.getDailyReport(request, reply);
  });

  /**
   * GET /reports/period
   * Relatório de vendas por período
   * Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&groupBy=day|week|month
   */
  fastify.get('/period', async (request, reply) => {
    return controller.getPeriodReport(request, reply);
  });

  /**
   * GET /reports/export
   * Export de dados em CSV ou JSON
   * Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&format=csv|json
   */
  fastify.get('/export', async (request, reply) => {
    return controller.exportData(request, reply);
  });
}
