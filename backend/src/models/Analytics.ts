import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export class AnalyticsModel {
  static async trackEvent(data: {
    user_id?: string;
    event_type: string;
    event_data?: any;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    await pool.query(
      `INSERT INTO analytics_events (user_id, event_type, event_data, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.user_id || null,
        data.event_type,
        data.event_data ? JSON.stringify(data.event_data) : null,
        data.ip_address || null,
        data.user_agent || null,
      ]
    );
  }

  static async getUserEngagement(user_id: string, days: number = 30): Promise<any> {
    const [result] = await pool.query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as event_count,
         COUNT(DISTINCT event_type) as unique_events
       FROM analytics_events
       WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [user_id, days]
    );
    return getAllRows(result);
  }

  static async getCourseCompletionRates(): Promise<any> {
    const [result] = await pool.query(
      `SELECT 
         c.id,
         c.title,
         COUNT(DISTINCT e.user_id) as total_enrollments,
         COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.user_id END) as completed,
         ROUND(
           COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.user_id END) /
           NULLIF(COUNT(DISTINCT e.user_id), 0) * 100,
           2
         ) as completion_rate
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       GROUP BY c.id, c.title
       ORDER BY completion_rate DESC`
    );
    return getAllRows(result);
  }

  static async getQuizPerformance(course_id?: string): Promise<any> {
    let query = `
      SELECT 
        q.id,
        q.title,
        COUNT(DISTINCT qa.user_id) as total_attempts,
        AVG(qa.score) as average_score,
        COUNT(DISTINCT CASE WHEN qa.is_passed = 1 THEN qa.user_id END) as passed_count
      FROM quizzes q
      JOIN quiz_attempts qa ON q.id = qa.quiz_id
    `;

    const params: any[] = [];
    if (course_id) {
      query += `
        JOIN content_items ci ON q.content_item_id = ci.id
        JOIN modules m ON ci.module_id = m.id
        WHERE m.course_id = ?
      `;
      params.push(course_id);
    }

    query += `
      GROUP BY q.id, q.title
      ORDER BY average_score DESC
    `;

    const [result] = await pool.query(query, params);
    return getAllRows(result);
  }

  static async getPopularCourses(limit: number = 10): Promise<any> {
    const [result] = await pool.query(
      `SELECT 
         c.id,
         c.title,
         c.slug,
         c.thumbnail_url,
         COUNT(DISTINCT e.user_id) as enrollment_count,
         AVG(r.rating) as average_rating,
         COUNT(DISTINCT r.id) as review_count
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       WHERE c.is_published = 1
       GROUP BY c.id, c.title, c.slug, c.thumbnail_url
       ORDER BY enrollment_count DESC, average_rating DESC
       LIMIT ?`,
      [limit]
    );
    return getAllRows(result);
  }

  static async getActiveUsers(days: number = 30): Promise<number> {
    const [result] = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count
       FROM analytics_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) AND user_id IS NOT NULL`,
      [days]
    );
    return parseInt((result as any[])[0].count);
  }

  static async getEventStats(days: number = 30): Promise<any> {
    const [result] = await pool.query(
      `SELECT 
         event_type,
         COUNT(*) as count
       FROM analytics_events
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY event_type
       ORDER BY count DESC`,
      [days]
    );
    return getAllRows(result);
  }
}
