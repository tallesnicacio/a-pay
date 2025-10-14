import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface UserRolePayload {
  establishmentId: string | null;
  establishmentName?: string;
  role: string;
  permissions?: Record<string, any>;
}

export interface JWTPayload {
  sub: string; // userId
  email: string;
  name: string;
  roles: UserRolePayload[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string; // userId
  iat?: number;
  exp?: number;
}

/**
 * Gera um access token JWT (15 minutos de validade)
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m',
    issuer: 'apay-api',
  });
}

/**
 * Gera um refresh token JWT (7 dias de validade)
 * Refresh tokens são usados para renovar access tokens expirados
 */
export function generateRefreshToken(userId: string): string {
  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    sub: userId,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'apay-api',
  });
}

/**
 * Verifica e decodifica um access token JWT
 * @throws Error se token for inválido ou expirado
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'apay-api',
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    throw new Error('Erro ao verificar token');
  }
}

/**
 * Verifica e decodifica um refresh token JWT
 * @throws Error se token for inválido ou expirado
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'apay-api',
    }) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Refresh token inválido');
    }
    throw new Error('Erro ao verificar refresh token');
  }
}

/**
 * Decodifica um token sem verificar assinatura (útil para debug)
 */
export function decodeToken(token: string): JWTPayload | RefreshTokenPayload | null {
  return jwt.decode(token) as JWTPayload | RefreshTokenPayload | null;
}

/**
 * Extrai token do header Authorization
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
