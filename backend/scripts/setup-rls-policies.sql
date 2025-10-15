-- =====================================================
-- Script para configurar políticas RLS (Row Level Security)
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA A TABELA users
-- =====================================================

-- Usuários podem ver apenas seus próprios dados
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can do everything on users" ON users;
CREATE POLICY "Service role can do everything on users"
  ON users
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLÍTICAS PARA A TABELA user_roles
-- =====================================================

-- Usuários podem ver suas próprias roles
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can do everything on user_roles" ON user_roles;
CREATE POLICY "Service role can do everything on user_roles"
  ON user_roles
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLÍTICAS PARA A TABELA establishments
-- =====================================================

-- Usuários podem ver estabelecimentos onde têm roles
DROP POLICY IF EXISTS "Users can view their establishments" ON establishments;
CREATE POLICY "Users can view their establishments"
  ON establishments
  FOR SELECT
  USING (
    id IN (
      SELECT establishment_id
      FROM user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can do everything on establishments" ON establishments;
CREATE POLICY "Service role can do everything on establishments"
  ON establishments
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLÍTICAS PARA A TABELA products
-- =====================================================

-- Usuários podem ver produtos dos estabelecimentos onde têm roles
DROP POLICY IF EXISTS "Users can view products from their establishments" ON products;
CREATE POLICY "Users can view products from their establishments"
  ON products
  FOR SELECT
  USING (
    establishment_id IN (
      SELECT establishment_id
      FROM user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Owners e admins podem modificar produtos
DROP POLICY IF EXISTS "Owners can modify products" ON products;
CREATE POLICY "Owners can modify products"
  ON products
  FOR ALL
  USING (
    establishment_id IN (
      SELECT establishment_id
      FROM user_roles
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin_global')
    )
  );

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can do everything on products" ON products;
CREATE POLICY "Service role can do everything on products"
  ON products
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLÍTICAS PARA A TABELA orders
-- =====================================================

-- Usuários podem ver pedidos dos estabelecimentos onde têm roles
DROP POLICY IF EXISTS "Users can view orders from their establishments" ON orders;
CREATE POLICY "Users can view orders from their establishments"
  ON orders
  FOR SELECT
  USING (
    establishment_id IN (
      SELECT establishment_id
      FROM user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Usuários com acesso a orders podem criar e modificar
DROP POLICY IF EXISTS "Users can modify orders in their establishments" ON orders;
CREATE POLICY "Users can modify orders in their establishments"
  ON orders
  FOR ALL
  USING (
    establishment_id IN (
      SELECT establishment_id
      FROM user_roles
      WHERE user_id = auth.uid()
    )
  );

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can do everything on orders" ON orders;
CREATE POLICY "Service role can do everything on orders"
  ON orders
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLÍTICAS PARA A TABELA order_items
-- =====================================================

-- Usuários podem ver itens de pedidos que podem ver
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
CREATE POLICY "Users can view order items"
  ON order_items
  FOR SELECT
  USING (
    order_id IN (
      SELECT o.id
      FROM orders o
      INNER JOIN user_roles ur ON ur.establishment_id = o.establishment_id
      WHERE ur.user_id = auth.uid()
    )
  );

-- Usuários podem criar/modificar itens de pedidos que podem modificar
DROP POLICY IF EXISTS "Users can modify order items" ON order_items;
CREATE POLICY "Users can modify order items"
  ON order_items
  FOR ALL
  USING (
    order_id IN (
      SELECT o.id
      FROM orders o
      INNER JOIN user_roles ur ON ur.establishment_id = o.establishment_id
      WHERE ur.user_id = auth.uid()
    )
  );

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can do everything on order_items" ON order_items;
CREATE POLICY "Service role can do everything on order_items"
  ON order_items
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLÍTICAS PARA A TABELA kitchen_tickets
-- =====================================================

-- Usuários podem ver tickets dos estabelecimentos onde têm roles
DROP POLICY IF EXISTS "Users can view kitchen tickets" ON kitchen_tickets;
CREATE POLICY "Users can view kitchen tickets"
  ON kitchen_tickets
  FOR SELECT
  USING (
    order_id IN (
      SELECT o.id
      FROM orders o
      INNER JOIN user_roles ur ON ur.establishment_id = o.establishment_id
      WHERE ur.user_id = auth.uid()
    )
  );

-- Usuários podem modificar tickets
DROP POLICY IF EXISTS "Users can modify kitchen tickets" ON kitchen_tickets;
CREATE POLICY "Users can modify kitchen tickets"
  ON kitchen_tickets
  FOR ALL
  USING (
    order_id IN (
      SELECT o.id
      FROM orders o
      INNER JOIN user_roles ur ON ur.establishment_id = o.establishment_id
      WHERE ur.user_id = auth.uid()
    )
  );

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can do everything on kitchen_tickets" ON kitchen_tickets;
CREATE POLICY "Service role can do everything on kitchen_tickets"
  ON kitchen_tickets
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLÍTICAS PARA A TABELA payments
-- =====================================================

-- Usuários podem ver pagamentos dos estabelecimentos onde têm roles
DROP POLICY IF EXISTS "Users can view payments" ON payments;
CREATE POLICY "Users can view payments"
  ON payments
  FOR SELECT
  USING (
    order_id IN (
      SELECT o.id
      FROM orders o
      INNER JOIN user_roles ur ON ur.establishment_id = o.establishment_id
      WHERE ur.user_id = auth.uid()
    )
  );

-- Usuários podem criar/modificar pagamentos
DROP POLICY IF EXISTS "Users can modify payments" ON payments;
CREATE POLICY "Users can modify payments"
  ON payments
  FOR ALL
  USING (
    order_id IN (
      SELECT o.id
      FROM orders o
      INNER JOIN user_roles ur ON ur.establishment_id = o.establishment_id
      WHERE ur.user_id = auth.uid()
    )
  );

-- Service role pode fazer tudo
DROP POLICY IF EXISTS "Service role can do everything on payments" ON payments;
CREATE POLICY "Service role can do everything on payments"
  ON payments
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- POLÍTICAS PARA A TABELA audit_logs
-- =====================================================

-- Apenas service role pode acessar audit logs
DROP POLICY IF EXISTS "Only service role can access audit logs" ON audit_logs;
CREATE POLICY "Only service role can access audit logs"
  ON audit_logs
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se as políticas foram criadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Fim do script
