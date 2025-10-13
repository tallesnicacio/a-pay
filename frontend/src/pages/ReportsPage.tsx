import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { reportsApi } from '../services/api';
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import type { DailyReport, PeriodReport } from '../types';

type ReportType = 'daily' | 'period';

export function ReportsPage() {
  const { currentEstablishment } = useAuthStore();
  const [reportType, setReportType] = useState<ReportType>('daily');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [periodReport, setPeriodReport] = useState<PeriodReport | null>(null);

  // Filtros
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('day');

  // Carregar relatório diário
  const loadDailyReport = async () => {
    if (!currentEstablishment) return;

    setIsLoading(true);
    try {
      const report = await reportsApi.getDailyReport(selectedDate);
      setDailyReport(report);
    } catch (error) {
      console.error('Erro ao carregar relatório diário:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar relatório por período
  const loadPeriodReport = async () => {
    if (!currentEstablishment) return;

    setIsLoading(true);
    try {
      const report = await reportsApi.getPeriodReport({
        startDate,
        endDate,
        groupBy,
      });
      setPeriodReport(report);
    } catch (error) {
      console.error('Erro ao carregar relatório por período:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar dados
  const handleExport = async (format: 'csv' | 'json') => {
    if (!currentEstablishment) return;

    try {
      const blob = await reportsApi.exportData({
        startDate,
        endDate,
        format,
      });

      // Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `export_${startDate}_${endDate}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
    }
  };

  // Carregar ao trocar filtros
  useEffect(() => {
    if (reportType === 'daily') {
      loadDailyReport();
    } else {
      loadPeriodReport();
    }
  }, [currentEstablishment, reportType, selectedDate, startDate, endDate, groupBy]);

  if (!currentEstablishment) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Selecione um estabelecimento</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-sm text-gray-600">{currentEstablishment.name}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-2 font-medium transition-colors ${
              reportType === 'daily'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Diário
          </button>
          <button
            onClick={() => setReportType('period')}
            className={`px-4 py-2 font-medium transition-colors ${
              reportType === 'period'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Por Período
          </button>
        </div>

        {/* Filtros */}
        <Card>
          <div className="space-y-4">
            {reportType === 'daily' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agrupar por
                  </label>
                  <select
                    value={groupBy}
                    onChange={(e) =>
                      setGroupBy(e.target.value as 'day' | 'week' | 'month')
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="day">Dia</option>
                    <option value="week">Semana</option>
                    <option value="month">Mês</option>
                  </select>
                </div>
              </div>
            )}

            {reportType === 'period' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport('csv')}
                  variant="outline"
                  size="sm"
                >
                  Exportar CSV
                </Button>
                <Button
                  onClick={() => handleExport('json')}
                  variant="outline"
                  size="sm"
                >
                  Exportar JSON
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Carregando relatório...</p>
          </div>
        )}

        {/* Relatório Diário */}
        {!isLoading && reportType === 'daily' && dailyReport && (
          <div className="space-y-6">
            {/* Cards de resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm">
                <p className="text-xs text-gray-600 mb-1">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dailyReport.sales.totalOrders}
                </p>
              </Card>
              <Card padding="sm">
                <p className="text-xs text-gray-600 mb-1">Faturamento</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {dailyReport.sales.totalRevenue.toFixed(2)}
                </p>
              </Card>
              <Card padding="sm">
                <p className="text-xs text-gray-600 mb-1">Total Pago</p>
                <p className="text-2xl font-bold text-primary-600">
                  R$ {dailyReport.sales.totalPaid.toFixed(2)}
                </p>
              </Card>
              <Card padding="sm">
                <p className="text-xs text-gray-600 mb-1">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {dailyReport.sales.averageTicket.toFixed(2)}
                </p>
              </Card>
            </div>

            {/* Top produtos */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Produtos Mais Vendidos
              </h3>
              {dailyReport.topProducts.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  Nenhum produto vendido hoje
                </p>
              ) : (
                <div className="space-y-3">
                  {dailyReport.topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">
                            {product.productName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {product.quantity} unidades
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-green-600">
                        R$ {product.revenue.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Métodos de pagamento */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Métodos de Pagamento
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Dinheiro</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {dailyReport.sales.paymentMethods.cash.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Crédito</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {dailyReport.sales.paymentMethods.credit_card.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Débito</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {dailyReport.sales.paymentMethods.debit_card.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">PIX</p>
                  <p className="text-lg font-bold text-gray-900">
                    R$ {dailyReport.sales.paymentMethods.pix.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Distribuição por hora */}
            {dailyReport.hourlyDistribution.length > 0 && (
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Distribuição por Hora
                </h3>
                <div className="space-y-2">
                  {dailyReport.hourlyDistribution.map((item) => {
                    const maxRevenue = Math.max(
                      ...dailyReport.hourlyDistribution.map((d) => d.revenue)
                    );
                    const percentage = (item.revenue / maxRevenue) * 100;

                    return (
                      <div key={item.hour} className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 w-12">
                          {String(item.hour).padStart(2, '0')}:00
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-8">
                            <div
                              className="bg-primary-600 h-8 rounded-full flex items-center justify-end px-2"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 20 && (
                                <span className="text-xs font-medium text-white">
                                  {item.orders} pedidos
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-24 text-right">
                            R$ {item.revenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Relatório por Período */}
        {!isLoading && reportType === 'period' && periodReport && (
          <div className="space-y-6">
            {/* Cards de resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm">
                <p className="text-xs text-gray-600 mb-1">Total de Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodReport.summary.totalOrders}
                </p>
              </Card>
              <Card padding="sm">
                <p className="text-xs text-gray-600 mb-1">Faturamento Total</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {periodReport.summary.totalRevenue.toFixed(2)}
                </p>
              </Card>
              <Card padding="sm">
                <p className="text-xs text-gray-600 mb-1">Total Pago</p>
                <p className="text-2xl font-bold text-primary-600">
                  R$ {periodReport.summary.totalPaid.toFixed(2)}
                </p>
              </Card>
              <Card padding="sm">
                <p className="text-xs text-gray-600 mb-1">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {periodReport.summary.averageTicket.toFixed(2)}
                </p>
              </Card>
            </div>

            {/* Vendas por período */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vendas por {groupBy === 'day' ? 'Dia' : groupBy === 'week' ? 'Semana' : 'Mês'}
              </h3>
              <div className="space-y-2">
                {periodReport.salesByPeriod.map((item) => {
                  const maxRevenue = Math.max(
                    ...periodReport.salesByPeriod.map((d) => d.totalRevenue)
                  );
                  const percentage = (item.totalRevenue / maxRevenue) * 100;

                  return (
                    <div key={item.period} className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-24">
                        {item.period}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-8">
                          <div
                            className="bg-green-600 h-8 rounded-full flex items-center justify-end px-2"
                            style={{ width: `${percentage}%` }}
                          >
                            {percentage > 20 && (
                              <span className="text-xs font-medium text-white">
                                {item.totalOrders} pedidos
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-28 text-right">
                          R$ {item.totalRevenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Top produtos */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Produtos Mais Vendidos
              </h3>
              <div className="space-y-3">
                {periodReport.topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {product.productName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.quantity} unidades
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-green-600">
                      R$ {product.revenue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Métodos de pagamento */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Métodos de Pagamento
              </h3>
              <div className="space-y-3">
                {periodReport.paymentMethods.map((method) => (
                  <div
                    key={method.method}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {method.method.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {method.count} transações
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        R$ {method.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {method.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
