import { FastifyRequest, FastifyReply } from 'fastify';
import { publicService } from './public.service';
import { CreatePublicOrderSchema } from './public.schema';

export class PublicController {
  async getMenu(request: FastifyRequest<{ Params: { slug: string } }>, reply: FastifyReply) {
    try {
      const { slug } = request.params;
      const menu = await publicService.getMenu(slug);

      return reply.code(200).send({
        success: true,
        data: menu,
      });
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        success: false,
        error: error.message,
      });
    }
  }

  async createOrder(request: FastifyRequest, reply: FastifyReply) {
    try {
      const data = CreatePublicOrderSchema.parse(request.body);
      const order = await publicService.createPublicOrder(data);

      return reply.code(201).send({
        success: true,
        data: order,
      });
    } catch (error: any) {
      return reply.code(error.statusCode || 500).send({
        success: false,
        error: error.message,
      });
    }
  }
}

export const publicController = new PublicController();
