const { prisma } = require('../config/database');

class UserService {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, emailVerified: true, isActive: true, createdAt: true, updatedAt: true, _count: { select: { documents: true, signatures: true } } },
    });
    if (!user) { const err = new Error('User not found'); err.statusCode = 404; throw err; }
    return user;
  }

  async updateProfile(userId, { name, avatarUrl }) {
    const data = {};
    if (name !== undefined) data.name = name;
    if (avatarUrl !== undefined) data.avatarUrl = avatarUrl;
    return prisma.user.update({ where: { id: userId }, data, select: { id: true, email: true, name: true, role: true, avatarUrl: true, updatedAt: true } });
  }

  async listUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, name: true, role: true, avatarUrl: true, isActive: true, createdAt: true } }),
      prisma.user.count(),
    ]);
    return { data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getUserById(id) {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, avatarUrl: true, emailVerified: true, isActive: true, createdAt: true, updatedAt: true } });
    if (!user) { const err = new Error('User not found'); err.statusCode = 404; throw err; }
    return user;
  }

  async updateUser(id, data) {
    return prisma.user.update({ where: { id }, data, select: { id: true, email: true, name: true, role: true, avatarUrl: true, isActive: true, updatedAt: true } });
  }

  async deleteUser(id) {
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    return { message: 'User deactivated successfully' };
  }
}

module.exports = new UserService();
