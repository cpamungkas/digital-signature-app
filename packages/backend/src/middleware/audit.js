const { prisma } = require('../config/database');

const createAuditLog = async ({ action, entity, entityId = null, userId = null, metadata = null, ipAddress = null, userAgent = null }) => {
  try {
    await prisma.auditLog.create({
      data: { action, entity, entityId, userId, metadata, ipAddress: ipAddress || null, userAgent: userAgent || null },
    });
  } catch (error) {
    console.error('[AUDIT] Failed to create audit log:', error.message);
  }
};

module.exports = { createAuditLog };
