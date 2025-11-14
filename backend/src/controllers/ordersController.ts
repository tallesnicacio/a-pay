import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { establishment_id, status } = req.query;

    let query = `
      SELECT o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'qty', oi.qty,
            'unit_price', oi.unit_price,
            'note', oi.note,
            'created_at', oi.created_at,
            'product', json_build_object(
              'id', p.id,
              'name', p.name,
              'price', p.price
            )
          )
        ) FILTER (WHERE oi.id IS NOT NULL) as order_items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.establishment_id = $1
    `;

    const params: any[] = [establishment_id];

    if (status) {
      query += ' AND o.status = $2';
      params.push(status);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items with products
    const itemsResult = await pool.query(
      `SELECT oi.*,
        json_build_object('id', p.id, 'name', p.name, 'price', p.price) as product
       FROM order_items oi
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = $1`,
      [id]
    );

    // Get payments
    const paymentsResult = await pool.query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY received_at DESC',
      [id]
    );

    order.order_items = itemsResult.rows;
    order.payments = paymentsResult.rows;

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      establishment_id,
      code,
      customer_name,
      total_amount,
      items,
      has_kitchen,
    } = req.body;

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (
        id, establishment_id, code, customer_name, status, payment_status,
        total_amount, paid_amount, created_by, created_at, updated_at
      )
      VALUES (gen_random_uuid(), $1, $2, $3, 'open', 'unpaid', $4, 0, $5, NOW(), NOW())
      RETURNING *`,
      [establishment_id, code, customer_name, total_amount, req.user?.id]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (id, order_id, product_id, qty, unit_price, note, created_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
        [order.id, item.product_id, item.qty, item.unit_price, item.note]
      );
    }

    // Create kitchen ticket if establishment has kitchen
    if (has_kitchen) {
      const ticketNumber = Math.floor(Math.random() * 1000);

      await client.query(
        `INSERT INTO kitchen_tickets (
          id, order_id, establishment_id, ticket_number, status, created_at, updated_at
        )
        VALUES (gen_random_uuid(), $1, $2, $3, 'queue', NOW(), NOW())`,
        [order.id, establishment_id, ticketNumber]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const setClause: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        setClause.push(`${key} = $${paramCount++}`);
        params.push(updates[key]);
      }
    });

    setClause.push(`updated_at = NOW()`);
    params.push(id);

    const query = `UPDATE orders SET ${setClause.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE orders SET status = 'canceled', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const closeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE orders SET status = 'closed', closed_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Close order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
