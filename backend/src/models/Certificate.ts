import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: Date;
  pdf_url?: string;
}

export class CertificateModel {
  static async create(data: {
    user_id: string;
    course_id: string;
    certificate_number: string;
    pdf_url?: string;
  }): Promise<Certificate> {
    await pool.query(
      `INSERT INTO certificates (user_id, course_id, certificate_number, pdf_url)
       VALUES (?, ?, ?, ?)`,
      [data.user_id, data.course_id, data.certificate_number, data.pdf_url || null]
    );
    const [result] = await pool.query(
      'SELECT * FROM certificates WHERE certificate_number = ?',
      [data.certificate_number]
    );
    return getFirstRow(result);
  }

  static async findByUser(user_id: string): Promise<Certificate[]> {
    const [result] = await pool.query(
      `SELECT c.*, co.title as course_title, co.slug as course_slug
       FROM certificates c
       JOIN courses co ON c.course_id = co.id
       WHERE c.user_id = ?
       ORDER BY c.issued_at DESC`,
      [user_id]
    );
    return getAllRows(result);
  }

  static async findByUserAndCourse(
    user_id: string,
    course_id: string
  ): Promise<Certificate | null> {
    const [result] = await pool.query(
      'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
      [user_id, course_id]
    );
    return getFirstRow(result);
  }

  static async generateCertificateNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CERT-${timestamp}-${random}`;
  }
}
