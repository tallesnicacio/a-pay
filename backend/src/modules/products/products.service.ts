import { prisma } from '../../shared/database/prisma.service';
import { NotFoundError, BadRequestError } from '../../shared/utils/errors';
import {
  CreateProductBody,
  UpdateProductBody,
  GetProductsQuery,
} from './products.schema';

export class ProductsService {
  async getProducts(establishmentId: string, query: GetProductsQuery) {
    const where: any = {
      establishmentId,
    };

    if (query.active !== undefined) {
      where.active = query.active;
    }

    if (query.search) {
      where.name = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    return products;
  }

  async getProductById(id: string, establishmentId: string) {
    const product = await prisma.product.findFirst({
      where: {
        id,
        establishmentId,
      },
    });

    if (!product) {
      throw new NotFoundError('Produto não encontrado');
    }

    return product;
  }

  async createProduct(data: CreateProductBody, establishmentId: string) {
    const product = await prisma.product.create({
      data: {
        ...data,
        establishmentId,
      },
    });

    return product;
  }

  async updateProduct(
    id: string,
    data: UpdateProductBody,
    establishmentId: string
  ) {
    // Verificar se existe
    await this.getProductById(id, establishmentId);

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return product;
  }

  async deleteProduct(id: string, establishmentId: string) {
    // Verificar se existe
    await this.getProductById(id, establishmentId);

    // Soft delete - apenas marca como inativo
    const product = await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return product;
  }
}

export const productsService = new ProductsService();
