import { KitchenTicket } from '../../types';
import { formatCurrency, formatRelativeTime } from '../../utils/currency';

interface TicketCardProps {
  ticket: KitchenTicket;
  onClick?: () => void;
}

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const itemsCount = ticket.order.items.reduce(
    (acc, item) => acc + item.qty,
    0
  );

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-lg font-bold text-primary-600">
            #{ticket.ticketNumber}
          </span>
          {ticket.order.code && (
            <p className="text-sm text-gray-600">{ticket.order.code}</p>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {formatRelativeTime(ticket.createdAt)}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {ticket.order.items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-900">
              {item.qty}x {item.productName}
            </span>
          </div>
        ))}
        {ticket.order.items.length > 3 && (
          <p className="text-xs text-gray-500">
            +{ticket.order.items.length - 3} itens
          </p>
        )}
      </div>

      {/* Notes */}
      {ticket.order.items.some((item) => item.note) && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <p className="font-medium text-yellow-900 mb-1">Observações:</p>
          {ticket.order.items
            .filter((item) => item.note)
            .map((item) => (
              <p key={item.id} className="text-yellow-800">
                • {item.productName}: {item.note}
              </p>
            ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span>{itemsCount} itens</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(ticket.order.totalAmount)}
        </span>
      </div>
    </div>
  );
}
