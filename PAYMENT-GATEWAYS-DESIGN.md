# 💳 Integração com Gateways de Pagamento - Design Arquitetural

## 📋 Visão Geral

Documento de design para integração nativa com múltiplos provedores de pagamento (Stone, Mercado Pago, Rede, PagSeguro, etc).

---

## 🎯 Objetivos

1. **Multi-gateway**: Suportar múltiplos provedores simultaneamente
2. **Por estabelecimento**: Cada estabelecimento escolhe seus provedores
3. **Abstração**: Interface única independente do provedor
4. **Fallback**: Trocar de provedor automaticamente se um falhar
5. **Auditoria**: Registrar todas as transações

---

## 🏗️ Arquitetura Proposta

### 1. Pattern: Strategy + Factory

```
┌─────────────────────────────────────────────────────┐
│                  Payment Service                     │
│  (Orquestra os pagamentos independente do gateway)  │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │  Payment Factory  │
         │ (Cria o gateway)  │
         └─────────┬─────────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│  Stone   │ │  Mercado │ │   Rede   │
│ Adapter  │ │   Pago   │ │ Adapter  │
│          │ │ Adapter  │ │          │
└──────────┘ └──────────┘ └──────────┘
```

---

## 📁 Estrutura de Arquivos

```
backend/src/modules/payments/
├── payment.service.ts           # Orquestrador principal
├── payment.schema.ts            # Validações Zod
├── payment.routes.ts            # Rotas da API
├── payment.controller.ts        # Controllers
│
├── interfaces/
│   └── payment-gateway.interface.ts  # Interface comum
│
├── gateways/
│   ├── gateway-factory.ts       # Factory pattern
│   ├── stone/
│   │   ├── stone-adapter.ts     # Implementação Stone
│   │   ├── stone.types.ts       # Types específicos
│   │   └── stone.config.ts      # Configurações
│   │
│   ├── mercadopago/
│   │   ├── mercadopago-adapter.ts
│   │   ├── mercadopago.types.ts
│   │   └── mercadopago.config.ts
│   │
│   ├── rede/
│   │   └── ...
│   │
│   └── pagseguro/
│       └── ...
│
└── models/
    ├── payment-transaction.ts   # Modelo de transação
    └── payment-config.ts        # Config por estabelecimento
```

---

## 🔧 Interface Comum

### `payment-gateway.interface.ts`

```typescript
export interface PaymentGatewayConfig {
  apiKey: string;
  merchantId: string;
  environment: 'sandbox' | 'production';
  webhookUrl?: string;
}

export interface PaymentRequest {
  amount: number;              // Em centavos (ex: 1050 = R$ 10,50)
  orderId: string;
  description: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'boleto';

  // Para cartão
  card?: {
    number: string;
    holderName: string;
    expirationMonth: string;
    expirationYear: string;
    cvv: string;
  };

  // Para PIX
  pix?: {
    expirationMinutes?: number;
  };

  // Dados do cliente
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string;  // CPF/CNPJ
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;        // ID do gateway
  status: PaymentStatus;
  amount: number;

  // Para PIX
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  pixExpiresAt?: Date;

  // Para Boleto
  boletoUrl?: string;
  boletoBarcode?: string;
  boletoExpiresAt?: Date;

  // Detalhes do erro
  errorMessage?: string;
  errorCode?: string;

  // Raw response do gateway
  rawResponse?: any;
}

export enum PaymentStatus {
  PENDING = 'pending',           // Aguardando pagamento (PIX/boleto)
  PROCESSING = 'processing',     // Processando
  APPROVED = 'approved',         // Aprovado
  DECLINED = 'declined',         // Recusado
  CANCELED = 'canceled',         // Cancelado
  REFUNDED = 'refunded',         // Estornado
  EXPIRED = 'expired',           // Expirado
}

export interface IPaymentGateway {
  // Configuração
  configure(config: PaymentGatewayConfig): void;

  // Processar pagamento
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;

  // Consultar status
  getPaymentStatus(transactionId: string): Promise<PaymentResponse>;

  // Cancelar/Estornar
  cancelPayment(transactionId: string): Promise<PaymentResponse>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse>;

  // Webhook
  verifyWebhook(payload: any, signature: string): boolean;
  parseWebhook(payload: any): WebhookEvent;
}

export interface WebhookEvent {
  type: 'payment.approved' | 'payment.declined' | 'payment.refunded';
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  timestamp: Date;
}
```

---

## 🏭 Factory Pattern

### `gateway-factory.ts`

```typescript
import { IPaymentGateway } from '../interfaces/payment-gateway.interface';
import { StoneAdapter } from './stone/stone-adapter';
import { MercadoPagoAdapter } from './mercadopago/mercadopago-adapter';
import { RedeAdapter } from './rede/rede-adapter';

export type GatewayProvider = 'stone' | 'mercadopago' | 'rede' | 'pagseguro';

export class PaymentGatewayFactory {
  static create(provider: GatewayProvider): IPaymentGateway {
    switch (provider) {
      case 'stone':
        return new StoneAdapter();

      case 'mercadopago':
        return new MercadoPagoAdapter();

      case 'rede':
        return new RedeAdapter();

      case 'pagseguro':
        throw new Error('PagSeguro: Em breve');

      default:
        throw new Error(`Gateway não suportado: ${provider}`);
    }
  }

  static getSupportedGateways(): GatewayProvider[] {
    return ['stone', 'mercadopago', 'rede'];
  }
}
```

---

## 📝 Schema Prisma

```prisma
// Configuração de gateway por estabelecimento
model PaymentGatewayConfig {
  id              String   @id @default(uuid()) @db.Uuid
  establishmentId String   @map("establishment_id") @db.Uuid
  provider        String   @db.VarChar(50)  // 'stone', 'mercadopago', etc

  // Credenciais (criptografadas!)
  apiKey          String   @map("api_key") @db.Text
  merchantId      String?  @map("merchant_id") @db.VarChar(255)

  // Config
  environment     String   @default("sandbox") @db.VarChar(20)  // sandbox | production
  active          Boolean  @default(true)
  priority        Int      @default(1)  // Ordem de tentativa (1 = primeiro)

  // Limites
  maxAmount       Decimal? @map("max_amount") @db.Decimal(10, 2)
  minAmount       Decimal? @map("min_amount") @db.Decimal(10, 2)

  // Métodos suportados
  supportsCredit  Boolean  @default(true) @map("supports_credit")
  supportsDebit   Boolean  @default(true) @map("supports_debit")
  supportsPix     Boolean  @default(false) @map("supports_pix")
  supportsBoleto  Boolean  @default(false) @map("supports_boleto")

  // Webhook
  webhookUrl      String?  @map("webhook_url") @db.Text
  webhookSecret   String?  @map("webhook_secret") @db.Text

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  establishment   Establishment @relation(fields: [establishmentId], references: [id], onDelete: Cascade)
  transactions    PaymentTransaction[]

  @@unique([establishmentId, provider])
  @@index([establishmentId, active])
  @@map("payment_gateway_configs")
}

// Transações de pagamento
model PaymentTransaction {
  id              String   @id @default(uuid()) @db.Uuid
  orderId         String   @map("order_id") @db.Uuid
  gatewayConfigId String   @map("gateway_config_id") @db.Uuid

  // IDs
  transactionId   String   @map("transaction_id") @db.VarChar(255)  // ID do gateway
  externalId      String?  @map("external_id") @db.VarChar(255)     // ID extra

  // Valores
  amount          Decimal  @db.Decimal(10, 2)
  currency        String   @default("BRL") @db.VarChar(3)

  // Status
  status          PaymentTransactionStatus
  paymentMethod   PaymentMethod @map("payment_method")

  // PIX
  pixQrCode       String?  @map("pix_qr_code") @db.Text
  pixExpiresAt    DateTime? @map("pix_expires_at")

  // Boleto
  boletoUrl       String?  @map("boleto_url") @db.Text
  boletoBarcode   String?  @map("boleto_barcode") @db.VarChar(255)
  boletoExpiresAt DateTime? @map("boleto_expires_at")

  // Erros
  errorMessage    String?  @map("error_message") @db.Text
  errorCode       String?  @map("error_code") @db.VarChar(50)

  // Metadata
  customerName    String   @map("customer_name") @db.VarChar(255)
  customerEmail   String   @map("customer_email") @db.VarChar(255)
  customerDocument String  @map("customer_document") @db.VarChar(20)

  // Raw response do gateway (para debug)
  rawResponse     Json?    @map("raw_response") @db.JsonB

  // Timestamps
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  paidAt          DateTime? @map("paid_at")

  // Relations
  order           Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  gatewayConfig   PaymentGatewayConfig @relation(fields: [gatewayConfigId], references: [id])

  @@index([orderId])
  @@index([transactionId])
  @@index([status])
  @@map("payment_transactions")
}

enum PaymentTransactionStatus {
  pending
  processing
  approved
  declined
  canceled
  refunded
  expired
}
```

---

## 🎯 Service Principal

### `payment.service.ts`

```typescript
export class PaymentService {
  /**
   * Processa um pagamento tentando gateways em ordem de prioridade
   */
  async processPayment(
    orderId: string,
    establishmentId: string,
    request: PaymentRequest
  ): Promise<PaymentResponse> {

    // 1. Buscar gateways ativos do estabelecimento (ordenados por priority)
    const configs = await this.getActiveGateways(establishmentId, request.paymentMethod);

    if (configs.length === 0) {
      throw new BadRequestError('Nenhum gateway de pagamento configurado');
    }

    // 2. Tentar cada gateway (fallback automático)
    for (const config of configs) {
      try {
        // Criar adapter do gateway
        const gateway = PaymentGatewayFactory.create(config.provider);

        // Configurar com credenciais
        gateway.configure({
          apiKey: this.decrypt(config.apiKey),
          merchantId: config.merchantId,
          environment: config.environment,
        });

        // Processar pagamento
        const response = await gateway.processPayment(request);

        // Salvar transação no banco
        await this.saveTransaction(orderId, config.id, response);

        // Criar audit log
        await createAuditLog({
          action: 'payment.processed',
          entity: 'payment',
          entityId: response.transactionId,
          payload: { gateway: config.provider, status: response.status },
        });

        return response;

      } catch (error) {
        // Log do erro mas continua tentando próximo gateway
        logger.error(`Gateway ${config.provider} falhou:`, error);

        // Se for o último, relança o erro
        if (config === configs[configs.length - 1]) {
          throw error;
        }
      }
    }
  }

  /**
   * Processa webhook de gateway
   */
  async handleWebhook(
    provider: GatewayProvider,
    payload: any,
    signature: string
  ): Promise<void> {

    // Criar adapter
    const gateway = PaymentGatewayFactory.create(provider);

    // Verificar assinatura
    if (!gateway.verifyWebhook(payload, signature)) {
      throw new UnauthorizedError('Webhook inválido');
    }

    // Parsear evento
    const event = gateway.parseWebhook(payload);

    // Atualizar transação
    await prisma.paymentTransaction.update({
      where: { transactionId: event.transactionId },
      data: {
        status: event.status,
        paidAt: event.status === 'approved' ? new Date() : undefined,
      },
    });

    // Se aprovado, atualizar order
    if (event.status === 'approved') {
      const transaction = await prisma.paymentTransaction.findUnique({
        where: { transactionId: event.transactionId },
      });

      await ordersService.markAsPaid(transaction.orderId, {
        method: 'card',  // ou pix, etc
        amount: event.amount,
      });
    }
  }
}
```

---

## 📱 Exemplo de Implementação: Stone

### `stone-adapter.ts`

```typescript
import axios from 'axios';
import { IPaymentGateway, PaymentRequest, PaymentResponse } from '../interfaces';

export class StoneAdapter implements IPaymentGateway {
  private config: PaymentGatewayConfig;
  private baseUrl: string;

  configure(config: PaymentGatewayConfig): void {
    this.config = config;
    this.baseUrl = config.environment === 'production'
      ? 'https://api.stone.com.br'
      : 'https://sandbox-api.stone.com.br';
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Mapear para formato da Stone
      const stoneRequest = {
        amount: request.amount,
        currency: 'BRL',
        payment_method: this.mapPaymentMethod(request.paymentMethod),
        order_id: request.orderId,
        customer: {
          name: request.customer.name,
          email: request.customer.email,
          document: request.customer.document,
        },
      };

      // Se for cartão
      if (request.card) {
        stoneRequest.card = {
          number: request.card.number,
          holder_name: request.card.holderName,
          exp_month: request.card.expirationMonth,
          exp_year: request.card.expirationYear,
          cvv: request.card.cvv,
        };
      }

      // Chamar API da Stone
      const response = await axios.post(
        `${this.baseUrl}/v1/payments`,
        stoneRequest,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Mapear resposta
      return {
        success: response.data.status === 'approved',
        transactionId: response.data.id,
        status: this.mapStatus(response.data.status),
        amount: response.data.amount,
        rawResponse: response.data,
      };

    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          transactionId: '',
          status: PaymentStatus.DECLINED,
          amount: request.amount,
          errorMessage: error.response?.data?.message || error.message,
          errorCode: error.response?.data?.code,
        };
      }
      throw error;
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    const response = await axios.get(
      `${this.baseUrl}/v1/payments/${transactionId}`,
      {
        headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
      }
    );

    return {
      success: response.data.status === 'approved',
      transactionId: response.data.id,
      status: this.mapStatus(response.data.status),
      amount: response.data.amount,
    };
  }

  // Outros métodos...

  private mapPaymentMethod(method: string): string {
    const map = {
      'credit_card': 'credit',
      'debit_card': 'debit',
      'pix': 'pix',
    };
    return map[method] || method;
  }

  private mapStatus(stoneStatus: string): PaymentStatus {
    const map = {
      'approved': PaymentStatus.APPROVED,
      'declined': PaymentStatus.DECLINED,
      'pending': PaymentStatus.PENDING,
      'processing': PaymentStatus.PROCESSING,
    };
    return map[stoneStatus] || PaymentStatus.PENDING;
  }
}
```

---

## 🔐 Segurança

### 1. Criptografia de Credenciais

```typescript
import crypto from 'crypto';

export class CredentialsEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor() {
    // Usar chave do env (32 bytes)
    this.key = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Retornar: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encrypted: string): string {
    const [ivHex, authTagHex, encryptedText] = encrypted.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### 2. Validação de Webhook

```typescript
verifyWebhook(payload: any, signature: string): boolean {
  const secret = this.config.webhookSecret;
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 📊 Fluxo Completo

```
1. Cliente faz pedido no frontend
   ↓
2. Frontend chama POST /api/payments
   ↓
3. Backend valida e processa:
   - Busca gateways ativos do estabelecimento
   - Tenta gateway com priority=1 (ex: Stone)
   - Se falhar, tenta priority=2 (ex: Mercado Pago)
   ↓
4. Gateway processa pagamento
   ↓
5. Backend salva transação no DB
   ↓
6. Retorna resposta ao frontend:
   - Se PIX: QR Code
   - Se cartão: Aprovado/Recusado
   ↓
7. Gateway envia webhook (async)
   ↓
8. Backend recebe POST /api/webhooks/:provider
   ↓
9. Valida assinatura e atualiza status
   ↓
10. Se aprovado, marca order como paga
```

---

## 💰 Custos Estimados

| Gateway | Taxa por Transação | Mensalidade | PIX | Boleto |
|---------|-------------------|-------------|-----|--------|
| Stone | 2,99% | R$ 0 | 0,99% | R$ 3,50 |
| Mercado Pago | 4,99% | R$ 0 | 0,99% | R$ 3,49 |
| Rede | 2,75% | R$ 49,90 | - | R$ 2,90 |
| PagSeguro | 3,99% | R$ 0 | 0,99% | R$ 3,50 |

---

## 🚀 Implementação por Fases

### Fase 1: MVP (2 semanas)
- ✅ Interface base (IPaymentGateway)
- ✅ Factory pattern
- ✅ Schema Prisma
- ✅ 1 gateway (Stone ou Mercado Pago)
- ✅ Apenas cartão de crédito

### Fase 2: Expansão (1 semana)
- ✅ Mais 2 gateways
- ✅ Suporte a PIX
- ✅ Webhooks
- ✅ Fallback automático

### Fase 3: Avançado (1 semana)
- ✅ Boleto
- ✅ Parcelamento
- ✅ Dashboard de transações
- ✅ Relatórios financeiros

---

## 📚 Referências

- [Stone API](https://docs.stone.com.br/)
- [Mercado Pago API](https://www.mercadopago.com.br/developers/pt/docs)
- [Rede API](https://www.userede.com.br/desenvolvedores)
- [PagSeguro API](https://dev.pagseguro.uol.com.br/)

---

## ✅ Checklist de Implementação

- [ ] Criar interfaces base
- [ ] Implementar factory
- [ ] Adicionar schema Prisma
- [ ] Implementar 1º adapter (Stone)
- [ ] Testar em sandbox
- [ ] Implementar webhooks
- [ ] Adicionar criptografia
- [ ] Implementar fallback
- [ ] Testes unitários
- [ ] Documentação Swagger
- [ ] Dashboard admin
- [ ] Ir para produção

---

**Complexidade estimada**: Média-Alta
**Tempo estimado**: 3-4 semanas (1 dev full-time)
**Valor agregado**: Alto (essencial para food trucks)
