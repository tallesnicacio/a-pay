-- Script para criar usuário admin_global
-- Email: talles.nicacio@gmail.com
-- Senha: Admin@123 (ALTERAR APÓS PRIMEIRO LOGIN!)

-- 1. Inserir usuário (se não existir)
INSERT INTO users (id, email, name, password, active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'talles.nicacio@gmail.com',
  'Talles Nicacio',
  '$2a$10$YourHashedPasswordHere', -- Hash bcrypt da senha Admin@123
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 2. Adicionar role admin_global (se não existir)
INSERT INTO user_roles (id, user_id, establishment_id, role, created_at)
SELECT
  gen_random_uuid(),
  u.id,
  NULL,
  'admin_global',
  NOW()
FROM users u
WHERE u.email = 'talles.nicacio@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur
  WHERE ur.user_id = u.id
  AND ur.role = 'admin_global'
);

-- 3. Verificar resultado
SELECT
  u.id,
  u.email,
  u.name,
  u.active,
  ur.role
FROM users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'talles.nicacio@gmail.com';
