import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { PaymentStatusLabels, PaymentStatusColors } from '@/constants/enums';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items?: Array<
    Database['public']['Tables']['order_items']['Row'] & {
      products?: Database['public']['Tables']['products']['Row'];
    }
  >;
};

interface CashierOrderCardProps {
  order: Order;
  onPayment: () => void;
}

export const CashierOrderCard = ({ order, onPayment }: CashierOrderCardProps) => {
  const remaining = (order.total_amount || 0) - order.paid_amount;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-mono font-bold text-lg">#{order.code}</div>
              <div className="text-sm text-muted-foreground">
                {order.customer_name}
              </div>
            </div>
            <Badge
              variant="outline"
              className={PaymentStatusColors[order.payment_status]}
            >
              {PaymentStatusLabels[order.payment_status]}
            </Badge>
          </div>

          <div className="space-y-1">
            {order.order_items?.slice(0, 3).map((item) => (
              <div key={item.id} className="text-sm flex justify-between">
                <span className="text-muted-foreground">
                  {item.qty}x {item.products?.name}
                </span>
                <span>{formatCurrency(item.unit_price * item.qty)}</span>
              </div>
            ))}
            {order.order_items && order.order_items.length > 3 && (
              <div className="text-sm text-muted-foreground">
                +{order.order_items.length - 3} item(s)...
              </div>
            )}
          </div>

          <div className="pt-2 border-t space-y-1">
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>{formatCurrency(order.total_amount || 0)}</span>
            </div>
            {order.paid_amount > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pago:</span>
                  <span>{formatCurrency(order.paid_amount)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-destructive">
                  <span>Restante:</span>
                  <span>{formatCurrency(remaining)}</span>
                </div>
              </>
            )}
          </div>

          <Button className="w-full" onClick={onPayment}>
            <DollarSign className="mr-2 h-4 w-4" />
            Receber Pagamento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
