import { Request, Response } from 'express';
import { CourseModel } from '../models/Course';
import { CategoryModel } from '../models/Category';
import { EnrollmentModel } from '../models/Enrollment';
import pool from '../config/database';

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const instructor_id = authReq.user?.id;

    if (!instructor_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const courseData = {
      ...req.body,
      instructor_id,
    };

    const course = await CourseModel.create(courseData);

    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category_id,
      department_id,
      instructor_id,
      is_published,
      visibility,
      search,
      limit = 20,
      offset = 0,
    } = req.query;

    const filters: any = {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    if (category_id) filters.category_id = category_id as string;
    if (department_id) filters.department_id = department_id as string;
    if (instructor_id) filters.instructor_id = instructor_id as string;
    if (is_published !== undefined) filters.is_published = is_published === 'true';
    if (visibility) filters.visibility = visibility as string;
    if (search) filters.search = search as string;

    const { courses, total } = await CourseModel.findAll(filters);

    // Get instructor and category info
    for (const course of courses) {
      if (course.instructor_id) {
        const [instructorResult] = await pool.query(
          'SELECT id, first_name, last_name, avatar_url FROM users WHERE id = ?',
          [course.instructor_id]
        );
        (course as any).instructor = (instructorResult as any[])[0];
      }

      if (course.category_id) {
        const category = await CategoryModel.findById(course.category_id);
        (course as any).category = category;
      }

      if (course.department_id) {
        const [deptResult] = await pool.query(
          'SELECT id, name, slug FROM departments WHERE id = ?',
          [course.department_id]
        );
        (course as any).department = (deptResult as any[])[0];
      }
    }

    res.json({ courses, total, limit: filters.limit, offset: filters.offset });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await CourseModel.findById(id);

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Get instructor
    const [instructorResult] = await pool.query(
      'SELECT id, first_name, last_name, avatar_url, bio FROM users WHERE id = ?',
      [course.instructor_id]
    );
    (course as any).instructor = (instructorResult as any[])[0];

    // Get category
    if (course.category_id) {
      const category = await CategoryModel.findById(course.category_id);
      (course as any).category = category;
    }

    // Get department
    if (course.department_id) {
      const [deptResult] = await pool.query(
        'SELECT id, name, slug FROM departments WHERE id = ?',
        [course.department_id]
      );
      (course as any).department = (deptResult as any[])[0];
    }

    // Get tags
    const [tagsResult] = await pool.query(
      `SELECT t.* FROM course_tags t
       JOIN course_tags_junction j ON t.id = j.tag_id
       WHERE j.course_id = ?`,
      [id]
    );
    (course as any).tags = tagsResult as any[];

    // Get enrollment status if user is authenticated
    const authReq = req as any;
    if (authReq.user?.id) {
      const enrollment = await EnrollmentModel.findByUserAndCourse(authReq.user.id, id);
      (course as any).enrollment = enrollment;
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as any;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    const course = await CourseModel.findById(id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Check permissions
    if (course.instructor_id !== userId && userRole !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const updatedCourse = await CourseModel.update(id, req.body);
    res.json({ message: 'Course updated successfully', course: updatedCourse });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const authReq = req as any;
    const userId = authReq.user?.id;
    const userRole = authReq.user?.role;

    const course = await CourseModel.findById(id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Check permissions
    if (course.instructor_id !== userId && userRole !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await CourseModel.delete(id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const enrollInCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_id } = req.body;
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const course = await CourseModel.findById(course_id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Check if already enrolled
    const existing = await EnrollmentModel.findByUserAndCourse(user_id, course_id);
    if (existing) {
      res.status(409).json({ error: 'Already enrolled in this course' });
      return;
    }

    const enrollment = await EnrollmentModel.create(user_id, course_id);
    await CourseModel.incrementEnrolledCount(course_id);

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const enrollments = await EnrollmentModel.findByUser(user_id);
    res.json({ courses: enrollments });
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


