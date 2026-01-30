/**
 * Configuration
 */

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  bcrypt: {
    rounds: 12,
  },
  session: {
    // Session tokens expire in 30 days
    expiresInMs: 30 * 24 * 60 * 60 * 1000,
  },
  passwordReset: {
    // Password reset tokens expire in 1 hour
    expiresInMs: 60 * 60 * 1000,
  },
  env: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8081',
};
