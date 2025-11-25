import { Request, Response } from 'express';
import { ModuleModel } from '../models/Module';
import { ContentModel } from '../models/Content';
import { QuizModel } from '../models/Quiz';
import pool from '../config/database';
import { getFileUrl } from '../services/upload';

export const createModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const module = await ModuleModel.create(req.body);
    res.status(201).json({ message: 'Module created successfully', module });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getModules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { course_id } = req.params;
    const modules = await ModuleModel.findByCourse(course_id);

    // Get content items for each module
    for (const module of modules) {
      const content = await ContentModel.findByModule(module.id);
      (module as any).content_items = content;
    }

    res.json({ modules });
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const module = await ModuleModel.update(id, req.body);

    if (!module) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    res.json({ message: 'Module updated successfully', module });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteModule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await ModuleModel.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Module not found' });
      return;
    }

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const contentData = { ...req.body };

    // Handle file uploads
    if (req.file) {
      const filename = req.file.filename;
      if (contentData.content_type === 'video') {
        contentData.content_url = getFileUrl(filename, 'video');
      } else if (contentData.content_type === 'document') {
        contentData.content_url = getFileUrl(filename, 'document');
      }
    }

    const content = await ContentModel.create(contentData);
    res.status(201).json({ message: 'Content created successfully', content });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const content = await ContentModel.findById(id);

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    // If it's a quiz, get quiz details
    if (content.content_type === 'quiz') {
      const quiz = await QuizModel.findByContentItem(id);
      if (quiz) {
        const questions = await QuizModel.getQuestions(quiz.id);
        (content as any).quiz = { ...quiz, questions };
      }
    }

    res.json({ content });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    // Handle file uploads
    if (req.file) {
      const filename = req.file.filename;
      if (updates.content_type === 'video') {
        updates.content_url = getFileUrl(filename, 'video');
      } else if (updates.content_type === 'document') {
        updates.content_url = getFileUrl(filename, 'document');
      }
    }

    const content = await ContentModel.update(id, updates);

    if (!content) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json({ message: 'Content updated successfully', content });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await ContentModel.delete(id);

    if (!deleted) {
      res.status(404).json({ error: 'Content not found' });
      return;
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content_item_id, ...quizData } = req.body;
    const quiz = await QuizModel.create({ content_item_id, ...quizData });
    res.status(201).json({ message: 'Quiz created successfully', quiz });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addQuizQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quiz_id } = req.params;
    const question = await QuizModel.addQuestion({ quiz_id, ...req.body });
    res.status(201).json({ message: 'Question added successfully', question });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quiz_id } = req.params;
    const authReq = req as any;
    const user_id = authReq.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { answers } = req.body;

    // Get quiz and questions
    const quiz = await QuizModel.findById(quiz_id);
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    const questions = await QuizModel.getQuestions(quiz_id);

    // Calculate score
    let score = 0;
    let total_points = 0;

    questions.forEach((question) => {
      total_points += question.points;
      const userAnswer = answers[question.id];
      const correctAnswer = question.correct_answer;

      if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
        if (userAnswer === correctAnswer) {
          score += question.points;
        }
      } else if (question.question_type === 'short_answer') {
        // Simple case-insensitive comparison for short answers
        if (userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
          score += question.points;
        }
      }
      // Essay questions would need manual grading
    });

    const percentage = (score / total_points) * 100;

    await QuizModel.submitAttempt({
      user_id,
      quiz_id,
      answers,
      score: percentage,
      total_points,
    });

    res.json({
      message: 'Quiz submitted successfully',
      score: percentage,
      total_points,
      is_passed: percentage >= quiz.passing_score,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


