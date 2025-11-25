import { Request, Response } from 'express';
import { ProgressModel } from '../models/Progress';
import { CertificateModel } from '../models/Certificate';
import { EnrollmentModel } from '../models/Enrollment';
import { generateCertificate } from '../services/certificate';
import pool from '../config/database';

export const updateProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { content_item_id, is_completed, time_spent_minutes } = req.body;

    const progress = await ProgressModel.createOrUpdate({
      user_id,
      content_item_id,
      is_completed,
      time_spent_minutes,
    });

    // Update course progress
    const [contentResult] = await pool.query(
      `SELECT m.course_id FROM content_items ci
       JOIN modules m ON ci.module_id = m.id
       WHERE ci.id = ?`,
      [content_item_id]
    );

    if ((contentResult as any[]).length > 0) {
      const course_id = (contentResult as any[])[0].course_id;
      const courseProgress = await ProgressModel.calculateCourseProgress(user_id, course_id);
      await EnrollmentModel.updateProgress(user_id, course_id, courseProgress);

      // Check if course is completed
      if (courseProgress >= 100) {
        await EnrollmentModel.markComplete(user_id, course_id);

        // Check if certificate already exists
        const existingCert = await CertificateModel.findByUserAndCourse(user_id, course_id);
        if (!existingCert) {
          // Generate certificate
          const certificate_number = await CertificateModel.generateCertificateNumber();
          const pdf_url = await generateCertificate(user_id, course_id, certificate_number);
          await CertificateModel.create({
            user_id,
            course_id,
            certificate_number,
            pdf_url,
          });
        }
      }
    }

    res.json({ message: 'Progress updated successfully', progress });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { course_id } = req.params;

    const progress = await ProgressModel.findByUserAndCourse(user_id, course_id);
    const courseProgress = await ProgressModel.calculateCourseProgress(user_id, course_id);

    res.json({ progress, course_progress: courseProgress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCertificates = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const certificates = await CertificateModel.findByUser(user_id);
    res.json({ certificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { course_id } = req.params;
    const certificate = await CertificateModel.findByUserAndCourse(user_id, course_id);

    if (!certificate) {
      res.status(404).json({ error: 'Certificate not found' });
      return;
    }

    res.json({ certificate });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


