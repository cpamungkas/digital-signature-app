const crypto = require('crypto');
const { prisma } = require('../config/database');
const cloudinary = require('../config/cloudinary');

class DocumentService {
  async createDocument(userId, { title, content }) {
    return prisma.document.create({ data: { title, content, userId } });
  }

  async uploadDocument(userId, file, title) {
    if (!file) { const err = new Error('No file provided'); err.statusCode = 400; throw err; }

    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataUri = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'digital-signature/documents', resource_type: 'auto', public_id: `${userId}_${Date.now()}` });

    const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    return prisma.document.create({
      data: { title: title || file.originalname || 'Untitled', fileUrl: result.secure_url, fileType: file.mimetype, fileSize: file.size, hash, userId },
    });
  }

  async listDocuments(userId, page = 1, limit = 20, status = null) {
    const skip = (page - 1) * limit;
    const where = { userId, deletedAt: null };
    if (status) where.status = status;

    const [documents, total] = await Promise.all([
      prisma.document.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' }, include: { _count: { select: { signatures: true, signers: true } } } }),
      prisma.document.count({ where }),
    ]);
    return { data: documents, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getDocument(id, userId) {
    const doc = await prisma.document.findFirst({
      where: { id, userId, deletedAt: null },
      include: { signatures: { include: { user: { select: { id: true, name: true, email: true } } } }, signers: { orderBy: { createdAt: 'desc' } } },
    });
    if (!doc) { const err = new Error('Document not found'); err.statusCode = 404; throw err; }
    return doc;
  }

  async updateDocument(id, userId, data) {
    const doc = await prisma.document.findFirst({ where: { id, userId, deletedAt: null } });
    if (!doc) { const err = new Error('Document not found'); err.statusCode = 404; throw err; }
    return prisma.document.update({ where: { id }, data });
  }

  async deleteDocument(id, userId) {
    const doc = await prisma.document.findFirst({ where: { id, userId, deletedAt: null } });
    if (!doc) { const err = new Error('Document not found'); err.statusCode = 404; throw err; }
    await prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Document deleted successfully' };
  }
}

module.exports = new DocumentService();
