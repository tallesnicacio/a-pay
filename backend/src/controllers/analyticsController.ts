import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const { establishment_id, start_date, end_date } = req.query;

    let query = `
      SELECT
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_orders,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_orders,
        COALESCE(SUM(CASE WHEN status = 'closed' THEN total_amount ELSE 0 END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status = 'closed' THEN total_amount END), 0) as average_ticket
      FROM orders
      WHERE establishment_id = $1
    `;

    const params: any[] = [establishment_id];

    if (start_date) {
      query += ' AND created_at >= $' + (params.length + 1);
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND created_at <= $' + (params.length + 1);
      params.push(end_date);
    }

    const metricsResult = await pool.query(query, params);

    // Get orders for the period
    let ordersQuery = 'SELECT * FROM orders WHERE establishment_id = $1';
    const ordersParams: any[] = [establishment_id];

    if (start_date) {
      ordersQuery += ' AND created_at >= $' + (ordersParams.length + 1);
      ordersParams.push(start_date);
    }

    if (end_date) {
      ordersQuery += ' AND created_at <= $' + (ordersParams.length + 1);
      ordersParams.push(end_date);
    }

    ordersQuery += ' ORDER BY created_at DESC';

    const ordersResult = await pool.query(ordersQuery, ordersParams);

    res.json({
      ...metricsResult.rows[0],
      orders: ordersResult.rows,
    });
  } catch (error) {
    console.error('Get dashboard metrics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
