import { z } from 'zod';

/**
 * Schema para filtros de relatório diário
 */
export const dailyReportQuerySchema = z.object({
  date: z.string().optional(), // ISO date string (YYYY-MM-DD)
});

export type DailyReportQuery = z.infer<typeof dailyReportQuerySchema>;

/**
 * Schema para filtros de relatório por período
 */
export const periodReportQuerySchema = z.object({
  startDate: z.string(), // ISO date string (YYYY-MM-DD)
  endDate: z.string(), // ISO date string (YYYY-MM-DD)
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
});

export type PeriodReportQuery = z.infer<typeof periodReportQuerySchema>;

/**
 * Schema para export de dados
 */
export const exportQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  format: z.enum(['csv', 'json']).optional().default('csv'),
});

export type ExportQuery = z.infer<typeof exportQuerySchema>;

/**
 * Types para resposta de relatórios
 */
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

export interface DailyReportResponse {
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
  hourlyDistribution: {
    hour: number;
    orders: number;
    revenue: number;
  }[];
}

export interface PeriodSalesData {
  period: string; // Date or week or month depending on groupBy
  totalOrders: number;
  totalRevenue: number;
  totalPaid: number;
  averageTicket: number;
}

export interface PeriodReportResponse {
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
  paymentMethods: {
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }[];
}

export interface ExportRow {
  order_code: string;
  order_date: string;
  order_time: string;
  total_amount: number;
  paid_amount: number;
  payment_status: string;
  payment_method: string | null;
  items_count: number;
  items_details: string;
}
