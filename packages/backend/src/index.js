require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');
const documentRoutes = require('./routes/documents');
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/documents', authenticateToken, documentRoutes);
app.use('/api/signatures', authenticateToken, signatureRoutes);
app.use('/api/signing', authenticateToken, signingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
