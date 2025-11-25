import { Request, Response } from 'express';
import { AnalyticsModel } from '../models/Analytics';
import pool from '../config/database';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Get various stats
    const [completionRates, popularCourses, activeUsers, eventStats] = await Promise.all([
      AnalyticsModel.getCourseCompletionRates(),
      AnalyticsModel.getPopularCourses(10),
      AnalyticsModel.getActiveUsers(30),
      AnalyticsModel.getEventStats(30),
    ]);

    // Get total counts
    const [totalUsersResult] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [totalCoursesResult] = await pool.query('SELECT COUNT(*) as count FROM courses WHERE is_published = true');
    const [totalEnrollmentsResult] = await pool.query('SELECT COUNT(*) as count FROM enrollments');

    res.json({
      stats: {
        total_users: parseInt((totalUsersResult as any[])[0].count),
        total_courses: parseInt((totalCoursesResult as any[])[0].count),
        total_enrollments: parseInt((totalEnrollmentsResult as any[])[0].count),
        active_users_30d: activeUsers,
      },
      completion_rates: completionRates,
      popular_courses: popularCourses,
      event_stats: eventStats,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCourseAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_id } = req.params;
    const authReq = req as any;
    const userRole = authReq.user?.role;

    if (userRole !== 'admin' && userRole !== 'instructor') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const [completionRate, quizPerformance, enrollments] = await Promise.all([
      AnalyticsModel.getCourseCompletionRates().then((rates) =>
        rates.find((r: any) => r.id === course_id)
      ),
      AnalyticsModel.getQuizPerformance(course_id),
      pool.query(
        `SELECT COUNT(*) as count, 
                COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed
         FROM enrollments WHERE course_id = ?`,
        [course_id]
      ),
    ]);

    const [enrollmentsResult] = enrollments as any;

    res.json({
      course_id,
      completion_rate: completionRate,
      quiz_performance: quizPerformance,
      enrollments: {
        total: parseInt(enrollmentsResult[0].count),
        completed: parseInt(enrollmentsResult[0].completed),
      },
    });
  } catch (error) {
    console.error('Get course analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserEngagement = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { days = 30 } = req.query;
    const engagement = await AnalyticsModel.getUserEngagement(user_id, parseInt(days as string));

    res.json({ engagement });
  } catch (error) {
    console.error('Get user engagement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

