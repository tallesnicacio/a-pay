import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const createPayment = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { order_id, method, amount } = req.body;

    // Create payment
    const paymentResult = await client.query(
      `INSERT INTO payments (id, order_id, method, amount, received_by, received_at, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [order_id, method, amount, req.user?.id]
    );

    // Get current order
    const orderResult = await client.query(
      'SELECT total_amount, paid_amount FROM orders WHERE id = $1',
      [order_id]
    );

    const order = orderResult.rows[0];
    const newPaidAmount = parseFloat(order.paid_amount) + parseFloat(amount);
    const totalAmount = parseFloat(order.total_amount);

    // Determine payment status
    let paymentStatus = 'partial';
    if (newPaidAmount >= totalAmount) {
      paymentStatus = 'paid';
    } else if (newPaidAmount === 0) {
      paymentStatus = 'unpaid';
    }

    // Update order
    let orderUpdateQuery = `
      UPDATE orders
      SET paid_amount = $1, payment_status = $2, updated_at = NOW()
    `;

    const orderParams: any[] = [newPaidAmount, paymentStatus];

    // Close order if fully paid
    if (paymentStatus === 'paid') {
      orderUpdateQuery += ', status = $3, closed_at = NOW()';
      orderParams.push('closed');
    }

    orderUpdateQuery += ' WHERE id = $' + (orderParams.length + 1);
    orderParams.push(order_id);

    await client.query(orderUpdateQuery, orderParams);

    await client.query('COMMIT');

    res.status(201).json(paymentResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const getPaymentsByOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { order_id } = req.params;

    const result = await pool.query(
      'SELECT * FROM payments WHERE order_id = $1 ORDER BY received_at DESC',
      [order_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
