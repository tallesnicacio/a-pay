import type { FastifyRequest, FastifyReply } from 'fastify';
import { ReportsService } from './reports.service';
import {
  dailyReportQuerySchema,
  periodReportQuerySchema,
  exportQuerySchema,
} from './reports.schema';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  /**
   * GET /reports/daily
   * Relatório de vendas do dia
   */
  async getDailyReport(request: FastifyRequest, reply: FastifyReply) {
    const query = dailyReportQuerySchema.parse(request.query);
    const establishmentId = request.establishmentId!;

    const report = await this.reportsService.getDailyReport(
      query,
      establishmentId
    );

    return reply.code(200).send({
      success: true,
      data: report,
    });
  }

  /**
   * GET /reports/period
   * Relatório de vendas por período
   */
  async getPeriodReport(request: FastifyRequest, reply: FastifyReply) {
    const query = periodReportQuerySchema.parse(request.query);
    const establishmentId = request.establishmentId!;

    const report = await this.reportsService.getPeriodReport(
      query,
      establishmentId
    );

    return reply.code(200).send({
      success: true,
      data: report,
    });
  }

  /**
   * GET /reports/export
   * Export de dados em CSV ou JSON
   */
  async exportData(request: FastifyRequest, reply: FastifyReply) {
    const query = exportQuerySchema.parse(request.query);
    const establishmentId = request.establishmentId!;

    const { data, format } = await this.reportsService.exportData(
      query,
      establishmentId
    );

    if (format === 'csv') {
      // Gerar CSV
      const headers = Object.keys(data[0] || {});
      const csvRows = [
        headers.join(','), // Header row
        ...data.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              // Escapar valores que contém vírgula ou aspas
              const stringValue = String(value ?? '');
              if (stringValue.includes(',') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(',')
        ),
      ];

      const csv = csvRows.join('\n');

      return reply
        .code(200)
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header(
          'Content-Disposition',
          `attachment; filename="export_${query.startDate}_${query.endDate}.csv"`
        )
        .send(csv);
    } else {
      // JSON
      return reply
        .code(200)
        .header('Content-Type', 'application/json')
        .header(
          'Content-Disposition',
          `attachment; filename="export_${query.startDate}_${query.endDate}.json"`
        )
        .send({
          success: true,
          data,
        });
    }
  }
}
