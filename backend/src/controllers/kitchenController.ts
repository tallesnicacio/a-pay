import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest, KitchenStatus } from '../types';

export const getKitchenTickets = async (req: AuthRequest, res: Response) => {
  try {
    const { establishment_id, status } = req.query;

    let query = `
      SELECT kt.*,
        row_to_json(o.*) as order_data
      FROM kitchen_tickets kt
      LEFT JOIN orders o ON o.id = kt.order_id
      WHERE kt.establishment_id = $1
    `;

    const params: any[] = [establishment_id];

    if (status) {
      query += ' AND kt.status = $2';
      params.push(status);
    }

    query += ' ORDER BY kt.created_at ASC';

    const result = await pool.query(query, params);

    // Get order items for each ticket
    for (const ticket of result.rows) {
      if (ticket.order_data) {
        const itemsResult = await pool.query(
          `SELECT oi.*, p.name as product_name
           FROM order_items oi
           LEFT JOIN products p ON p.id = oi.product_id
           WHERE oi.order_id = $1`,
          [ticket.order_id]
        );
        ticket.order_data.order_items = itemsResult.rows;
      }
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Get kitchen tickets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: KitchenStatus };

    const updates: Record<string, any> = { status };

    if (status === 'preparing') {
      updates.started_at = new Date();
    } else if (status === 'ready') {
      updates.ready_at = new Date();
    } else if (status === 'delivered') {
      updates.delivered_at = new Date();
    }

    const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`);
    const params = [...Object.values(updates), id];

    const query = `
      UPDATE kitchen_tickets
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${params.length}
      RETURNING *
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
