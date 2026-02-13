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
 * - Minimum 12 characters
 * - Must include lowercase letter
 * - Must include uppercase letter
 * - Must include number
 * - Must include special character (@$!%*#?&)
 * - Cannot contain common passwords
 * - Cannot contain email or name
 * - Password strength score must be >= 3 (via zxcvbn)
 *
 * @param {string} password - The password to validate
 * @param {string} email - User's email (to prevent password containing email)
 * @param {string} name - User's name (to prevent password containing name)
 * @returns {object} Validation result with { valid, errors, score }
 */
export function validatePassword(password, email = '', name = '') {
  const errors = [];

  // Check minimum length
  if (password.length < 12) {
    errors.push('비밀번호는 최소 12자 이상이어야 합니다');
  }

  // Check maximum length (prevent DoS attacks via bcrypt)
  if (password.length > 128) {
    errors.push('비밀번호는 최대 128자까지 가능합니다');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('영문 소문자를 포함해야 합니다');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('영문 대문자를 포함해야 합니다');
  }

  // Check for number
  if (!/\d/.test(password)) {
    errors.push('숫자를 포함해야 합니다');
  }

  // Check for special character
  if (!/[@$!%*#?&]/.test(password)) {
    errors.push('특수문자(@$!%*#?&)를 포함해야 합니다');
  }

  // Check if password contains common passwords
  const lowerPassword = password.toLowerCase();
  if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common.toLowerCase()))) {
    errors.push('흔히 사용되는 비밀번호는 사용할 수 없습니다');
  }

  // Check if password contains email (case-insensitive)
  if (email && lowerPassword.includes(email.toLowerCase().split('@')[0])) {
    errors.push('비밀번호에 이메일을 포함할 수 없습니다');
  }

  // Check if password contains name (case-insensitive)
  if (name && name.length >= 3 && lowerPassword.includes(name.toLowerCase())) {
    errors.push('비밀번호에 이름을 포함할 수 없습니다');
  }

  // Use zxcvbn to check password strength
  // Pass email and name as user inputs to penalize passwords containing them
  const userInputs = [email, name].filter(Boolean);
  const result = zxcvbn(password, userInputs);

  // Score: 0 (weak) to 4 (strong)
  // Require at least score 3 (strong)
  if (result.score < 3) {
    errors.push('비밀번호가 너무 약합니다. 더 복잡한 비밀번호를 사용하세요');

    // Add specific feedback from zxcvbn if available
    if (result.feedback.warning) {
      errors.push(`힌트: ${result.feedback.warning}`);
    }
  }

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
