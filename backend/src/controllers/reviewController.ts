import { Request, Response } from 'express';
import { ReviewModel } from '../models/Review';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_id, user_id, rating, is_verified_purchase } = req.query;
    
    const filters: any = {};
    if (course_id) filters.course_id = course_id as string;
    if (user_id) filters.user_id = user_id as string;
    if (rating) filters.rating = parseInt(rating as string);
    if (is_verified_purchase !== undefined) {
      filters.is_verified_purchase = is_verified_purchase === 'true' || is_verified_purchase === '1';
    }

    const reviews = await ReviewModel.findAll(filters);
    res.json({ reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await ReviewModel.findById(id);
    if (!review) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.json({ review });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await ReviewModel.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getReviewStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await ReviewModel.getStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

