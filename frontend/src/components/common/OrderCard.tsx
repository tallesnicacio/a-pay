import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Order } from '../../types';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  onUpdateStatus?: (id: string) => void;
  onMarkAsPaid?: (id: string) => void;
  className?: string;
}

const statusConfig = {
  open: {
    label: 'Aberta',
    variant: 'warning' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  closed: {
    label: 'Fechada',
    variant: 'success' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
  },
  canceled: {
    label: 'Cancelada',
    variant: 'danger' as const,
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
  },
};

export function OrderCard({
  order,
  onClick,
  onUpdateStatus,
  onMarkAsPaid,
  className,
}: OrderCardProps) {
  // Fallback para status desconhecidos
  const config = statusConfig[order.status] || statusConfig.open;

  // Converter string para Date se necessário e validar
  const date = order.createdAt
    ? typeof order.createdAt === 'string'
      ? new Date(order.createdAt)
      : order.createdAt
    : null;

  const timeAgo =
    !date || isNaN(date.getTime())
      ? 'Data inválida'
      : formatDistanceToNow(date, {
          addSuffix: true,
          locale: ptBR,
        });

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-neutral-800">
                #{order.kitchenTickets?.[0]?.ticketNumber || order.code || order.id.slice(0, 8)}
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              {timeAgo}
              {order.creator && ` • ${order.creator.name}`}
            </p>
          </div>

          {/* Status Badge */}
          <Badge variant={config.variant} dot>
            <span className="flex items-center gap-1">
              {config.icon}
              {config.label}
            </span>
          </Badge>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="font-semibold text-primary-600 flex-shrink-0">
                      {item.qty}x
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-neutral-800">{item.productName}</span>
                      {item.note && (
                        <p className="text-xs text-neutral-500 italic mt-0.5">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-neutral-600 font-mono text-sm flex-shrink-0">
                  R$ {Number(item.unitPrice).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-500 italic">Sem itens</p>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-neutral-100">
          <span className="font-semibold text-neutral-700">TOTAL</span>
          <div className="flex items-center gap-2">
            {order.paymentStatus === 'paid' && (
              <Badge variant="success" size="sm">
                Pago
              </Badge>
            )}
            {order.paymentStatus === 'partial' && (
              <Badge variant="warning" size="sm">
                Parcial
              </Badge>
            )}
            <span className="text-2xl font-bold text-neutral-900 font-mono">
              R$ {Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        {(onUpdateStatus || onMarkAsPaid) && (
          <div className="flex gap-2 pt-2">
            {onUpdateStatus && order.status !== 'closed' && order.status !== 'canceled' && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStatus(order.id);
                }}
              >
                Atualizar Status
              </Button>
            )}
            {onMarkAsPaid && order.paymentStatus !== 'paid' && (
              <Button
                variant="success"
                size="sm"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsPaid(order.id);
                }}
              >
                Marcar como Pago
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
