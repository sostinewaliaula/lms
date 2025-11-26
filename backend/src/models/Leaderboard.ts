import pool from '../config/database';
import { getAllRows } from '../utils/db';

export interface LeaderboardEntry {
  user_id: string;
  total_points: number;
  courses_completed: number;
  badges_earned: number;
  rank: number;
  updated_at: Date;
  // Joined fields
  user_name?: string;
  user_email?: string;
  avatar_url?: string;
}

export class LeaderboardModel {
  static async findAll(limit?: number): Promise<LeaderboardEntry[]> {
    // First, recalculate ranks based on total_points
    await this.recalculateRanks();

    let query = `
      SELECT l.*,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             u.email as user_email,
             u.avatar_url
      FROM leaderboards l
      INNER JOIN users u ON l.user_id = u.id
      ORDER BY l.rank ASC, l.total_points DESC, l.courses_completed DESC
    `;

    if (limit) {
      query += ` LIMIT ${parseInt(limit.toString())}`;
    }

    const [result] = await pool.query(query);
    return getAllRows(result);
  }

  static async findByUserId(userId: string): Promise<LeaderboardEntry | null> {
    await this.recalculateRanks();
    
    const [result] = await pool.query(
      `SELECT l.*,
              CONCAT(u.first_name, ' ', u.last_name) as user_name,
              u.email as user_email,
              u.avatar_url
       FROM leaderboards l
       INNER JOIN users u ON l.user_id = u.id
       WHERE l.user_id = ?`,
      [userId]
    );
    
    const rows = getAllRows(result);
    return rows.length > 0 ? rows[0] : null;
  }

  static async recalculateRanks(): Promise<void> {
    // Update ranks based on total_points, then courses_completed, then badges_earned
    await pool.query(`
      UPDATE leaderboards l1
      SET \`rank\` = (
        SELECT COUNT(*) + 1
        FROM leaderboards l2
        WHERE (
          l2.total_points > l1.total_points
          OR (l2.total_points = l1.total_points AND l2.courses_completed > l1.courses_completed)
          OR (l2.total_points = l1.total_points 
              AND l2.courses_completed = l1.courses_completed 
              AND l2.badges_earned > l1.badges_earned)
        )
      )
    `);
  }

  static async getStats(): Promise<{
    total_users: number;
    average_points: number;
    top_points: number;
    total_courses_completed: number;
    total_badges_earned: number;
  }> {
    const [result] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        AVG(total_points) as average_points,
        MAX(total_points) as top_points,
        SUM(courses_completed) as total_courses_completed,
        SUM(badges_earned) as total_badges_earned
      FROM leaderboards
    `);
    
    const row = (result as any[])[0];
    return {
      total_users: row?.total_users || 0,
      average_points: Math.round((row?.average_points || 0) * 10) / 10,
      top_points: row?.top_points || 0,
      total_courses_completed: row?.total_courses_completed || 0,
      total_badges_earned: row?.total_badges_earned || 0,
    };
  }
}

