import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: Date;
}

export class MessageModel {
  static async create(data: {
    sender_id: string;
    receiver_id: string;
    content: string;
  }): Promise<Message> {
    await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES (?, ?, ?)`,
      [data.sender_id, data.receiver_id, data.content]
    );
    const [result] = await pool.query(
      'SELECT * FROM messages WHERE sender_id = ? AND receiver_id = ? ORDER BY created_at DESC LIMIT 1',
      [data.sender_id, data.receiver_id]
    );
    return getFirstRow(result);
  }

  static async findByUsers(user1_id: string, user2_id: string): Promise<Message[]> {
    const [result] = await pool.query(
      `SELECT m.*, 
              s.first_name as sender_first_name, s.last_name as sender_last_name, s.avatar_url as sender_avatar,
              r.first_name as receiver_first_name, r.last_name as receiver_last_name, r.avatar_url as receiver_avatar
       FROM messages m
       JOIN users s ON m.sender_id = s.id
       JOIN users r ON m.receiver_id = r.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [user1_id, user2_id, user2_id, user1_id]
    );
    return getAllRows(result);
  }

  static async findConversations(user_id: string): Promise<any[]> {
    const [result] = await pool.query(
      `SELECT DISTINCT
         CASE 
           WHEN m.sender_id = ? THEN m.receiver_id
           ELSE m.sender_id
         END as other_user_id,
         u.first_name, u.last_name, u.avatar_url,
         MAX(m.created_at) as last_message_at,
         COUNT(CASE WHEN m.receiver_id = ? AND m.is_read = 0 THEN 1 END) as unread_count
       FROM messages m
       JOIN users u ON CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END = u.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       GROUP BY other_user_id, u.first_name, u.last_name, u.avatar_url
       ORDER BY last_message_at DESC`,
      [user_id, user_id, user_id, user_id, user_id]
    );
    return getAllRows(result);
  }

  static async markAsRead(message_ids: string[], user_id: string): Promise<void> {
    if (message_ids.length === 0) return;

    const placeholders = message_ids.map(() => '?').join(',');
    await pool.query(
      `UPDATE messages
       SET is_read = 1
       WHERE id IN (${placeholders}) AND receiver_id = ?`,
      [...message_ids, user_id]
    );
  }

  static async getUnreadCount(user_id: string): Promise<number> {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [user_id]
    );
    return parseInt((result as any[])[0].count);
  }
}
