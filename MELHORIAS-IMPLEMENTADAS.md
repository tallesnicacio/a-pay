# Melhorias Implementadas - APay

## Data: 2025-10-14

## 1. Correção de Autenticação para Funcionários

### Problema
Funcionários criados pelo painel admin/owner não conseguiam fazer login, recebendo erro "invalid login credentials".

### Causa Raiz
O sistema migrou para **Supabase Auth**, mas o código de criação de funcionários apenas criava o usuário na tabela `users` do banco de dados, não no **Supabase Auth** (necessário para login).

### Solução Implementada

**Arquivo modificado:** `backend/src/modules/employees/employees.service.ts`

Mudanças principais:

1. **Importação do Supabase Admin SDK:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

2. **Criação de usuário no Supabase Auth primeiro:**
```typescript
const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
  email: data.email,
  password: data.password,
  email_confirm: true, // Auto-confirmar email
  user_metadata: {
    name: data.name,
  },
});
```

3. **Sincronização do UUID entre Supabase Auth e banco de dados:**
```typescript
const user = await tx.user.create({
  data: {
    id: supabaseUser.user.id, // ✅ Usar o mesmo UUID do Supabase
    email: data.email,
    name: data.name,
    password: hashedPassword,
    active: true,
  },
});
```

4. **Atualização de usuários também atualiza Supabase Auth:**
- Mudança de email sincronizada
- Status active/inactive usa ban/unban do Supabase

5. **Deleção remove do Supabase Auth:**
```typescript
await supabase.auth.admin.deleteUser(userRole.userId);
```

### Resultado
✅ Funcionários criados pelo painel agora conseguem fazer login normalmente
✅ Mudanças de email/status são sincronizadas com Supabase Auth
✅ Deleção remove o usuário completamente

---

## 2. Adição de Campos para Cardápio Online

### Objetivo
Preparar o sistema para funcionalidade de **cardápio online via QR Code** onde clientes podem:
1. Escanear QR Code na mesa
2. Ver cardápio com fotos e descrições
3. Fazer pedidos diretamente
4. Pedidos vão automaticamente para a cozinha

### Mudanças no Schema

**Arquivo modificado:** `backend/prisma/schema.prisma`

#### 2.1. Product (Produtos)

Campos adicionados:
```prisma
model Product {
  // ... campos existentes
  description     String?  @db.Text // Descrição do produto para o cardápio
  imageUrl        String?  @map("image_url") @db.VarChar(500) // URL da imagem do produto
  // ... rest
}
```

**Propósito:**
- `description`: Texto detalhado do produto para exibição no cardápio online
- `imageUrl`: Link para imagem do produto (pode ser Supabase Storage, Cloudinary, etc.)

#### 2.2. Establishment (Estabelecimentos)

Campo adicionado:
```prisma
model Establishment {
  // ... campos existentes
  onlineOrdering Boolean  @default(false) @map("online_ordering") // Habilita cardápio online via QR Code
  // ... rest
}
```

**Propósito:**
- Flag configurável para habilitar/desabilitar cardápio online por estabelecimento
- Default `false` = desabilitado (não afeta estabelecimentos existentes)

### Migração SQL

**Arquivo criado:** `add-product-menu-fields.sql`

Para aplicar as mudanças no banco de dados Supabase:

```sql
-- 1. Adicionar campos ao Product
ALTER TABLE products
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- 2. Adicionar campo onlineOrdering ao Establishment
ALTER TABLE establishments
ADD COLUMN IF NOT EXISTS online_ordering BOOLEAN DEFAULT FALSE NOT NULL;
```

**Como aplicar:**
1. Acesse o Supabase Dashboard: https://jetighbfmwlzanbkwyfn.supabase.co
2. Vá em "SQL Editor"
3. Cole o conteúdo de `add-product-menu-fields.sql`
4. Execute
5. Depois, execute `npx prisma generate` no backend para atualizar o Prisma Client

---

## 3. Próximos Passos

### 3.1. Backend - Atualizar APIs de Product

**Arquivos a modificar:**
- `backend/src/modules/products/products.schema.ts` - Adicionar validação para `description` e `imageUrl`
- `backend/src/modules/products/products.service.ts` - Incluir novos campos no CRUD
- `backend/src/modules/products/products.controller.ts` - Aceitar novos campos

**Exemplo de schema update:**
```typescript
export const CreateProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(), // ✅ Novo
  imageUrl: z.string().url().max(500).optional(), // ✅ Novo
  price: z.number().positive(),
  active: z.boolean().default(true),
});
```

### 3.2. Frontend - Atualizar Types

**Arquivo:** `frontend/src/types/index.ts`

```typescript
export interface Product {
  id: string;
  establishmentId: string;
  name: string;
  description?: string; // ✅ Adicionar
  imageUrl?: string; // ✅ Adicionar
  price: number;
  active: boolean;
  createdAt: string;
}
```

**Arquivo:** `frontend/src/types/index.ts` (EstablishmentDetails)

```typescript
export interface EstablishmentDetails extends Establishment {
  slug: string;
  hasKitchen: boolean;
  hasOrders: boolean;
  hasReports: boolean;
  onlineOrdering: boolean; // ✅ Adicionar
  isActive: boolean;
  createdAt: string;
  // ...
}
```

### 3.3. UI - Melhorar Seleção de Produtos

**Criar novo componente:** `frontend/src/components/common/ProductCard.tsx`

Funcionalidades:
- Exibir imagem do produto (ou placeholder se não tiver)
- Nome e descrição
- Preço destacado
- Botão de adicionar
- Layout responsivo (grid)

**Atualizar página:** `frontend/src/pages/NewOrderPage.tsx`

Trocar lista simples por grid de cards com fotos.

### 3.4. UI - Formulário de Produto

**Atualizar:** Formulários de criar/editar produto

Adicionar campos:
- **Descrição:** Textarea com contador de caracteres (max 1000)
- **Imagem do Produto:**
  - Upload de imagem (Supabase Storage)
  - Ou campo de URL manual
  - Preview da imagem

### 3.5. Configuração de Estabelecimento

**Atualizar:** Página de configurações do estabelecimento

Adicionar toggle:
```tsx
<Toggle
  label="Cardápio Online (QR Code)"
  description="Permite que clientes façam pedidos via QR Code escaneado na mesa"
  checked={establishment.onlineOrdering}
  onChange={(value) => updateEstablishment({ onlineOrdering: value })}
/>
```

### 3.6. Implementar Cardápio Online (Feature Futura)

**Nova rota pública:** `https://menu.localhost/:slug`

Funcionalidades:
1. **Landing page do cardápio:**
   - Logotipo do estabelecimento
   - Lista de produtos com fotos e descrições
   - Filtros por categoria (futura feature)
   - Carrinho de compras

2. **Fluxo de pedido:**
   - Cliente seleciona produtos
   - Adiciona observações
   - Informa nome/mesa
   - Confirma pedido
   - Pedido vai para `/orders` (status: open)
   - Se kitchen habilitado, cria ticket automaticamente

3. **Geração de QR Code:**
   - Admin pode gerar QR Codes para cada mesa
   - QR Code aponta para `https://menu.localhost/:slug?table=1`
   - Mesa pré-selecionada automaticamente

---

## 4. Arquivos Modificados

### Backend
- ✅ `backend/src/modules/employees/employees.service.ts` - Integração Supabase Auth
- ✅ `backend/prisma/schema.prisma` - Novos campos Product e Establishment
- ✅ `add-product-menu-fields.sql` - Migração SQL

### Pendente (Próximos Passos)
- ⏳ `backend/src/modules/products/products.schema.ts`
- ⏳ `backend/src/modules/products/products.service.ts`
- ⏳ `backend/src/modules/products/products.controller.ts`
- ⏳ `frontend/src/types/index.ts`
- ⏳ `frontend/src/components/common/ProductCard.tsx` (novo)
- ⏳ `frontend/src/pages/NewOrderPage.tsx`
- ⏳ Página de configurações do estabelecimento

---

## 5. Como Testar

### Teste 1: Criação de Funcionário

1. Login como admin ou owner
2. Acesse a página de funcionários
3. Crie um novo funcionário com:
   - Email: `funcionario@test.com`
   - Senha: `senha123`
   - Role: `user`
   - Permissões: Habilitar Cozinha e Comandas
4. **Logout**
5. **Login** com o email do funcionário criado
6. ✅ Deve conseguir entrar sem erro "invalid credentials"

### Teste 2: Migração do Banco

1. Acesse Supabase Dashboard
2. SQL Editor
3. Execute o conteúdo de `add-product-menu-fields.sql`
4. Verifique que os campos foram criados:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products'
AND column_name IN ('description', 'image_url');

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'establishments'
AND column_name = 'online_ordering';
```

### Teste 3: Prisma Client

1. No backend:
```bash
npx prisma generate
```

2. Verificar que não há erros de geração
3. Verificar tipos TypeScript atualizados

---

## 6. Observações Importantes

### Supabase Storage para Imagens

Para hospedar imagens de produtos, recomendo usar **Supabase Storage**:

1. Criar bucket público `product-images`
2. Upload via API ou Dashboard
3. URL pattern: `https://jetighbfmwlzanbkwyfn.supabase.co/storage/v1/object/public/product-images/{filename}`

### Alternativa: Cloudinary

Se preferir Cloudinary:
- Criar conta free (10GB, 25k transformações/mês)
- Upload via SDK
- URLs automáticos com otimização

### Validação de URL de Imagem

No schema, validar:
```typescript
imageUrl: z.string()
  .url('URL inválida')
  .refine(
    (url) => url.match(/\.(jpg|jpeg|png|gif|webp)$/i),
    'URL deve apontar para uma imagem'
  )
  .optional()
```

---

## 7. Resumo

### ✅ Concluído

1. **Autenticação de funcionários corrigida**
   - Integração completa com Supabase Auth
   - CRUD sincronizado (create, update, delete)

2. **Schema atualizado para cardápio online**
   - Product: description, imageUrl
   - Establishment: onlineOrdering
   - Migração SQL criada

### ⏳ Próximos Passos

1. Aplicar migração SQL no Supabase
2. Atualizar backend APIs de Product
3. Atualizar frontend types
4. Criar componente ProductCard
5. Melhorar UI de seleção de produtos
6. Implementar configuração de onlineOrdering
7. (Futuro) Implementar cardápio público via QR Code

---

**Desenvolvedor:** Claude (Anthropic)
**Data:** 2025-10-14
**Projeto:** APay - Sistema de Gestão para Estabelecimentos
