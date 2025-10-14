import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

export type LoginBody = z.infer<typeof LoginSchema>;
export type RefreshTokenBody = z.infer<typeof RefreshTokenSchema>;
