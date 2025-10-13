import { useMemo } from 'react';
import { KitchenTicket, KitchenTicketStatus } from '../../types';
import { TicketCard } from './TicketCard';
import { useKitchenStore } from '../../stores/kitchenStore';
import { useToast } from '../common/Toast';

interface KanbanBoardProps {
  tickets: KitchenTicket[];
}

const columns: {
  status: KitchenTicketStatus;
  title: string;
  color: string;
  nextStatus?: KitchenTicketStatus;
}[] = [
  {
    status: 'queue',
    title: 'Fila',
    color: 'bg-gray-100 border-gray-300',
    nextStatus: 'preparing',
  },
  {
    status: 'preparing',
    title: 'Em Preparo',
    color: 'bg-blue-50 border-blue-300',
    nextStatus: 'ready',
  },
  {
    status: 'ready',
    title: 'Pronto',
    color: 'bg-green-50 border-green-300',
    nextStatus: 'delivered',
  },
  {
    status: 'delivered',
    title: 'Entregue',
    color: 'bg-gray-50 border-gray-200',
  },
];

export function KanbanBoard({ tickets }: KanbanBoardProps) {
  const { updateTicketStatus } = useKitchenStore();
  const { showToast } = useToast();

  // Agrupar tickets por status
  const ticketsByStatus = useMemo(() => {
    const grouped: Record<KitchenTicketStatus, KitchenTicket[]> = {
      queue: [],
      preparing: [],
      ready: [],
      delivered: [],
    };

    tickets.forEach((ticket) => {
      grouped[ticket.status].push(ticket);
    });

    return grouped;
  }, [tickets]);

  const handleAdvanceStatus = async (ticket: KitchenTicket) => {
    const column = columns.find((col) => col.status === ticket.status);
    if (!column?.nextStatus) return;

    try {
      await updateTicketStatus(ticket.id, column.nextStatus);
      showToast(
        `Ticket #${ticket.ticketNumber} movido para ${
          columns.find((c) => c.status === column.nextStatus)?.title
        }`,
        'success'
      );
    } catch (error) {
      showToast('Erro ao atualizar ticket', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          column={column}
          tickets={ticketsByStatus[column.status]}
          onAdvance={handleAdvanceStatus}
        />
      ))}
    </div>
  );
}

interface KanbanColumnProps {
  column: (typeof columns)[0];
  tickets: KitchenTicket[];
  onAdvance: (ticket: KitchenTicket) => void;
}

function KanbanColumn({ column, tickets, onAdvance }: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div
        className={`rounded-t-lg border-2 ${column.color} p-3 flex items-center justify-between`}
      >
        <h3 className="font-semibold text-gray-900">{column.title}</h3>
        <span className="px-2 py-1 text-xs font-bold bg-white rounded-full">
          {tickets.length}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex-1 bg-gray-50 border-x-2 border-b-2 border-gray-200 rounded-b-lg p-3 overflow-y-auto space-y-3 min-h-[400px]">
        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Nenhum ticket
          </div>
        )}

        {tickets.map((ticket) => (
          <div key={ticket.id} className="relative group">
            <TicketCard ticket={ticket} />

            {/* Advance button */}
            {column.nextStatus && (
              <button
                onClick={() => onAdvance(ticket)}
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg"
              >
                Avançar →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
