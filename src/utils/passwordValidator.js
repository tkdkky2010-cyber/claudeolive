import zxcvbn from 'zxcvbn';

/**
 * List of commonly used passwords that should be rejected
 */
const COMMON_PASSWORDS = [
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty',
  'qwerty123',
  'abc123',
  'abc12345',
  'password!',
  'Password1',
  'Password123',
  'Welcome1',
  'welcome123',
  'admin',
  'admin123',
  'user',
  'user123'
];

/**
 * Validate password strength and complexity
 *
 * Requirements:
 * - Minimum 8 characters (any characters allowed)
 *
 * @param {string} password - The password to validate
 * @param {string} email - User's email (to prevent password containing email)
 * @param {string} name - User's name (to prevent password containing name)
 * @returns {object} Validation result with { valid, errors, score }
 */
export function validatePassword(password, email = '', name = '') {
  const errors = [];

  // Check minimum length
  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다');
  }

  // Check maximum length (prevent DoS attacks via bcrypt)
  if (password.length > 128) {
    errors.push('비밀번호는 최대 128자까지 가능합니다');
  }

  // Use zxcvbn to check password strength (for informational purposes only)
  const userInputs = [email, name].filter(Boolean);
  const result = zxcvbn(password, userInputs);

  return {
    valid: errors.length === 0,
    errors,
    score: result.score,
    feedback: result.feedback
  };
}

/**
 * Get user-friendly strength label from zxcvbn score
 * @param {number} score - zxcvbn score (0-4)
 * @returns {string} Strength label in Korean
 */
export function getPasswordStrengthLabel(score) {
  const labels = {
    0: '매우 약함',
    1: '약함',
    2: '보통',
    3: '강함',
    4: '매우 강함'
  };
  return labels[score] || '알 수 없음';
}
