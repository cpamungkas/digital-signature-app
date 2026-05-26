const prisma = require('../db/prisma');

class DocumentController {
  // List user's documents
  async listDocuments(req, res, next) {
    try {
      // TODO: Add authentication middleware to get userId from token
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const documents = await prisma.document.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        include: {
          signingSessions: {
            select: {
              id: true,
              signer_email: true,
              status: true,
            },
          },
        },
      });

      res.json({ documents });
    } catch (error) {
      next(error);
    }
  }

  // Get document details
  async getDocument(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const document = await prisma.document.findFirst({
        where: {
          id,
          user_id: userId,
        },
        include: {
          signingSessions: true,
          auditLogs: {
            orderBy: { timestamp: 'desc' },
          },
        },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      res.json({ document });
    } catch (error) {
      next(error);
    }
  }

  // Upload document
  async uploadDocument(req, res, next) {
    try {
      const { filename, file_url, file_hash } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const document = await prisma.document.create({
        data: {
          user_id: userId,
          filename,
          file_url,
          file_hash,
          status: 'draft',
        },
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          document_id: document.id,
          action: 'uploaded',
          actor_email: req.user?.email,
          actor_ip: req.ip,
          user_agent: req.headers['user-agent'],
        },
      });

      res.status(201).json({
        message: 'Document uploaded successfully',
        document,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete document
  async deleteDocument(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const document = await prisma.document.findFirst({
        where: {
          id,
          user_id: userId,
        },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      await prisma.document.delete({
        where: { id },
      });

      res.json({ message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Download document
  async downloadDocument(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const document = await prisma.document.findFirst({
        where: {
          id,
          user_id: userId,
        },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Create audit log
      await prisma.auditLog.create({
        data: {
          document_id: document.id,
          action: 'downloaded',
          actor_email: req.user?.email,
          actor_ip: req.ip,
          user_agent: req.headers['user-agent'],
        },
      });

      res.json({
        message: 'Document download URL',
        file_url: document.file_url,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get audit log
  async getAuditLog(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const document = await prisma.document.findFirst({
        where: {
          id,
          user_id: userId,
        },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      const auditLogs = await prisma.auditLog.findMany({
        where: { document_id: id },
        orderBy: { timestamp: 'desc' },
      });

      res.json({ auditLogs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();