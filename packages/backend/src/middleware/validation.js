const { validationResult } = require('express-validator');
const { body } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  next();
};

// Register validation rules
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  handleValidationErrors,
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// Document validation rules
const validateDocument = [
  body('filename')
    .notEmpty()
    .withMessage('Filename is required')
    .trim()
    .isLength({ max: 255 }),
  handleValidationErrors,
];

// Signature validation rules
const validateSignature = [
  body('signature_type')
    .isIn(['drawn', 'uploaded'])
    .withMessage('Signature type must be drawn or uploaded'),
  body('signature_image_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid URL'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateDocument,
  validateSignature,
};