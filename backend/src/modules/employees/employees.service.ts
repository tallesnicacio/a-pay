import { prisma } from '../../shared/database/prisma.service';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../shared/utils/errors';
import { hashPassword } from '../../shared/utils/password';
import { createClient } from '@supabase/supabase-js';
import type { CreateEmployeeBody, UpdateEmployeeBody } from './employees.schema';

// Criar cliente Supabase com service role key para criar usuários
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class EmployeesService {
  /**
   * Listar funcionários do estabelecimento do owner
   */
  async listEmployees(establishmentId: string) {
    const userRoles = await prisma.userRole.findMany({
      where: {
        establishmentId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            active: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userRoles.map((ur) => ({
      id: ur.id,
      userId: ur.user.id,
      email: ur.user.email,
      name: ur.user.name,
      active: ur.user.active,
      role: ur.role,
      permissions: ur.permissions,
      createdAt: ur.user.createdAt,
    }));
  }

  /**
   * Criar funcionário
   */
  async createEmployee(data: CreateEmployeeBody, establishmentId: string) {
    // Verificar se email já existe no Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestError('Email já está em uso');
    }

    // Validar permissões para role 'user'
    if (data.role === 'user' && !data.permissions) {
      throw new BadRequestError('Permissões são obrigatórias para role "user"');
    }

    try {
      // 1. Criar usuário no Supabase Auth primeiro
      const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          name: data.name,
        },
      });

      if (supabaseError) {
        console.error('[EmployeesService] Erro ao criar usuário no Supabase:', supabaseError);
        throw new BadRequestError(`Erro ao criar usuário: ${supabaseError.message}`);
      }

      if (!supabaseUser.user) {
        throw new BadRequestError('Erro ao criar usuário no Supabase Auth');
      }


      // 2. Hash da senha para salvar no Prisma (backup)
      const hashedPassword = await hashPassword(data.password);

      // 3. Criar registro na tabela users e user_roles do Prisma
      const result = await prisma.$transaction(async (tx) => {
        // Criar usuário na tabela users usando o mesmo ID do Supabase
        const user = await tx.user.create({
          data: {
            id: supabaseUser.user.id, // Usar o mesmo UUID do Supabase
            email: data.email,
            name: data.name,
            password: hashedPassword,
            active: true,
          },
        });

        // Criar UserRole
        const userRole = await tx.userRole.create({
          data: {
            userId: user.id,
            establishmentId,
            role: data.role,
            permissions: data.permissions || null,
          },
        });

        return { user, userRole };
      });


      return {
        id: result.userRole.id,
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        active: result.user.active,
        role: result.userRole.role,
        permissions: result.userRole.permissions,
        createdAt: result.user.createdAt,
      };
    } catch (error: any) {
      console.error('[EmployeesService] Erro ao criar funcionário:', error);

      // Se falhou após criar no Supabase, tentar limpar
      // (não é crítico se falhar, pois o usuário pode ser removido manualmente)

      throw error;
    }
  }

  /**
   * Atualizar funcionário
   */
  async updateEmployee(
    userRoleId: string,
    data: UpdateEmployeeBody,
    establishmentId: string
  ) {
    // Verificar se UserRole pertence ao estabelecimento
    const userRole = await prisma.userRole.findFirst({
      where: {
        id: userRoleId,
        establishmentId,
      },
      include: {
        user: true,
      },
    });

    if (!userRole) {
      throw new NotFoundError('Funcionário não encontrado');
    }

    // Não permitir alterar owner
    if (userRole.role === 'owner') {
      throw new ForbiddenError('Não é possível alterar o owner do estabelecimento');
    }

    // Atualizar Supabase Auth se houver mudança de email ou status
    if (data.email || data.active !== undefined) {
      try {
        const updateData: any = {};
        if (data.email) updateData.email = data.email;
        if (data.active !== undefined) {
          // Supabase usa ban/unban em vez de active
          if (!data.active) {
            await supabase.auth.admin.updateUserById(userRole.userId, {
              ban_duration: '876000h', // 100 anos (efetivamente permanente)
            });
          } else {
            await supabase.auth.admin.updateUserById(userRole.userId, {
              ban_duration: 'none',
            });
          }
        }

        if (Object.keys(updateData).length > 0) {
          const { error: supabaseError } = await supabase.auth.admin.updateUserById(
            userRole.userId,
            updateData
          );

          if (supabaseError) {
            console.error('[EmployeesService] Erro ao atualizar Supabase:', supabaseError);
            throw new BadRequestError(`Erro ao atualizar usuário: ${supabaseError.message}`);
          }
        }
      } catch (error: any) {
        console.error('[EmployeesService] Erro ao atualizar Supabase Auth:', error);
        throw error;
      }
    }

    // Atualizar em transação no Prisma
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar dados do usuário
      const updateUserData: any = {};
      if (data.name) updateUserData.name = data.name;
      if (data.email) updateUserData.email = data.email;
      if (data.active !== undefined) updateUserData.active = data.active;

      let updatedUser = userRole.user;
      if (Object.keys(updateUserData).length > 0) {
        updatedUser = await tx.user.update({
          where: { id: userRole.userId },
          data: updateUserData,
        });
      }

      // Atualizar permissões
      let updatedUserRole = userRole;
      if (data.permissions) {
        updatedUserRole = await tx.userRole.update({
          where: { id: userRoleId },
          data: {
            permissions: data.permissions,
          },
        });
      }

      return { user: updatedUser, userRole: updatedUserRole };
    });

    return {
      id: result.userRole.id,
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      active: result.user.active,
      role: result.userRole.role,
      permissions: result.userRole.permissions,
      createdAt: result.user.createdAt,
    };
  }

  /**
   * Deletar funcionário
   */
  async deleteEmployee(userRoleId: string, establishmentId: string) {
    // Verificar se UserRole pertence ao estabelecimento
    const userRole = await prisma.userRole.findFirst({
      where: {
        id: userRoleId,
        establishmentId,
      },
      include: {
        user: true,
      },
    });

    if (!userRole) {
      throw new NotFoundError('Funcionário não encontrado');
    }

    // Não permitir deletar owner
    if (userRole.role === 'owner') {
      throw new ForbiddenError('Não é possível remover o owner do estabelecimento');
    }

    // Deletar do Supabase Auth
    try {
      const { error: supabaseError } = await supabase.auth.admin.deleteUser(
        userRole.userId
      );

      if (supabaseError) {
        console.error('[EmployeesService] Erro ao deletar do Supabase:', supabaseError);
        // Continuar mesmo com erro - vamos deletar do banco de dados
      }
    } catch (error) {
      console.error('[EmployeesService] Erro ao deletar do Supabase Auth:', error);
      // Continuar mesmo com erro
    }

    // Deletar UserRole do banco de dados
    await prisma.userRole.delete({
      where: { id: userRoleId },
    });
  }
}

export const employeesService = new EmployeesService();
