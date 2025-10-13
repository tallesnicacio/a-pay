import { FastifyRequest, FastifyReply } from 'fastify';
import { productsService } from './products.service';
import {
  GetProductsQuerySchema,
  CreateProductSchema,
  UpdateProductSchema,
} from './products.schema';
import { BadRequestError } from '../../shared/utils/errors';

export class ProductsController {
  async getProducts(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const query = GetProductsQuerySchema.parse(request.query);
    const products = await productsService.getProducts(establishmentId, query);

    return reply.send({
      success: true,
      data: products,
      count: products.length,
    });
  }

  async getProductById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const product = await productsService.getProductById(id, establishmentId);

    return reply.send({
      success: true,
      data: product,
    });
  }

  async createProduct(request: FastifyRequest, reply: FastifyReply) {
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const body = CreateProductSchema.parse(request.body);
    const product = await productsService.createProduct(body, establishmentId);

    return reply.code(201).send({
      success: true,
      data: product,
    });
  }

  async updateProduct(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const body = UpdateProductSchema.parse(request.body);
    const product = await productsService.updateProduct(
      id,
      body,
      establishmentId
    );

    return reply.send({
      success: true,
      data: product,
    });
  }

  async deleteProduct(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const establishmentId = request.establishmentId;

    if (!establishmentId) {
      throw new BadRequestError('Establishment ID é obrigatório');
    }

    const product = await productsService.deleteProduct(id, establishmentId);

    return reply.send({
      success: true,
      data: product,
    });
  }
}

export const productsController = new ProductsController();
