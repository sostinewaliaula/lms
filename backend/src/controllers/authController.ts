import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import pool from '../config/database';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name, last_name, role } = req.body;

    if (!email || !password || !first_name || !last_name) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const user = await UserModel.create({
      email,
      password_hash,
      first_name,
      last_name,
      role: role || 'student',
    });

    // Create user profile
    await pool.query(
      'INSERT INTO user_profiles (user_id) VALUES (?)',
      [user.id]
    );

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (!user.is_active) {
      res.status(403).json({ error: 'Account is inactive' });
      return;
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if user still exists and is active
    const user = await UserModel.findById(decoded.id);
    if (!user || !user.is_active) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.json({
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get user profile
    const [profileResult] = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      profile: (profileResult as any[])[0] || null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { first_name, last_name, bio, phone, location, website } = req.body;

    // Update user
    const userUpdates: any = {};
    if (first_name) userUpdates.first_name = first_name;
    if (last_name) userUpdates.last_name = last_name;

    if (Object.keys(userUpdates).length > 0) {
      await UserModel.update(userId, userUpdates);
    }

    // Update or create profile
    const [profileResult] = await pool.query(
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if ((profileResult as any[]).length > 0) {
      await pool.query(
        `UPDATE user_profiles 
         SET bio = COALESCE(?, bio), 
             phone = COALESCE(?, phone),
             location = COALESCE(?, location),
             website = COALESCE(?, website),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [bio, phone, location, website, userId]
      );
    } else {
      await pool.query(
        'INSERT INTO user_profiles (user_id, bio, phone, location, website) VALUES (?, ?, ?, ?, ?)',
        [userId, bio, phone, location, website]
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as any;
    const userId = authReq.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current password and new password are required' });
      return;
    }

    // Get user
    const user = await UserModel.findByEmail((req as any).user.email);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isValid = await comparePassword(currentPassword, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await UserModel.updatePassword(userId, newPasswordHash);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


