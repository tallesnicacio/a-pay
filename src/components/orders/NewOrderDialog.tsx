import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productsApi, ordersApi, orderItemsApi, kitchenTicketsApi } from '@/services/api';
import { useEstablishment } from '@/contexts/EstablishmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateOrderCode, formatCurrency } from '@/utils/format';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Trash2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

interface CartItem {
  product: Product;
  quantity: number;
  note: string;
}

const orderSchema = z.object({
  customer_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface NewOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

export const NewOrderDialog = ({ open, onClose }: NewOrderDialogProps) => {
  const { currentEstablishment } = useEstablishment();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_name: '',
    },
  });

  // Fetch active products
  const { data: products } = useQuery({
    queryKey: ['products', 'active', currentEstablishment?.id],
    queryFn: () => productsApi.getActive(currentEstablishment!.id),
    enabled: !!currentEstablishment && open,
  });

  // Filter products by search
  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form and cart when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setCart([]);
      setSearchTerm('');
    }
  }, [open, form]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      // 1. Create order
      const orderCode = generateOrderCode();
      const total = cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const order = await ordersApi.create({
        establishment_id: currentEstablishment!.id,
        code: orderCode,
        customer_name: data.customer_name,
        status: 'open',
        payment_status: 'unpaid',
        total_amount: total,
        paid_amount: 0,
        created_by: user!.id,
      });

      // 2. Create order items
      const items = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        qty: item.quantity,
        unit_price: item.product.price,
        note: item.note || null,
      }));

      await orderItemsApi.createMany(items);

      // 3. Create kitchen ticket if establishment has kitchen
      if (currentEstablishment!.has_kitchen) {
        // Generate next ticket number (simplified version)
        const ticketNumber = Math.floor(Math.random() * 1000);

        await kitchenTicketsApi.create({
          order_id: order.id,
          establishment_id: currentEstablishment!.id,
          ticket_number: ticketNumber,
          status: 'queue',
        });
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['kitchen_tickets'] });
      toast.success('Pedido criado com sucesso');
      onClose();
    },
    onError: (error) => {
      toast.error('Erro ao criar pedido');
      console.error(error);
    },
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1, note: '' }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const updateNote = (productId: string, note: string) => {
    setCart(
      cart.map((item) =>
        item.product.id === productId ? { ...item, note } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const onSubmit = (data: OrderFormData) => {
    if (cart.length === 0) {
      toast.error('Adicione pelo menos um produto ao pedido');
      return;
    }

    createOrderMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Selecione os produtos e informe o nome do cliente
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden">
          {/* Products List */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <ScrollArea className="flex-1 rounded-md border">
              <div className="p-4 space-y-2">
                {filteredProducts?.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                    onClick={() => addToCart(product)}
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(product.price)}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {filteredProducts?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum produto encontrado
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Cart */}
          <div className="flex flex-col gap-3 min-h-0">
            <div className="font-semibold">Carrinho</div>

            <ScrollArea className="flex-1 rounded-md border">
              <div className="p-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Carrinho vazio
                  </p>
                ) : (
                  cart.map((item) => (
                    <div key={item.product.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(item.product.price)} x {item.quantity}
                          </div>
                        </div>
                        <div className="font-semibold">
                          {formatCurrency(item.product.price * item.quantity)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Input
                          placeholder="Observação..."
                          value={item.note}
                          onChange={(e) => updateNote(item.product.id, e.target.value)}
                          className="flex-1 h-8"
                        />

                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <Separator />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="space-y-3 pt-3 border-t">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createOrderMutation.isPending}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createOrderMutation.isPending || cart.length === 0}
                className="flex-1"
              >
                {createOrderMutation.isPending ? 'Criando...' : 'Criar Pedido'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
