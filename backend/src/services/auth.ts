/**
 * Authentication Service
 * 
 * Handles password hashing, JWT generation, and session management.
 * Self-hosted - no third-party auth providers.
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../index';
import { config } from '../utils/config';
import { AppError } from '../middleware/error';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    displayName: string | null;
  };
  token: string;
  expiresAt: Date;
}

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResult> {
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
  }

  // Validate password strength
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400, 'WEAK_PASSWORD');
  }

  // Check if user exists
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.bcrypt.rounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      displayName,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  });

  // Generate token
  const { token, expiresAt } = generateToken(user.id, user.email);

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return { user, token, expiresAt };
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Generate token
  const { token, expiresAt } = generateToken(user.id, user.email);

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    },
    token,
    expiresAt,
  };
}

/**
 * Logout - invalidate session
 */
export async function logout(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
}

/**
 * Logout all sessions for a user
 */
export async function logoutAll(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return null;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + config.passwordReset.expiresInMs);

  // Invalidate existing reset tokens
  await prisma.passwordReset.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() },
  });

  // Create new reset token
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token: resetToken,
      expiresAt,
    },
  });

  return resetToken;
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  // Validate password strength
  if (newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400, 'WEAK_PASSWORD');
  }

  // Find valid reset token
  const reset = await prisma.passwordReset.findFirst({
    where: {
      token,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });

  if (!reset) {
    throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.rounds);

  // Update password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
    // Invalidate all sessions (force re-login)
    prisma.session.deleteMany({
      where: { userId: reset.userId },
    }),
  ]);
}

/**
 * Change password (authenticated user)
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isValid) {
    throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
  }

  // Validate new password
  if (newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400, 'WEAK_PASSWORD');
  }

  // Hash and update
  const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.rounds);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

/**
 * Verify a session token is valid
 */
export async function verifySession(token: string): Promise<{ userId: string } | null> {
  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return { userId: session.userId };
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  return result.count;
}

/**
 * Generate JWT token
 */
function generateToken(userId: string, email: string): { token: string; expiresAt: Date } {
  const expiresAt = new Date(Date.now() + config.session.expiresInMs);

  const token = jwt.sign(
    { userId, email },
    config.jwt.secret,
    { expiresIn: '7d' }
  );

  return { token, expiresAt };
}
