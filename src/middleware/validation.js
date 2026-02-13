import { body, validationResult } from 'express-validator';

/**
 * Validation middleware using express-validator
 * Provides consistent input validation across all routes
 */

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: '입력값이 올바르지 않습니다',
      details: errors.array().map(err => err.msg)
    });
  }

  next();
};

/**
 * Validation rules for email/password signup
 */
export const validateSignup = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 12, max: 128 })
    .withMessage('비밀번호는 12자 이상 128자 이하여야 합니다')
    .matches(/[a-z]/)
    .withMessage('영문 소문자를 포함해야 합니다')
    .matches(/[A-Z]/)
    .withMessage('영문 대문자를 포함해야 합니다')
    .matches(/\d/)
    .withMessage('숫자를 포함해야 합니다')
    .matches(/[@$!%*#?&]/)
    .withMessage('특수문자(@$!%*#?&)를 포함해야 합니다'),

  body('passwordConfirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('비밀번호가 일치하지 않습니다'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('이름은 1-50자 사이여야 합니다'),

  handleValidationErrors
];

/**
 * Validation rules for email/password login
 */
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('올바른 이메일 형식이 아닙니다')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요'),

  handleValidationErrors
];

/**
 * Validation rules for email verification
 */
export const validateEmailVerification = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage('인증 토큰이 필요합니다')
    .isLength({ min: 32, max: 128 })
    .withMessage('유효하지 않은 토큰 형식입니다'),

  handleValidationErrors
];

/**
 * Validation rules for adding to cart
 */
export const validateAddToCart = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('유효한 상품 ID가 필요합니다'),

  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 })
    .withMessage('수량은 1-99 사이여야 합니다'),

  handleValidationErrors
];

/**
 * Validation rules for updating cart quantity
 */
export const validateUpdateCartQuantity = [
  body('quantity')
    .isInt({ min: 1, max: 99 })
    .withMessage('수량은 1-99 사이여야 합니다'),

  handleValidationErrors
];
