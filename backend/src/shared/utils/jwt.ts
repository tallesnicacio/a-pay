/**
 * JWT Utilities
 *
 * IMPORTANTE: Este arquivo contém helpers para JWT que devem ser implementados
 * antes de ir para produção. Atualmente o sistema usa autenticação simplificada.
 *
 * Para implementação completa, instalar:
 * pnpm add jsonwebtoken @types/jsonwebtoken
 *
 * Ou usar Supabase Auth (recomendado):
 * pnpm add @supabase/supabase-js
 */

// import jwt from 'jsonwebtoken';
// import { env } from '../config/env';

export interface JWTPayload {
  userId: string;
  email: string;
  establishmentId?: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

/**
 * Gera um token JWT
 *
 * @example
 * const token = generateToken({
 *   userId: 'user-id',
 *   email: 'user@example.com',
 *   roles: ['waiter'],
 * });
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  // TODO: Implementar com jsonwebtoken
  // return jwt.sign(payload, env.JWT_SECRET, {
  //   expiresIn: '7d',
  //   issuer: 'apay-api',
  // });

  throw new Error('JWT generation not implemented. Use Supabase Auth or implement JWT.');
}

/**
 * Verifica e decodifica um token JWT
 *
 * @example
 * try {
 *   const payload = verifyToken(token);
 *   console.log(payload.userId);
 * } catch (error) {
 *   console.error('Invalid token');
 * }
 */
export function verifyToken(token: string): JWTPayload {
  // TODO: Implementar com jsonwebtoken
  // try {
  //   return jwt.verify(token, env.JWT_SECRET, {
  //     issuer: 'apay-api',
  //   }) as JWTPayload;
  // } catch (error) {
  //   throw new Error('Invalid or expired token');
  // }

  throw new Error('JWT verification not implemented. Use Supabase Auth or implement JWT.');
}

/**
 * Gera um refresh token
 * Refresh tokens têm validade maior (30 dias) e são usados para renovar access tokens
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  // TODO: Implementar com jsonwebtoken
  // return jwt.sign(payload, env.JWT_SECRET, {
  //   expiresIn: '30d',
  //   issuer: 'apay-api',
  // });

  throw new Error('Refresh token generation not implemented.');
}

/**
 * Decodifica um token sem verificar assinatura (útil para debug)
 */
export function decodeToken(token: string): JWTPayload | null {
  // TODO: Implementar
  // return jwt.decode(token) as JWTPayload;

  throw new Error('Token decode not implemented.');
}

/**
 * Exemplo de uso com Supabase Auth (alternativa recomendada)
 *
 * @example
 * ```typescript
 * import { createClient } from '@supabase/supabase-js';
 * import { env } from './config/env';
 *
 * const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
 *
 * // Verificar token
 * const { data, error } = await supabase.auth.getUser(token);
 *
 * if (error) {
 *   throw new UnauthorizedError('Invalid token');
 * }
 *
 * const user = data.user;
 * ```
 */

export const JWT_IMPLEMENTATION_GUIDE = `
# Implementação de JWT - Guia Rápido

## Opção 1: jsonwebtoken (mais controle)

### 1. Instalar dependência
\`\`\`bash
pnpm add jsonwebtoken @types/jsonwebtoken
\`\`\`

### 2. Descomentar código neste arquivo (jwt.ts)

### 3. Atualizar auth.middleware.ts
\`\`\`typescript
import { verifyToken } from '../utils/jwt';

const token = authHeader.replace('Bearer ', '');
const payload = verifyToken(token); // Em vez de userId = token
\`\`\`

## Opção 2: Supabase Auth (recomendado)

### 1. Instalar dependência
\`\`\`bash
pnpm add @supabase/supabase-js
\`\`\`

### 2. Criar supabase client
\`\`\`typescript
// src/shared/config/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);
\`\`\`

### 3. Atualizar auth.middleware.ts
\`\`\`typescript
import { supabase } from '../config/supabase';

const token = authHeader.replace('Bearer ', '');
const { data, error } = await supabase.auth.getUser(token);

if (error) {
  throw new UnauthorizedError('Invalid token');
}

const user = data.user;
\`\`\`

### 4. Frontend login
\`\`\`typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

const token = data.session?.access_token;
\`\`\`

## Segurança

- ✅ JWT_SECRET deve ter no mínimo 32 caracteres
- ✅ Tokens devem ter expiração (7 dias recomendado)
- ✅ Usar refresh tokens para renovação
- ✅ Validar issuer e audience
- ✅ Rate limiting por usuário

## Referências

- jsonwebtoken: https://github.com/auth0/node-jsonwebtoken
- Supabase Auth: https://supabase.com/docs/guides/auth
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
`;

// Para visualizar o guia:
// console.log(JWT_IMPLEMENTATION_GUIDE);
