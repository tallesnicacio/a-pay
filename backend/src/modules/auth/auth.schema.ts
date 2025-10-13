import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const VerifyTokenSchema = z.object({
  token: z.string().min(1),
});

export type LoginBody = z.infer<typeof LoginSchema>;
export type VerifyTokenBody = z.infer<typeof VerifyTokenSchema>;
