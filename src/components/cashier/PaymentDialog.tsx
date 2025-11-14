import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, ordersApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/format';
import { PaymentMethod, PaymentMethodLabels } from '@/constants/enums';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];

const paymentSchema = z.object({
  method: z.enum(['cash', 'card', 'pix']),
  amount: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  received: z.coerce.number().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export const PaymentDialog = ({ order, open, onClose }: PaymentDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [change, setChange] = useState(0);

  const remaining = order ? (order.total_amount || 0) - order.paid_amount : 0;

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'cash',
      amount: 0,
      received: 0,
    },
  });

  const watchedMethod = form.watch('method');
  const watchedAmount = form.watch('amount');
  const watchedReceived = form.watch('received');

  // Calculate change
  useEffect(() => {
    if (watchedMethod === 'cash' && watchedReceived) {
      const changeAmount = watchedReceived - watchedAmount;
      setChange(changeAmount >= 0 ? changeAmount : 0);
    } else {
      setChange(0);
    }
  }, [watchedMethod, watchedAmount, watchedReceived]);

  // Reset form when order changes
  useEffect(() => {
    if (order && open) {
      form.reset({
        method: 'cash',
        amount: remaining,
        received: remaining,
      });
    }
  }, [order, open, remaining, form]);

  // Register payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      // 1. Register payment
      await paymentsApi.create({
        order_id: order!.id,
        method: data.method,
        amount: data.amount,
        received_by: user!.id,
        received_at: new Date().toISOString(),
      });

      // 2. Update order paid_amount and payment_status
      const newPaidAmount = order!.paid_amount + data.amount;
      const totalAmount = order!.total_amount || 0;

      let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'partial';
      if (newPaidAmount >= totalAmount) {
        paymentStatus = 'paid';
      } else if (newPaidAmount === 0) {
        paymentStatus = 'unpaid';
      }

      await ordersApi.update(order!.id, {
        paid_amount: newPaidAmount,
        payment_status: paymentStatus,
      });

      // 3. Close order if fully paid
      if (paymentStatus === 'paid') {
        await ordersApi.close(order!.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', order!.id] });
      toast.success('Pagamento registrado com sucesso');
      onClose();
    },
    onError: (error) => {
      toast.error('Erro ao registrar pagamento');
      console.error(error);
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    if (data.method === 'cash' && data.received && data.received < data.amount) {
      toast.error('Valor recebido é menor que o valor do pagamento');
      return;
    }

    paymentMutation.mutate(data);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento</DialogTitle>
          <DialogDescription>
            Pedido #{order.code} - {order.customer_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total do Pedido:</span>
              <span className="font-semibold">
                {formatCurrency(order.total_amount || 0)}
              </span>
            </div>
            {order.paid_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Já Pago:</span>
                <span>{formatCurrency(order.paid_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Restante:</span>
              <span className="font-bold text-primary">
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Payment Method */}
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-3 gap-4"
                      >
                        {Object.entries(PaymentMethodLabels).map(([value, label]) => (
                          <div key={value}>
                            <RadioGroupItem
                              value={value}
                              id={value}
                              className="peer sr-only"
                            />
                            <Label
                              htmlFor={value}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                            >
                              <span className="text-sm font-medium">{label}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Pagamento</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          {...field}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => form.setValue('amount', remaining)}
                        >
                          Total
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Valor em reais (R$)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cash Received (only for cash payment) */}
              {watchedMethod === 'cash' && (
                <FormField
                  control={form.control}
                  name="received"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Recebido</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Valor entregue pelo cliente
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Change Display */}
              {watchedMethod === 'cash' && change > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Troco:</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(change)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={paymentMutation.isPending}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={paymentMutation.isPending}
                  className="flex-1"
                >
                  {paymentMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
