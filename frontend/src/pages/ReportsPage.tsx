import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { reportsApi } from '../services/api';
import { Layout } from '../components/common/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { StatsCard } from '../components/common/StatsCard';
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

  // Helper function para formatar valores monetários com segurança
  const formatCurrency = (value: number | null | undefined): string => {
    return `R$ ${(value ?? 0).toFixed(2)}`;
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
          <p className="text-neutral-600">Selecione um estabelecimento</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-slide-in-up">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-neutral-900 font-display">Relatórios</h2>
          <p className="text-neutral-500 mt-1">{currentEstablishment.name}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b-2 border-neutral-200">
          <button
            onClick={() => setReportType('daily')}
            className={`px-4 py-3 font-semibold transition-all relative ${
              reportType === 'daily'
                ? 'text-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Relatório Diário
            {reportType === 'daily' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setReportType('period')}
            className={`px-4 py-3 font-semibold transition-all relative ${
              reportType === 'period'
                ? 'text-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Relatório por Período
            {reportType === 'period' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Filtros */}
        <Card>
          <div className="space-y-4">
            {reportType === 'daily' ? (
              <div>
                <Input
                  type="date"
                  label="Selecione a Data"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    type="date"
                    label="Data Inicial"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  <Input
                    type="date"
                    label="Data Final"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                  />
                  <Select
                    label="Agrupar por"
                    value={groupBy}
                    onChange={(value) => setGroupBy(value as 'day' | 'week' | 'month')}
                    options={[
                      { value: 'day', label: 'Dia' },
                      { value: 'week', label: 'Semana' },
                      { value: 'month', label: 'Mês' },
                    ]}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleExport('csv')}
                    variant="secondary"
                    size="sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar CSV
                  </Button>
                  <Button
                    onClick={() => handleExport('json')}
                    variant="secondary"
                    size="sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar JSON
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-neutral-600 font-medium">Gerando relatório...</p>
          </div>
        )}

        {/* Relatório Diário */}
        {!isLoading && reportType === 'daily' && dailyReport && (
          <div className="space-y-6">
            {/* Cards de resumo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatsCard
                label="Pedidos"
                value={dailyReport.sales.totalOrders}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                color="primary"
              />
              <StatsCard
                label="Faturamento"
                value={`R$ ${dailyReport.sales.totalRevenue.toFixed(2)}`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="success"
              />
              <StatsCard
                label="Total Pago"
                value={`R$ ${dailyReport.sales.totalPaid.toFixed(2)}`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="info"
              />
              <StatsCard
                label="Ticket Médio"
                value={`R$ ${dailyReport.sales.averageTicket.toFixed(2)}`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                color="warning"
              />
            </div>

            {/* Top produtos */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900 font-display">
                  Produtos Mais Vendidos
                </h3>
                <Badge variant="primary">{dailyReport.topProducts.length} produtos</Badge>
              </div>
              {dailyReport.topProducts.length === 0 ? (
                <p className="text-neutral-600 text-center py-8">
                  Nenhum produto vendido hoje
                </p>
              ) : (
                <div className="space-y-3">
                  {dailyReport.topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-neutral-50 to-transparent rounded-xl hover:from-neutral-100 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center font-bold text-white shadow-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 truncate">
                          {product.productName}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {product.quantity} unidades vendidas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success-600 font-mono">
                          {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Métodos de pagamento */}
            <Card>
              <h3 className="text-xl font-bold text-neutral-900 font-display mb-6">
                Métodos de Pagamento
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Dinheiro', value: dailyReport.sales.paymentMethods.cash, icon: '💵', color: 'success' },
                  { label: 'Crédito', value: dailyReport.sales.paymentMethods.credit_card, icon: '💳', color: 'primary' },
                  { label: 'Débito', value: dailyReport.sales.paymentMethods.debit_card, icon: '💳', color: 'info' },
                  { label: 'PIX', value: dailyReport.sales.paymentMethods.pix, icon: '📱', color: 'warning' },
                ].map((method) => (
                  <div
                    key={method.label}
                    className="p-4 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl hover:shadow-md transition-shadow"
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <p className="text-sm text-neutral-600 mb-1">{method.label}</p>
                    <p className="text-xl font-bold text-neutral-900 font-mono">
                      R$ {method.value.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Distribuição por hora */}
            {dailyReport.hourlyDistribution.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold text-neutral-900 font-display mb-6">
                  Distribuição por Hora
                </h3>
                <div className="space-y-3">
                  {dailyReport.hourlyDistribution.map((item) => {
                    const maxRevenue = Math.max(
                      ...dailyReport.hourlyDistribution.map((d) => d.revenue)
                    );
                    const percentage = (item.revenue / maxRevenue) * 100;

                    return (
                      <div key={item.hour} className="flex items-center gap-4">
                        <Badge variant="neutral" className="w-16 justify-center font-mono">
                          {String(item.hour).padStart(2, '0')}:00
                        </Badge>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="flex-1 bg-neutral-200 rounded-full h-10 overflow-hidden shadow-inner">
                            <div
                              className="bg-gradient-primary h-10 rounded-full flex items-center justify-end px-3 transition-all duration-500 shadow-primary"
                              style={{ width: `${Math.max(percentage, 5)}%` }}
                            >
                              {percentage > 15 && (
                                <span className="text-xs font-bold text-white">
                                  {item.orders} {item.orders === 1 ? 'pedido' : 'pedidos'}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-neutral-900 w-28 text-right font-mono">
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
              <StatsCard
                label="Pedidos"
                value={periodReport.summary.totalOrders}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                color="primary"
              />
              <StatsCard
                label="Faturamento"
                value={`R$ ${periodReport.summary.totalRevenue.toFixed(2)}`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="success"
              />
              <StatsCard
                label="Total Pago"
                value={`R$ ${periodReport.summary.totalPaid.toFixed(2)}`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="info"
              />
              <StatsCard
                label="Ticket Médio"
                value={`R$ ${periodReport.summary.averageTicket.toFixed(2)}`}
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
                color="warning"
              />
            </div>

            {/* Vendas por período */}
            <Card>
              <h3 className="text-xl font-bold text-neutral-900 font-display mb-6">
                Vendas por {groupBy === 'day' ? 'Dia' : groupBy === 'week' ? 'Semana' : 'Mês'}
              </h3>
              <div className="space-y-3">
                {periodReport.salesByPeriod.map((item) => {
                  const maxRevenue = Math.max(
                    ...periodReport.salesByPeriod.map((d) => d.totalRevenue)
                  );
                  const percentage = (item.totalRevenue / maxRevenue) * 100;

                  return (
                    <div key={item.period} className="flex items-center gap-4">
                      <Badge variant="primary" className="min-w-[100px] justify-center font-mono">
                        {item.period}
                      </Badge>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 bg-neutral-200 rounded-full h-10 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-success-500 to-success-600 h-10 rounded-full flex items-center justify-end px-3 transition-all duration-500 shadow-success"
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                          >
                            {percentage > 15 && (
                              <span className="text-xs font-bold text-white">
                                {item.totalOrders} {item.totalOrders === 1 ? 'pedido' : 'pedidos'}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-neutral-900 w-32 text-right font-mono">
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
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-neutral-900 font-display">
                  Produtos Mais Vendidos
                </h3>
                <Badge variant="primary">{periodReport.topProducts.length} produtos</Badge>
              </div>
              <div className="space-y-3">
                {periodReport.topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-neutral-50 to-transparent rounded-xl hover:from-neutral-100 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center font-bold text-white shadow-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-neutral-900 truncate">
                        {product.productName}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {product.quantity} unidades vendidas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success-600 font-mono">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Métodos de pagamento */}
            <Card>
              <h3 className="text-xl font-bold text-neutral-900 font-display mb-6">
                Métodos de Pagamento
              </h3>
              <div className="space-y-3">
                {periodReport.paymentMethods.map((method) => (
                  <div
                    key={method.method}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-neutral-50 to-transparent rounded-xl hover:from-neutral-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900 capitalize">
                          {method.method.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {method.count} {method.count === 1 ? 'transação' : 'transações'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 font-mono">
                        R$ {method.amount.toFixed(2)}
                      </p>
                      <Badge variant="success" size="sm">
                        {method.percentage.toFixed(1)}%
                      </Badge>
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
