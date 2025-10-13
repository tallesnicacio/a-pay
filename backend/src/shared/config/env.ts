import { z } from 'zod';

/**
 * Schema de validação para variáveis de ambiente
 * Garante que todas as variáveis necessárias estão presentes no startup
 */
const envSchema = z.object({
  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url('DATABASE_URL deve ser uma URL válida'),

  // Redis (opcional para MVP)
  REDIS_URL: z.string().url().optional(),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres'),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  // Logging
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Timezone
  TZ: z.string().default('America/Sao_Paulo'),
});

/**
 * Valida e exporta variáveis de ambiente tipadas
 * @throws {Error} Se alguma variável obrigatória estiver faltando ou inválida
 */
export function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map(err => `  - ${err.path.join('.')}: ${err.message}`).join('\n');

      console.error('❌ Erro: Variáveis de ambiente inválidas ou faltando:\n');
      console.error(missing);
      console.error('\n📝 Verifique seu arquivo .env e compare com .env.example\n');

      process.exit(1);
    }
    throw error;
  }
}

// Export singleton
export const env = validateEnv();

// Types
export type Env = z.infer<typeof envSchema>;
