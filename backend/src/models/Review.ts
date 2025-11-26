import pool from '../config/database';
import { getAllRows, getFirstRow } from '../utils/db';

export interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment?: string;
  is_verified_purchase: boolean;
  created_at: Date;
  updated_at: Date;
  // Joined fields
  user_name?: string;
  user_email?: string;
  course_title?: string;
  course_slug?: string;
}

export class ReviewModel {
  static async findAll(filters?: {
    course_id?: string;
    user_id?: string;
    rating?: number;
    is_verified_purchase?: boolean;
  }): Promise<Review[]> {
    let query = `
      SELECT r.*,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             u.email as user_email,
             c.title as course_title,
             c.slug as course_slug
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN courses c ON r.course_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.course_id) {
      query += ' AND r.course_id = ?';
      params.push(filters.course_id);
    }

    if (filters?.user_id) {
      query += ' AND r.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters?.rating !== undefined) {
      query += ' AND r.rating = ?';
      params.push(filters.rating);
    }

    if (filters?.is_verified_purchase !== undefined) {
      query += ' AND r.is_verified_purchase = ?';
      params.push(filters.is_verified_purchase ? 1 : 0);
    }

    query += ' ORDER BY r.created_at DESC';

    const [result] = await pool.query(query, params);
    return getAllRows(result);
  }

  static async findById(id: string): Promise<Review | null> {
    const [result] = await pool.query(
      `SELECT r.*,
              CONCAT(u.first_name, ' ', u.last_name) as user_name,
              u.email as user_email,
              c.title as course_title,
              c.slug as course_slug
       FROM reviews r
       INNER JOIN users u ON r.user_id = u.id
       INNER JOIN courses c ON r.course_id = c.id
       WHERE r.id = ?`,
      [id]
    );
    return getFirstRow(result);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async getStats(): Promise<{
    total: number;
    average_rating: number;
    by_rating: { rating: number; count: number }[];
    verified_count: number;
  }> {
    const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM reviews');
    const total = (totalResult as any[])[0]?.total || 0;

    const [avgResult] = await pool.query('SELECT AVG(rating) as avg_rating FROM reviews');
    const average_rating = parseFloat((avgResult as any[])[0]?.avg_rating || '0');

    const [ratingResult] = await pool.query(
      `SELECT rating, COUNT(*) as count 
       FROM reviews 
       GROUP BY rating 
       ORDER BY rating DESC`
    );
    const by_rating = getAllRows(ratingResult);

    const [verifiedResult] = await pool.query(
      'SELECT COUNT(*) as count FROM reviews WHERE is_verified_purchase = 1'
    );
    const verified_count = (verifiedResult as any[])[0]?.count || 0;

    return {
      total,
      average_rating: Math.round(average_rating * 10) / 10,
      by_rating,
      verified_count,
    };
  }
}

