import pool from '../config/database';
import { getFirstRow, getAllRows } from '../utils/db';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  instructor_id: string;
  category_id?: string;
  thumbnail_url?: string;
  price: number;
  is_free: boolean;
  is_published: boolean;
  visibility: 'public' | 'private';
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  duration_hours?: number;
  rating: number;
  total_ratings: number;
  enrolled_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCourseData {
  title: string;
  description: string;
  short_description?: string;
  instructor_id: string;
  category_id?: string;
  thumbnail_url?: string;
  price?: number;
  is_free?: boolean;
  visibility?: 'public' | 'private';
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
}

export class CourseModel {
  static async create(data: CreateCourseData): Promise<Course> {
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    await pool.query(
      `INSERT INTO courses (
        title, slug, description, short_description, instructor_id, category_id,
        thumbnail_url, price, is_free, visibility, difficulty_level, language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        slug,
        data.description,
        data.short_description || '',
        data.instructor_id,
        data.category_id || null,
        data.thumbnail_url || null,
        data.price || 0,
        data.is_free ?? true,
        data.visibility || 'public',
        data.difficulty_level || null,
        data.language || 'en',
      ]
    );
    const [result] = await pool.query('SELECT * FROM courses WHERE slug = ?', [slug]);
    return getFirstRow(result);
  }

  static async findById(id: string): Promise<Course | null> {
    const [result] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async findBySlug(slug: string): Promise<Course | null> {
    const [result] = await pool.query('SELECT * FROM courses WHERE slug = ?', [slug]);
    return getFirstRow(result);
  }

  static async findAll(filters: {
    category_id?: string;
    instructor_id?: string;
    is_published?: boolean;
    visibility?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ courses: Course[]; total: number }> {
    let query = 'SELECT * FROM courses WHERE 1=1';
    const params: any[] = [];

    if (filters.category_id) {
      query += ' AND category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.instructor_id) {
      query += ' AND instructor_id = ?';
      params.push(filters.instructor_id);
    }

    if (filters.is_published !== undefined) {
      query += ' AND is_published = ?';
      params.push(filters.is_published);
    }

    if (filters.visibility) {
      query += ' AND visibility = ?';
      params.push(filters.visibility);
    }

    if (filters.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as count');
    const [countResult] = await pool.query(countQuery, params);
    const total = parseInt((countResult as any[])[0].count);

    // Add pagination
    query += ' ORDER BY created_at DESC';
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(filters.offset);
    }

    const [result] = await pool.query(query, params);
    return { courses: getAllRows(result), total };
  }

  static async update(id: string, updates: Partial<Course>): Promise<Course | null> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'slug') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    await pool.query(
      `UPDATE courses SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      values
    );
    const [result] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    return getFirstRow(result);
  }

  static async delete(id: string): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    return (result as any).affectedRows > 0;
  }

  static async incrementEnrolledCount(id: string): Promise<void> {
    await pool.query(
      'UPDATE courses SET enrolled_count = enrolled_count + 1 WHERE id = ?',
      [id]
    );
  }

  static async updateRating(id: string, rating: number): Promise<void> {
    await pool.query(
      `UPDATE courses 
       SET rating = (rating * total_ratings + ?) / (total_ratings + 1),
           total_ratings = total_ratings + 1
       WHERE id = ?`,
      [rating, id]
    );
  }
}
