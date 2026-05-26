const prisma = require('../db/prisma');

class SignatureController {
  // List user's signatures
  async listSignatures(req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const signatures = await prisma.signature.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });

      res.json({ signatures });
    } catch (error) {
      next(error);
    }
  }

  // Create/upload signature
  async createSignature(req, res, next) {
    try {
      const { signature_type, signature_image_url, is_default } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // If setting as default, unset other defaults
      if (is_default) {
        await prisma.signature.updateMany({
          where: {
            user_id: userId,
            is_default: true,
          },
          data: {
            is_default: false,
          },
        });
      }

      const signature = await prisma.signature.create({
        data: {
          user_id: userId,
          signature_type,
          signature_image_url,
          is_default: is_default || false,
        },
      });

      res.status(201).json({
        message: 'Signature created successfully',
        signature,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete signature
  async deleteSignature(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const signature = await prisma.signature.findFirst({
        where: {
          id,
          user_id: userId,
        },
      });

      if (!signature) {
        return res.status(404).json({ error: 'Signature not found' });
      }

      await prisma.signature.delete({
        where: { id },
      });

      res.json({ message: 'Signature deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SignatureController();