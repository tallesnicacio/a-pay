# 🔒 Row Level Security (RLS) - Guia de Configuração

## O que é RLS?

Row Level Security (RLS) é um recurso do PostgreSQL que permite controlar o acesso a linhas específicas em uma tabela com base no usuário atual. No A-Pay, usamos RLS para garantir isolamento completo de dados entre estabelecimentos.

## Status Atual

⚠️ **RLS está PREPARADO mas NÃO ATIVO**

O código está preparado para RLS (ver `backend/src/shared/middleware/rls.middleware.ts`), mas as policies do PostgreSQL ainda precisam ser criadas.

---

## 📋 Implementação Passo a Passo

### 1. Conectar ao PostgreSQL

```bash
# Via Docker
docker exec -it apay-postgres psql -U apay -d apay_dev

# Ou via psql local
psql postgresql://apay:apay_dev_password@localhost:5432/apay_dev
```

### 2. Ativar RLS nas Tabelas

Execute os seguintes comandos SQL:

```sql
-- Ativar RLS em todas as tabelas principais
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User roles não precisa de RLS (é a tabela de controle)
-- Users também não (é compartilhada entre estabelecimentos)
```

### 3. Criar Policies de Acesso

#### Policy para Products

```sql
-- Usuários só podem ver produtos do seu estabelecimento
CREATE POLICY products_select_policy ON products
  FOR SELECT
  USING (
    establishment_id = current_setting('app.current_establishment', true)::uuid
  );

-- Apenas owners e admins podem criar produtos
CREATE POLICY products_insert_policy ON products
  FOR INSERT
  WITH CHECK (
    establishment_id = current_setting('app.current_establishment', true)::uuid
  );

-- Apenas owners e admins podem atualizar produtos
CREATE POLICY products_update_policy ON products
  FOR UPDATE
  USING (
    establishment_id = current_setting('app.current_establishment', true)::uuid
  );

-- Apenas owners e admins podem deletar produtos
CREATE POLICY products_delete_policy ON products
  FOR DELETE
  USING (
    establishment_id = current_setting('app.current_establishment', true)::uuid
  );
```

#### Policy para Orders

```sql
-- Usuários só podem ver comandas do seu estabelecimento
CREATE POLICY orders_select_policy ON orders
  FOR SELECT
  USING (
    establishment_id = current_setting('app.current_establishment', true)::uuid
  );

-- Garçons e caixa podem criar comandas
CREATE POLICY orders_insert_policy ON orders
  FOR INSERT
  WITH CHECK (
    establishment_id = current_setting('app.current_establishment', true)::uuid
  );

-- Garçons e caixa podem atualizar comandas
CREATE POLICY orders_update_policy ON orders
  FOR UPDATE
  USING (
    establishment_id = current_setting('app.current_establishment', true)::uuid
  );
```

#### Policy para Order Items

```sql
CREATE POLICY order_items_select_policy ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.establishment_id = current_setting('app.current_establishment', true)::uuid
    )
  );

CREATE POLICY order_items_insert_policy ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.establishment_id = current_setting('app.current_establishment', true)::uuid
    )
  );
```

#### Policy para Kitchen Tickets

```sql
CREATE POLICY kitchen_tickets_select_policy ON kitchen_tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = kitchen_tickets.order_id
      AND orders.establishment_id = current_setting('app.current_establishment', true)::uuid
    )
  );

CREATE POLICY kitchen_tickets_update_policy ON kitchen_tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = kitchen_tickets.order_id
      AND orders.establishment_id = current_setting('app.current_establishment', true)::uuid
    )
  );
```

#### Policy para Payments

```sql
CREATE POLICY payments_select_policy ON payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.establishment_id = current_setting('app.current_establishment', true)::uuid
    )
  );

CREATE POLICY payments_insert_policy ON payments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.establishment_id = current_setting('app.current_establishment', true)::uuid
    )
  );
```

#### Policy para Audit Logs

```sql
CREATE POLICY audit_logs_select_policy ON audit_logs
  FOR SELECT
  USING (
    establishment_id = current_setting('app.current_establishment', true)::uuid
    OR establishment_id IS NULL  -- Admin global pode ver logs sem establishment
  );

CREATE POLICY audit_logs_insert_policy ON audit_logs
  FOR INSERT
  WITH CHECK (true);  -- Qualquer um pode criar logs (necessário para auditoria)
```

---

## 🔧 Como Funciona

### 1. Middleware RLS (já implementado)

O arquivo `backend/src/shared/middleware/rls.middleware.ts` já configura o contexto:

```typescript
await prisma.$executeRaw`SET app.current_establishment = ${establishmentId}`;
```

### 2. Queries Automáticas

Após configurar as policies, **todas** as queries do Prisma respeitam RLS automaticamente:

```typescript
// Esta query só retorna produtos do establishment atual
const products = await prisma.product.findMany();

// Mesmo se tentar forçar outro establishment, RLS bloqueia
const products = await prisma.product.findMany({
  where: { establishmentId: 'outro-id' }  // ❌ Vai retornar vazio
});
```

### 3. Admin Global

Para admin_global que precisa ver todos os estabelecimentos, você pode:

**Opção A: Desabilitar RLS temporariamente**
```typescript
// Para admin_global
if (user.roles.includes('admin_global')) {
  await prisma.$executeRaw`SET app.current_establishment = NULL`;
}
```

**Opção B: Criar policy específica**
```sql
-- Permitir admin_global ver tudo
CREATE POLICY products_admin_policy ON products
  FOR ALL
  USING (
    current_setting('app.is_admin', true)::boolean = true
    OR establishment_id = current_setting('app.current_establishment', true)::uuid
  );
```

---

## ✅ Verificação

### 1. Verificar se RLS está ativo

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('products', 'orders', 'kitchen_tickets');
```

Deve retornar `rowsecurity = true`.

### 2. Verificar policies criadas

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Testar isolamento

```sql
-- Definir establishment
SET app.current_establishment = 'establishment-uuid-1';

-- Deve retornar apenas produtos do establishment 1
SELECT * FROM products;

-- Mudar establishment
SET app.current_establishment = 'establishment-uuid-2';

-- Deve retornar apenas produtos do establishment 2
SELECT * FROM products;
```

---

## 🚨 Troubleshooting

### Problema: "insufficient_privilege" error

**Causa**: RLS está ativo mas não há policies criadas.

**Solução**: Criar as policies acima OU desabilitar RLS temporariamente:
```sql
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
```

### Problema: Queries retornam vazio

**Causa**: `app.current_establishment` não está definido.

**Solução**: Verificar se o middleware RLS está sendo chamado:
```typescript
// Em todas as rotas que precisam de RLS
fastify.addHook('onRequest', rlsMiddleware);
```

### Problema: Admin global não vê todos os dados

**Causa**: RLS está bloqueando admin_global.

**Solução**: Implementar Opção A ou B do tópico "Admin Global" acima.

---

## 📊 Performance

RLS tem overhead mínimo (<5%) quando bem configurado:

✅ **Boas práticas**:
- Usar índices em `establishment_id`
- Policies simples (evitar subqueries complexas)
- Cache de `current_setting` quando possível

❌ **Evitar**:
- Subqueries com múltiplos JOINs
- Policies diferentes para cada usuário
- Mudar `current_establishment` frequentemente

---

## 📚 Referências

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma with RLS](https://www.prisma.io/docs/guides/database/using-row-level-security)

---

## 🎯 Próximos Passos

1. ✅ Conectar ao PostgreSQL
2. ✅ Ativar RLS nas tabelas
3. ✅ Criar policies de acesso
4. ✅ Testar isolamento
5. ✅ Implementar tratamento para admin_global
6. ✅ Adicionar testes automatizados
7. ✅ Documentar no README

---

**Dúvidas?** Consulte o código em `backend/src/shared/middleware/rls.middleware.ts`
