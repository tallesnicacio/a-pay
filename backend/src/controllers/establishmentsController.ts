import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

export const getEstablishments = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT e.*
       FROM establishments e
       INNER JOIN user_roles ur ON ur.establishment_id = e.id
       WHERE ur.user_id = $1
       ORDER BY e.name`,
      [req.user?.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get establishments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEstablishmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM establishments WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Establishment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get establishment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
