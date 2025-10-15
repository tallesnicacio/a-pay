-- Script para habilitar acesso às tabelas (temporário para desenvolvimento)
-- Execute no Supabase SQL Editor

-- IMPORTANTE: Este é um setup TEMPORÁRIO para desenvolvimento
-- Em produção, você deve configurar Row Level Security (RLS) corretamente

-- 1. Desabilitar RLS nas tabelas (permite leitura/escrita sem políticas)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE establishments DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- 2. Verificar status (todas devem mostrar false na coluna row_security)
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'user_roles', 'establishments', 'products', 'orders', 'order_items', 'kitchen_tickets', 'payments', 'audit_logs')
ORDER BY tablename;

-- Deve retornar:
-- rls_enabled = false para todas as tabelas

-- ⚠️ AVISO:
-- Com RLS desabilitado, qualquer usuário autenticado pode ler/escrever em todas as tabelas.
-- Isso é OK para desenvolvimento, mas em produção você deve:
-- 1. Habilitar RLS: ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;
-- 2. Criar políticas de acesso (policies)
