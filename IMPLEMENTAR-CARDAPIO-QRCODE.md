# 📱 Implementar Cardápio Online via QR Code

Guia completo para implementar a funcionalidade de cardápio online para clientes.

---

## 🎯 O que foi criado

### Frontend:
- ✅ **MenuPage.tsx** - Página pública de cardápio
- ⏳ Rota no App.tsx (aplicar manualmente)

### Backend (a criar):
- ⏳ Endpoint GET `/public/menu/:slug`
- ⏳ Endpoint POST `/public/orders`
- ⏳ Controller e Service públicos

---

## 📝 Alterações Necessárias

### 1. Adicionar rota no Frontend

**Arquivo:** `frontend/src/App.tsx`

**Adicionar import:**
```typescript
import { MenuPage } from './pages/MenuPage';
```

**Adicionar rota pública (após linha 42, antes das rotas protegidas):**
```typescript
<Routes>
  {/* Public routes */}
  <Route path="/login" element={<LoginPage />} />

  {/* Cardápio Público - SEM autenticação */}
  <Route path="/menu/:establishmentSlug" element={<MenuPage />} />

  {/* Admin Panel Routes ... */}
```

---

### 2. Criar Endpoint Público no Backend

**Arquivo:** `backend/src/modules/public/public.routes.ts` (CRIAR NOVO)

```typescript
import { FastifyInstance } from 'fastify';
import { publicController } from './public.controller';

export async function publicRoutes(fastify: FastifyInstance) {
  // GET /public/menu/:slug - Buscar cardápio público
  fastify.get('/menu/:slug', publicController.getMenu.bind(publicController));

  // POST /public/orders - Criar pedido do cliente (sem auth)
  fastify.post('/orders', publicController.createOrder.bind(publicController));
}
```

---

**Arquivo:** `backend/src/modules/public/public.controller.ts` (CRIAR NOVO)

```typescript
import { FastifyRequest, FastifyReply } from 'fastify';
import { publicService } from './public.service';
import { CreatePublicOrderSchema } from './public.schema';

export class PublicController {
  async getMenu(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    try {
      const { slug } = request.params;
      const menu = await publicService.getMenu(slug);

      return reply.code(200).send({
        success: true,
        data: menu,
      });
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        success: false,
        error: error.message,
      });
    }
  }

  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = CreatePublicOrderSchema.parse(request.body);
      const order = await publicService.createPublicOrder(data);

      return reply.code(201).send({
        success: true,
        data: order,
      });
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        success: false,
        error: error.message,
      });
    }
  }
}

export const publicController = new PublicController();
```

---

**Arquivo:** `backend/src/modules/public/public.service.ts` (CRIAR NOVO)

```typescript
import { prisma } from '../../shared/database/prisma.service';
import { NotFoundError } from '../../shared/utils/errors';
import type { CreatePublicOrderBody } from './public.schema';

export class PublicService {
  async getMenu(slug: string) {
    const establishment = await prisma.establishment.findFirst({
      where: {
        slug,
        isActive: true,
        onlineOrdering: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!establishment) {
      throw new NotFoundError('Cardápio não disponível');
    }

    const products = await prisma.product.findMany({
      where: {
        establishmentId: establishment.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return {
      establishment,
      products,
    };
  }

  async createPublicOrder(data: CreatePublicOrderBody) {
    // Buscar estabelecimento
    const establishment = await prisma.establishment.findFirst({
      where: {
        slug: data.establishmentSlug,
        isActive: true,
        onlineOrdering: true,
      },
    });

    if (!establishment) {
      throw new NotFoundError('Estabelecimento não encontrado');
    }

    // Buscar produtos
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        establishmentId: establishment.id,
        active: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundError('Um ou mais produtos não encontrados');
    }

    // Calcular total
    let totalAmount = 0;
    const orderItems = data.items.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      const subtotal = Number(product.price) * item.qty;
      totalAmount += subtotal;

      return {
        productId: item.productId,
        productName: product.name,
        qty: item.qty,
        unitPrice: product.price,
        note: item.note,
      };
    });

    // Criar ordem em transação
    const order = await prisma.$transaction(async tx => {
      const createdOrder = await tx.order.create({
        data: {
          establishmentId: establishment.id,
          code: data.code,
          customerName: data.customerName,
          status: 'open',
          paymentStatus: 'unpaid',
          totalAmount,
          paidAmount: 0,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Se estabelecimento tem cozinha, criar ticket
      if (establishment.hasKitchen) {
        await tx.kitchenTicket.create({
          data: {
            orderId: createdOrder.id,
            status: 'queue',
          },
        });
      }

      return createdOrder;
    });

    return order;
  }
}

export const publicService = new PublicService();
```

---

**Arquivo:** `backend/src/modules/public/public.schema.ts` (CRIAR NOVO)

```typescript
import { z } from 'zod';

export const CreatePublicOrderSchema = z.object({
  establishmentSlug: z.string().min(1),
  code: z.string().min(1, 'Mesa/Comanda é obrigatória'),
  customerName: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      qty: z.number().int().positive(),
      note: z.string().optional(),
    })
  ).min(1, 'Adicione pelo menos um produto'),
});

export type CreatePublicOrderBody = z.infer<typeof CreatePublicOrderSchema>;
```

---

### 3. Registrar Rotas Públicas no Server

**Arquivo:** `backend/src/server.ts`

**Adicionar import:**
```typescript
import { publicRoutes } from './modules/public/public.routes';
```

**Registrar rotas (após linha que registra outras rotas):**
```typescript
// Rotas públicas (SEM autenticação)
fastify.register(publicRoutes, { prefix: '/api/public' });
```

---

### 4. Adicionar campo `customerName` ao schema Order

**Arquivo:** `backend/prisma/schema.prisma`

**Adicionar campo ao model Order:**
```prisma
model Order {
  id              String   @id @default(uuid())
  establishmentId String   @map("establishment_id")
  code            String?
  customerName    String?  @map("customer_name") @db.VarChar(100)  // NOVO
  status          String   @default("open")
  paymentStatus   String   @default("unpaid") @map("payment_status")
  // ... resto dos campos
}
```

**Executar migração:**
```bash
cd backend
npx prisma migrate dev --name add_customer_name_to_order
npx prisma generate
```

---

### 5. Adicionar campo `category` aos Produtos (opcional)

**Arquivo:** `backend/prisma/schema.prisma`

```prisma
model Product {
  id              String   @id @default(uuid())
  establishmentId String   @map("establishment_id")
  name            String   @db.VarChar(100)
  description     String?  @db.Text
  price           Decimal  @db.Decimal(10, 2)
  category        String?  @db.VarChar(50)  // NOVO (opcional)
  imageUrl        String?  @map("image_url") @db.VarChar(500)
  active          Boolean  @default(true)
  // ... resto dos campos
}
```

---

## 🔧 Como Testar

### 1. Habilitar cardápio online no estabelecimento

**SQL direto no Supabase:**
```sql
UPDATE establishments
SET online_ordering = true
WHERE slug = 'seu-slug-aqui';
```

### 2. Acessar o cardápio

```
http://localhost:3000/menu/seu-slug-aqui
```

### 3. Fluxo completo:
1. Cliente escaneia QR Code
2. Abre URL `/menu/churrasquinho` (exemplo)
3. Vê produtos disponíveis
4. Adiciona ao carrinho
5. Informa mesa (ex: "Mesa 5")
6. Confirma pedido
7. Pedido vai para a cozinha/comandas
8. Garçom/Cozinha vê o pedido

---

## 📱 Gerar QR Code

### Opção 1: Online (qr-code-generator.com)
1. Acesse https://www.qr-code-generator.com/
2. Cole a URL: `https://app.seudominio.com/menu/seu-slug`
3. Baixe o QR Code
4. Imprima e coloque nas mesas

### Opção 2: Biblioteca JavaScript

**Instalar:**
```bash
cd frontend
npm install qrcode
```

**Componente:**
```typescript
import QRCode from 'qrcode';

const generateQRCode = async (slug: string) => {
  const url = `${window.location.origin}/menu/${slug}`;
  const qrCodeUrl = await QRCode.toDataURL(url);
  return qrCodeUrl;
};
```

---

## 🎨 Melhorias Futuras

- [ ] Adicionar fotos dos produtos
- [ ] Categorias de produtos
- [ ] Busca no cardápio
- [ ] Customização de cores (branding)
- [ ] Notificação para o garçom (WebSocket)
- [ ] Histórico de pedidos do cliente
- [ ] Avaliação de produtos
- [ ] Promoções e combos

---

## 📊 Resumo de Arquivos

### Criados:
- ✅ `frontend/src/pages/MenuPage.tsx`
- ⏳ `backend/src/modules/public/public.routes.ts`
- ⏳ `backend/src/modules/public/public.controller.ts`
- ⏳ `backend/src/modules/public/public.service.ts`
- ⏳ `backend/src/modules/public/public.schema.ts`

### Modificados:
- ⏳ `frontend/src/App.tsx` - adicionar rota
- ⏳ `backend/src/server.ts` - registrar rotas públicas
- ⏳ `backend/prisma/schema.prisma` - adicionar customerName e category

---

**Última atualização:** 14/10/2025

**Status:** Estrutura frontend criada. Backend precisa ser implementado.
