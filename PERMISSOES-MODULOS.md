# 🔐 Sistema de Permissões e Módulos

**Última atualização**: 2025-10-15

---

## 📋 Visão Geral

O A-Pay implementa um sistema de permissões baseado em **roles** (papéis) e **configurações de estabelecimento**. O acesso aos módulos é controlado por dois níveis:

1. **Configuração do Estabelecimento** - Define quais módulos estão disponíveis
2. **Role do Usuário** - Define o nível de acesso do usuário

---

## 🎭 Roles (Papéis)

### 1. **admin_global** - Administrador Global
- ✅ Acesso total a todos os estabelecimentos
- ✅ Acesso a todos os módulos
- ✅ Gerenciar estabelecimentos, usuários e roles
- ✅ Bypass de todas as restrições de módulos
- 📍 **Escopo**: Global (todos os estabelecimentos)

### 2. **owner** - Proprietário
- ✅ Acesso total ao estabelecimento vinculado
- ✅ Acesso a todos os módulos do estabelecimento
- ✅ Gerenciar produtos e funcionários
- ✅ Visualizar relatórios
- 📍 **Escopo**: Estabelecimento específico

### 3. **user** - Funcionário
- ✅ Acesso automático aos módulos **Comandas** e **Cozinha** (se habilitados)
- ⚠️ Acesso a **Relatórios** requer permissão específica
- ❌ Não pode gerenciar produtos ou funcionários
- 📍 **Escopo**: Estabelecimento específico

---

## 🏢 Configurações do Estabelecimento

Cada estabelecimento pode habilitar/desabilitar módulos específicos:

```typescript
interface Establishment {
  hasKitchen: boolean;    // Módulo Cozinha
  hasOrders: boolean;     // Módulo Comandas
  hasReports: boolean;    // Módulo Relatórios
  onlineOrdering: boolean; // Cardápio Online (QR Code)
}
```

### Exemplos:

**Flames Steak Burger:**
```json
{
  "hasKitchen": true,
  "hasOrders": true,
  "hasReports": true,
  "onlineOrdering": false
}
```

**Cervejaria Alteza:**
```json
{
  "hasKitchen": false,
  "hasOrders": true,
  "hasReports": true,
  "onlineOrdering": false
}
```

---

## 🔓 Matriz de Permissões

| Módulo | admin_global | owner | user (funcionário) |
|--------|--------------|-------|--------------------|
| **Dashboard** | ✅ Sempre | ✅ Sempre | ✅ Sempre |
| **Comandas** | ✅ Sempre | ✅ Se habilitado | ✅ Se habilitado |
| **Cozinha** | ✅ Sempre | ✅ Se habilitado | ✅ Se habilitado |
| **Relatórios** | ✅ Sempre | ✅ Se habilitado | ⚠️ Se habilitado + permissão |
| **Produtos** | ✅ Sempre | ✅ Sempre | ❌ Nunca |
| **Funcionários** | ✅ Sempre | ✅ Sempre | ❌ Nunca |
| **Admin** | ✅ Sempre | ❌ Nunca | ❌ Nunca |

---

## 📝 Lógica de Acesso (Código)

### 1. Comandas (Orders)
```typescript
const hasOrdersAccess =
  isAdminGlobal ||
  (currentEstablishment &&
   currentEstablishment.hasOrders !== false &&
   (isOwner || isUser));
```

✅ **Acesso concedido se:**
- Usuário é admin_global, OU
- Estabelecimento tem módulo habilitado E (usuário é owner OU user)

### 2. Cozinha (Kitchen)
```typescript
const hasKitchenAccess =
  isAdminGlobal ||
  (currentEstablishment &&
   currentEstablishment.hasKitchen === true &&
   (isOwner || isUser));
```

✅ **Acesso concedido se:**
- Usuário é admin_global, OU
- Estabelecimento tem módulo **explicitamente habilitado** E (usuário é owner OU user)

### 3. Relatórios (Reports)
```typescript
const hasReportsAccess =
  isAdminGlobal ||
  (currentEstablishment &&
   currentEstablishment.hasReports !== false &&
   (isOwner || (isUser && userRole?.permissions?.modules?.reports)));
```

✅ **Acesso concedido se:**
- Usuário é admin_global, OU
- Estabelecimento tem módulo habilitado E:
  - Usuário é owner, OU
  - Usuário é user **E tem permissão específica**

### 4. Produtos e Funcionários
```typescript
const hasProductsAccess = isAdminGlobal || (currentEstablishment && isOwner);
const hasEmployeesAccess = isAdminGlobal || (currentEstablishment && isOwner);
```

✅ **Acesso concedido se:**
- Usuário é admin_global, OU
- Usuário é owner do estabelecimento

---

## 🎯 Permissões Granulares (JSON)

Funcionários podem ter permissões granulares armazenadas no campo `permissions`:

```json
{
  "modules": {
    "orders": true,
    "kitchen": true,
    "reports": false
  }
}
```

### Quando usar:
- ⚠️ **Relatórios**: Requer permissão explícita para funcionários
- ✅ **Comandas e Cozinha**: Acesso automático se módulo habilitado

### ⚠️ IMPORTANTE:
A partir de **15/10/2025**, funcionários **NÃO precisam** de permissões granulares para acessar **Comandas** e **Cozinha**. Esses módulos são automaticamente acessíveis se estiverem habilitados no estabelecimento.

---

## 🔄 Fluxo de Verificação

```
1. Usuário faz login
   ↓
2. Sistema carrega roles e estabelecimentos
   ↓
3. Usuário seleciona estabelecimento (se tiver múltiplos)
   ↓
4. Sistema verifica:
   a) Role do usuário (admin_global, owner, user)
   b) Configurações do estabelecimento (hasKitchen, hasOrders, etc)
   c) Permissões granulares (apenas para Relatórios)
   ↓
5. Interface mostra apenas módulos permitidos
```

---

## 📊 Exemplos Práticos

### Exemplo 1: Funcionário na Cervejaria Alteza
```
User: João Silva
Role: user
Estabelecimento: Cervejaria Alteza
  - hasKitchen: false
  - hasOrders: true
  - hasReports: true

Resultado:
✅ Dashboard
✅ Comandas (habilitado automaticamente)
❌ Cozinha (módulo desabilitado no estabelecimento)
❌ Relatórios (precisa de permissão granular)
❌ Produtos
❌ Funcionários
```

### Exemplo 2: Funcionário no Flames Steak Burger
```
User: Maria Santos
Role: user
Estabelecimento: Flames Steak Burger
  - hasKitchen: true
  - hasOrders: true
  - hasReports: true
Permissions: { modules: { reports: true } }

Resultado:
✅ Dashboard
✅ Comandas (habilitado automaticamente)
✅ Cozinha (habilitado automaticamente)
✅ Relatórios (tem permissão granular)
❌ Produtos
❌ Funcionários
```

### Exemplo 3: Owner do Flames Steak Burger
```
User: Pedro Oliveira
Role: owner
Estabelecimento: Flames Steak Burger
  - hasKitchen: true
  - hasOrders: true
  - hasReports: true

Resultado:
✅ Dashboard
✅ Comandas
✅ Cozinha
✅ Relatórios
✅ Produtos
✅ Funcionários
❌ Admin (apenas admin_global)
```

---

## 🛠️ Como Configurar

### 1. Habilitar/Desabilitar Módulos no Estabelecimento

**Via Admin Panel:**
1. Acessar como `admin_global`
2. Ir em **Admin** → **Estabelecimentos**
3. Editar estabelecimento
4. Marcar/desmarcar checkboxes dos módulos

**Via SQL:**
```sql
UPDATE establishments
SET
  has_kitchen = true,
  has_orders = true,
  has_reports = true
WHERE id = 'establishment-id';
```

### 2. Conceder Permissão de Relatórios para Funcionário

**Via Admin Panel:**
1. Acessar como `admin_global` ou `owner`
2. Ir em **Funcionários**
3. Editar funcionário
4. Marcar checkbox **Relatórios**

**Via SQL:**
```sql
UPDATE user_roles
SET permissions = '{"modules":{"orders":true,"kitchen":true,"reports":true}}'::jsonb
WHERE id = 'user-role-id';
```

---

## 🔒 Segurança

### Backend (API)
- ✅ Middleware de autenticação verifica token JWT
- ✅ Middleware de autorização verifica roles
- ✅ RLS (Row Level Security) no Supabase
- ✅ Audit logs para operações críticas

### Frontend
- ✅ Protected Routes
- ✅ Verificação de roles antes de renderizar
- ✅ Menus dinâmicos baseados em permissões
- ⚠️ **Não confiar apenas no frontend** - sempre validar no backend

---

## 📚 Referências

- **Arquivo de implementação**: `frontend/src/components/common/Layout.tsx`
- **Types**: `frontend/src/types/index.ts`
- **Auth Store**: `frontend/src/stores/authStore.ts`
- **Auth Middleware**: `backend/src/shared/middleware/auth.middleware.ts`
- **RLS Policies**: `backend/scripts/setup-rls-policies.sql`

---

## 🎓 Boas Práticas

1. **Sempre verificar no backend** - Frontend pode ser bypassado
2. **Usar RLS no Supabase** - Proteção adicional no banco de dados
3. **Audit logs** - Registrar quem fez o quê
4. **Princípio do menor privilégio** - Dar apenas acessos necessários
5. **Permissões granulares** - Usar apenas para casos especiais (ex: Relatórios)

---

**Desenvolvido por**: Claude (Sonnet 4.5)
**Cliente**: Talles Nicacio
**Data**: Outubro 2025
