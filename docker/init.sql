-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto

-- Habilitar RLS por padrão em todas as tabelas relevantes
-- Será configurado via migrations do Prisma

-- Configuração de timezone
SET timezone = 'America/Sao_Paulo';

-- Log de inicialização
DO $$
BEGIN
  RAISE NOTICE 'A-Pay Database initialized successfully!';
  RAISE NOTICE 'Timezone: %', current_setting('timezone');
END $$;
