const crypto = require('crypto');
const { prisma } = require('../config/database');

class SigningService {
  async addSignatory(documentId, userId, { email, name }) {
    const doc = await prisma.document.findFirst({ where: { id: documentId, userId, deletedAt: null } });
    if (!doc) { const err = new Error('Document not found'); err.statusCode = 404; throw err; }

    const existing = await prisma.documentSignatory.findFirst({ where: { documentId, email } });
    if (existing) { const err = new Error('Signatory already added'); err.statusCode = 409; throw err; }

    const token = crypto.randomBytes(32).toString('hex');
    const signatory = await prisma.documentSignatory.create({ data: { documentId, email, name, token } });

    if (doc.status === 'DRAFT') { await prisma.document.update({ where: { id: documentId }, data: { status: 'PENDING' } }); }
    return signatory;
  }

  async listSignatories(documentId, userId) {
    const doc = await prisma.document.findFirst({ where: { id: documentId, userId, deletedAt: null } });
    if (!doc) { const err = new Error('Document not found'); err.statusCode = 404; throw err; }
    return prisma.documentSignatory.findMany({ where: { documentId }, orderBy: { createdAt: 'desc' } });
  }

  async removeSignatory(sigId, userId) {
    const signatory = await prisma.documentSignatory.findUnique({ where: { id: sigId }, include: { document: true } });
    if (!signatory || signatory.document.userId !== userId) { const err = new Error('Signatory not found'); err.statusCode = 404; throw err; }
    if (signatory.signedAt) { const err = new Error('Cannot remove signatory who already signed'); err.statusCode = 400; throw err; }

    await prisma.documentSignatory.delete({ where: { id: sigId } });
    return { message: 'Signatory removed successfully' };
  }

  async signViaToken(token, name) {
    const signatory = await prisma.documentSignatory.findUnique({ where: { token }, include: { document: true } });
    if (!signatory) { const err = new Error('Invalid signing link'); err.statusCode = 404; throw err; }
    if (signatory.signedAt) { const err = new Error('Document already signed by this signatory'); err.statusCode = 409; throw err; }

    const doc = signatory.document;
    const signData = `signatory:${signatory.email}:${signatory.documentId}:${doc.hash || 'no-hash'}:${Date.now()}`;
    const signatureHash = crypto.createHash('sha256').update(signData).digest('hex');

    await prisma.documentSignatory.update({ where: { id: signatory.id }, data: { signedAt: new Date(), name: name || signatory.name || signatory.email.split('@')[0] } });
    await prisma.signature.create({ data: { documentId: signatory.documentId, userId: signatory.email, signature: signatureHash } });

    return { id: signatory.id, signedAt: new Date(), signature: signatureHash };
  }

  async getSigningStatus(token) {
    const signatory = await prisma.documentSignatory.findUnique({
      where: { token },
      include: { document: { select: { id: true, title: true, status: true, fileUrl: true, createdAt: true } } },
    });
    if (!signatory) { const err = new Error('Invalid signing link'); err.statusCode = 404; throw err; }
    return { document: signatory.document, signatory: { email: signatory.email, name: signatory.name, signedAt: signatory.signedAt } };
  }
}

module.exports = new SigningService();
