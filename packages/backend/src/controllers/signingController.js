const crypto = require('crypto');
const prisma = require('../db/prisma');

class SigningController {
  // Create signing session
  async createSigningSession(req, res, next) {
    try {
      const { document_id, signer_email } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if document belongs to user
      const document = await prisma.document.findFirst({
        where: {
          id: document_id,
          user_id: userId,
        },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Generate one-time token
      const token = crypto.randomBytes(32).toString('hex');
      const token_expires_at = new Date();
      token_expires_at.setDate(token_expires_at.getDate() + 7); // 7 days expiry

      // Create signing session
      const signingSession = await prisma.signingSession.create({
        data: {
          document_id,
          signer_email,
          token,
          token_expires_at,
          status: 'pending',
        },
      });

      res.status(201).json({
        message: 'Signing session created successfully',
        signingSession,
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get signing session (public)
  async getSigningSession(req, res, next) {
    try {
      const { token } = req.params;

      const signingSession = await prisma.signingSession.findUnique({
        where: { token },
        include: {
          document: {
            select: {
              id: true,
              filename: true,
              file_url: true,
              status: true,
            },
          },
        },
      });

      if (!signingSession) {
        return res.status(404).json({ error: 'Signing session not found' });
      }

      // Check if token is expired
      if (new Date() > new Date(signingSession.token_expires_at)) {
        return res.status(400).json({ error: 'Token has expired' });
      }

      res.json({ signingSession });
    } catch (error) {
      next(error);
    }
  }

  // Sign document
  async signDocument(req, res, next) {
    try {
      const { token } = req.params;
      const { signature_position } = req.body;

      const signingSession = await prisma.signingSession.findUnique({
        where: { token },
        include: {
          document: true,
        },
      });

      if (!signingSession) {
        return res.status(404).json({ error: 'Signing session not found' });
      }

      // Check if token is expired
      if (new Date() > new Date(signingSession.token_expires_at)) {
        return res.status(400).json({ error: 'Token has expired' });
      }

      // Update signing session
      const updatedSession = await prisma.signingSession.update({
        where: { token },
        data: {
          status: 'signed',
          signature_position,
          signed_at: new Date(),
        },
      });

      // Update document status
      await prisma.document.update({
        where: { id: signingSession.document_id },
        data: {
          status: 'signed',
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          document_id: signingSession.document_id,
          action: 'signed',
          actor_email: signingSession.signer_email,
          actor_ip: req.ip,
          user_agent: req.headers['user-agent'],
        },
      });

      res.json({
        message: 'Document signed successfully',
        signingSession: updatedSession,
      });
    } catch (error) {
      next(error);
    }
  }

  // Check signing status
  async getSigningStatus(req, res, next) {
    try {
      const { id } = req.params;

      const signingSession = await prisma.signingSession.findUnique({
        where: { id },
        include: {
          document: true,
        },
      });

      if (!signingSession) {
        return res.status(404).json({ error: 'Signing session not found' });
      }

      res.json({ signingSession });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SigningController();