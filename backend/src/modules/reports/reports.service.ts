import { prisma } from '../../shared/database/prisma';
import { NotFoundError } from '../../shared/errors/AppError';
import type {
  DailyReportQuery,
  DailyReportResponse,
  PeriodReportQuery,
  PeriodReportResponse,
  ExportQuery,
  ExportRow,
  TopProduct,
} from './reports.schema';

export class ReportsService {
  /**
   * Relatório de vendas do dia
   */
  async getDailyReport(
    query: DailyReportQuery,
    establishmentId: string
  ): Promise<DailyReportResponse> {
    // Usar data de hoje se não fornecida
    const targetDate = query.date ? new Date(query.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar estabelecimento
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { id: true, name: true },
    });

    if (!establishment) {
      throw new NotFoundError('Estabelecimento não encontrado');
    }

    // Buscar pedidos do dia
    const orders = await prisma.order.findMany({
      where: {
        establishmentId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    // Calcular métricas de vendas
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const totalPaid = orders.reduce(
      (sum, order) => sum + Number(order.paidAmount),
      0
    );
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Agrupar por método de pagamento
    const paymentMethods = {
      cash: 0,
      credit_card: 0,
      debit_card: 0,
      pix: 0,
    };

    orders.forEach((order) => {
      order.payments.forEach((payment) => {
        if (payment.method in paymentMethods) {
          paymentMethods[payment.method as keyof typeof paymentMethods] +=
            Number(payment.amount);
        }
      });
    });

    // Top produtos
    const productSales = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += Number(item.subtotal);
        } else {
          productSales.set(item.productId, {
            name: item.product.name,
            quantity: item.quantity,
            revenue: Number(item.subtotal),
          });
        }
      });
    });

    const topProducts: TopProduct[] = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Distribuição por hora
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      orders: 0,
      revenue: 0,
    }));

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      hourlyDistribution[hour].orders += 1;
      hourlyDistribution[hour].revenue += Number(order.totalAmount);
    });

    // Dia da semana
    const dayOfWeek = [
      'Domingo',
      'Segunda',
      'Terça',
      'Quarta',
      'Quinta',
      'Sexta',
      'Sábado',
    ][targetDate.getDay()];

    return {
      establishment,
      period: {
        date: targetDate.toISOString().split('T')[0],
        dayOfWeek,
      },
      sales: {
        date: targetDate.toISOString().split('T')[0],
        totalOrders,
        totalRevenue,
        totalPaid,
        averageTicket,
        paymentMethods,
      },
      topProducts,
      hourlyDistribution: hourlyDistribution.filter((h) => h.orders > 0),
    };
  }

  /**
   * Relatório de vendas por período
   */
  async getPeriodReport(
    query: PeriodReportQuery,
    establishmentId: string
  ): Promise<PeriodReportResponse> {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Buscar estabelecimento
    const establishment = await prisma.establishment.findUnique({
      where: { id: establishmentId },
      select: { id: true, name: true },
    });

    if (!establishment) {
      throw new NotFoundError('Estabelecimento não encontrado');
    }

    // Buscar pedidos do período
    const orders = await prisma.order.findMany({
      where: {
        establishmentId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    // Calcular summary
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const totalPaid = orders.reduce(
      (sum, order) => sum + Number(order.paidAmount),
      0
    );
    const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Agrupar vendas por período (day/week/month)
    const salesByPeriod = this.groupSalesByPeriod(orders, query.groupBy);

    // Top produtos
    const productSales = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSales.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += Number(item.subtotal);
        } else {
          productSales.set(item.productId, {
            name: item.product.name,
            quantity: item.quantity,
            revenue: Number(item.subtotal),
          });
        }
      });
    });

    const topProducts: TopProduct[] = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        productName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Métodos de pagamento
    const paymentMethodsMap = new Map<
      string,
      { count: number; amount: number }
    >();

    orders.forEach((order) => {
      order.payments.forEach((payment) => {
        const existing = paymentMethodsMap.get(payment.method);
        if (existing) {
          existing.count += 1;
          existing.amount += Number(payment.amount);
        } else {
          paymentMethodsMap.set(payment.method, {
            count: 1,
            amount: Number(payment.amount),
          });
        }
      });
    });

    const paymentMethods = Array.from(paymentMethodsMap.entries())
      .map(([method, data]) => ({
        method,
        count: data.count,
        amount: data.amount,
        percentage: totalPaid > 0 ? (data.amount / totalPaid) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      establishment,
      period: {
        startDate: query.startDate,
        endDate: query.endDate,
        groupBy: query.groupBy,
      },
      summary: {
        totalOrders,
        totalRevenue,
        totalPaid,
        averageTicket,
        totalDays,
      },
      salesByPeriod,
      topProducts,
      paymentMethods,
    };
  }

  /**
   * Export de dados em CSV ou JSON
   */
  async exportData(
    query: ExportQuery,
    establishmentId: string
  ): Promise<{ data: ExportRow[]; format: string }> {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        establishmentId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const exportData: ExportRow[] = orders.map((order) => {
      const createdAt = new Date(order.createdAt);
      const itemsDetails = order.items
        .map(
          (item) =>
            `${item.quantity}x ${item.product.name}${
              item.note ? ` (${item.note})` : ''
            }`
        )
        .join('; ');

      const primaryPayment = order.payments[0]; // Pegar primeiro pagamento

      return {
        order_code: order.code || order.id.substring(0, 8),
        order_date: createdAt.toISOString().split('T')[0],
        order_time: createdAt.toTimeString().split(' ')[0],
        total_amount: Number(order.totalAmount),
        paid_amount: Number(order.paidAmount),
        payment_status: order.paymentStatus,
        payment_method: primaryPayment ? primaryPayment.method : null,
        items_count: order.items.length,
        items_details: itemsDetails,
      };
    });

    return {
      data: exportData,
      format: query.format,
    };
  }

  /**
   * Helper: Agrupar vendas por período
   */
  private groupSalesByPeriod(
    orders: any[],
    groupBy: 'day' | 'week' | 'month'
  ) {
    const grouped = new Map<
      string,
      { totalOrders: number; totalRevenue: number; totalPaid: number }
    >();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Domingo
        key = weekStart.toISOString().split('T')[0];
      } else {
        // month
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0'
        )}`;
      }

      const existing = grouped.get(key);
      if (existing) {
        existing.totalOrders += 1;
        existing.totalRevenue += Number(order.totalAmount);
        existing.totalPaid += Number(order.paidAmount);
      } else {
        grouped.set(key, {
          totalOrders: 1,
          totalRevenue: Number(order.totalAmount),
          totalPaid: Number(order.paidAmount),
        });
      }
    });

    return Array.from(grouped.entries())
      .map(([period, data]) => ({
        period,
        ...data,
        averageTicket:
          data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }
}
