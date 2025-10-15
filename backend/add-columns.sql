-- Adicionar coluna category na tabela products (se não existir)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- Adicionar coluna customer_name na tabela orders (se não existir)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);

-- Verificar as colunas criadas
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'category';

SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'orders' AND column_name = 'customer_name';
