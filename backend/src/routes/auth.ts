/**
 * Authentication Routes
 * 
 * POST /auth/register - Create new account
 * POST /auth/login - Login with email/password
 * POST /auth/logout - Logout current session
 * POST /auth/logout-all - Logout all sessions
 * POST /auth/forgot-password - Request password reset
 * POST /auth/reset-password - Reset password with token
 * POST /auth/change-password - Change password (authenticated)
 * GET  /auth/me - Get current user
 */

import { Router } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth';
import { requireAuth } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * POST /auth/register
 * Create a new account
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = registerSchema.parse(req.body);
    
    const result = await authService.register(email, password, displayName);
    
    res.status(201).json({
      message: 'Account created successfully',
      user: result.user,
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const result = await authService.login(email, password);
    
    res.json({
      message: 'Login successful',
      user: result.user,
      token: result.token,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/logout
 * Logout current session
 */
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const token = req.headers.authorization?.substring(7);
    
    if (token) {
      await authService.logout(token);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/logout-all
 * Logout all sessions for current user
 */
router.post('/logout-all', requireAuth, async (req, res, next) => {
  try {
    await authService.logoutAll(req.user!.userId);
    
    res.json({ message: 'All sessions logged out' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/forgot-password
 * Request password reset email
 */
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    
    const resetToken = await authService.requestPasswordReset(email);
    
    // TODO: Send email with reset link
    // For now, in development, return the token
    if (process.env.NODE_ENV === 'development' && resetToken) {
      return res.json({
        message: 'If an account exists, a reset email will be sent',
        // DEV ONLY - remove in production!
        _devToken: resetToken,
      });
    }
    
    // Always return success to prevent email enumeration
    res.json({
      message: 'If an account exists with this email, a password reset link will be sent',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/reset-password
 * Reset password using token from email
 */
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    
    await authService.resetPassword(token, password);
    
    res.json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/change-password
 * Change password (requires current password)
 */
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    
    await authService.changePassword(req.user!.userId, currentPassword, newPassword);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { prisma } = await import('../index');
    
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
