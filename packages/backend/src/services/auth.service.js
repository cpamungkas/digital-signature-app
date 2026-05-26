const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../config/database');

class AuthService {
  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
    const refreshToken = crypto.randomBytes(40).toString('hex');
    return { accessToken, refreshToken };
  }

  async register({ email, password, name }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { const err = new Error('Email already registered'); err.statusCode = 409; throw err; }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email, passwordHash, name } });
    const tokens = this.generateTokens(user);

    await prisma.refreshToken.create({
      data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, ...tokens };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { const err = new Error('Invalid email or password'); err.statusCode = 401; throw err; }
    if (!user.isActive) { const err = new Error('Account deactivated'); err.statusCode = 403; throw err; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { const err = new Error('Invalid email or password'); err.statusCode = 401; throw err; }

    const tokens = this.generateTokens(user);
    await prisma.refreshToken.create({
      data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    return { user: { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl }, ...tokens };
  }

  async refresh(oldToken) {
    const stored = await prisma.refreshToken.findUnique({ where: { token: oldToken }, include: { user: true } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      if (stored?.userId) { await prisma.refreshToken.updateMany({ where: { userId: stored.userId, revokedAt: null }, data: { revokedAt: new Date() } }); }
      const err = new Error('Invalid refresh token'); err.statusCode = 401; throw err;
    }

    const newTokenVal = crypto.randomBytes(40).toString('hex');
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date(), replacedBy: newTokenVal } });
    await prisma.refreshToken.create({
      data: { token: newTokenVal, userId: stored.user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    const tokens = this.generateTokens(stored.user);
    tokens.refreshToken = newTokenVal;
    return { ...tokens };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) { const err = new Error('User not found'); err.statusCode = 404; throw err; }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) { const err = new Error('Current password is incorrect'); err.statusCode = 400; throw err; }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    return { message: 'Password changed successfully' };
  }

  async logout(refreshToken) {
    if (refreshToken) { await prisma.refreshToken.updateMany({ where: { token: refreshToken, revokedAt: null }, data: { revokedAt: new Date() } }); }
    return { message: 'Logged out successfully' };
  }
}

module.exports = new AuthService();
