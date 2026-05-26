const crypto = require('crypto');
const { prisma } = require('../config/database');

class SignatureService {
  async signDocument(documentId, userId) {
    const doc = await prisma.document.findFirst({ where: { id: documentId, deletedAt: null } });
    if (!doc) { const err = new Error('Document not found'); err.statusCode = 404; throw err; }

    const existing = await prisma.signature.findUnique({ where: { documentId_userId: { documentId, userId } } });
    if (existing) { const err = new Error('Document already signed by this user'); err.statusCode = 409; throw err; }

    const signData = `${userId}:${documentId}:${doc.hash || 'no-hash'}:${Date.now()}`;
    const signatureHash = crypto.createHash('sha256').update(signData).digest('hex');

    const signature = await prisma.signature.create({
      data: { documentId, userId, signature: signatureHash },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (doc.status === 'DRAFT') { await prisma.document.update({ where: { id: documentId }, data: { status: 'PENDING' } }); }
    return signature;
  }

  async listSignatures(documentId) {
    return prisma.signature.findMany({ where: { documentId }, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { signedAt: 'desc' } });
  }

  async verifyDocumentIntegrity(documentId) {
    const doc = await prisma.document.findUnique({ where: { id: documentId }, include: { signatures: { include: { user: { select: { id: true, name: true, email: true } } } } } });
    if (!doc) { const err = new Error('Document not found'); err.statusCode = 404; throw err; }

    return {
      documentId: doc.id, title: doc.title, status: doc.status, hash: doc.hash,
      signatures: doc.signatures.map(s => ({ id: s.id, user: s.user, signedAt: s.signedAt, signature: s.signature, valid: true })),
    };
  }

  async verifySignature(signatureId) {
    const sig = await prisma.signature.findUnique({
      where: { id: signatureId },
      include: { document: { select: { id: true, title: true, hash: true } }, user: { select: { id: true, name: true, email: true } } },
    });
    if (!sig) { const err = new Error('Signature not found'); err.statusCode = 404; throw err; }

    const signData = `${sig.userId}:${sig.documentId}:${sig.document.hash || 'no-hash'}:${new Date(sig.signedAt).getTime()}`;
    const expectedHash = crypto.createHash('sha256').update(signData).digest('hex');
    return { valid: expectedHash === sig.signature, signature: { id: sig.id, user: sig.user, document: sig.document, signedAt: sig.signedAt, hash: sig.signature } };
  }
}

module.exports = new SignatureService();
