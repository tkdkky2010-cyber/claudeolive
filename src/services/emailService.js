import nodemailer from 'nodemailer';
import crypto from 'crypto';

/**
 * Email service for sending verification emails and notifications
 */

// Create SMTP transporter
let transporter = null;

// Initialize transporter only if SMTP credentials are configured
function getTransporter() {
  if (!transporter) {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    // Check if SMTP is configured
    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('⚠️  SMTP not configured. Email verification will be logged to console only.');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort) || 587,
      secure: parseInt(smtpPort) === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    console.log('✅ Email transporter initialized');
  }

  return transporter;
}

/**
 * Generate a secure random verification token
 * @returns {string} 64-character hex token
 */
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send email verification email to user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @param {string} name - User's name (optional)
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(email, token, name = null) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: '올리브영 랭킹 - 이메일 인증',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #00c73c; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button {
            display: inline-block;
            background-color: #00c73c;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>올리브영 랭킹</h1>
          </div>
          <div class="content">
            <h2>안녕하세요${name ? ', ' + name + '님' : ''}!</h2>
            <p>회원가입을 완료하려면 아래 버튼을 클릭하여 이메일을 인증해주세요.</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">이메일 인증하기</a>
            </p>
            <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
            <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd;">
              ${verificationUrl}
            </p>
            <p style="color: #666; font-size: 14px;">
              ⏰ 이 링크는 24시간 동안 유효합니다.<br>
              본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.
            </p>
          </div>
          <div class="footer">
            <p>© 2026 올리브영 랭킹. All rights reserved.</p>
            <p>이 이메일은 발신 전용입니다.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
안녕하세요${name ? ', ' + name + '님' : ''}!

회원가입을 완료하려면 아래 링크를 클릭하여 이메일을 인증해주세요:
${verificationUrl}

이 링크는 24시간 동안 유효합니다.
본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.

© 2026 올리브영 랭킹
    `
  };

  const transporterInstance = getTransporter();

  // If SMTP is not configured, log to console instead
  if (!transporterInstance) {
    console.log('\n📧 [Email Verification - Console Mode]');
    console.log('To:', email);
    console.log('Verification URL:', verificationUrl);
    console.log('Token:', token);
    console.log('----------------------------------------\n');
    return;
  }

  // Send email via SMTP
  try {
    await transporterInstance.sendMail(mailOptions);
    console.log('✅ Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    // Log to console as fallback
    console.log('\n📧 [Email Verification - Fallback]');
    console.log('To:', email);
    console.log('Verification URL:', verificationUrl);
    console.log('----------------------------------------\n');
    throw error; // Re-throw to let caller handle it
  }
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @param {string} name - User's name (optional)
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(email, resetToken, name = null) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: '올리브영 랭킹 - 비밀번호 재설정',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #00c73c; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button {
            display: inline-block;
            background-color: #00c73c;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>올리브영 랭킹</h1>
          </div>
          <div class="content">
            <h2>비밀번호 재설정 요청${name ? ' - ' + name + '님' : ''}</h2>
            <p>비밀번호를 재설정하려면 아래 버튼을 클릭하세요:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">비밀번호 재설정하기</a>
            </p>
            <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
            <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd;">
              ${resetUrl}
            </p>
            <div class="warning">
              <strong>⚠️ 보안 알림:</strong><br>
              • 이 링크는 1시간 동안만 유효합니다.<br>
              • 본인이 요청하지 않은 경우, 이 이메일을 무시하고 즉시 비밀번호를 변경하세요.
            </div>
          </div>
          <div class="footer">
            <p>© 2026 올리브영 랭킹. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
비밀번호 재설정 요청${name ? ' - ' + name + '님' : ''}

비밀번호를 재설정하려면 아래 링크를 클릭하세요:
${resetUrl}

⚠️ 이 링크는 1시간 동안만 유효합니다.
본인이 요청하지 않은 경우, 이 이메일을 무시하고 즉시 비밀번호를 변경하세요.

© 2026 올리브영 랭킹
    `
  };

  const transporterInstance = getTransporter();

  if (!transporterInstance) {
    console.log('\n📧 [Password Reset - Console Mode]');
    console.log('To:', email);
    console.log('Reset URL:', resetUrl);
    console.log('----------------------------------------\n');
    return;
  }

  try {
    await transporterInstance.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    console.log('\n📧 [Password Reset - Fallback]');
    console.log('To:', email);
    console.log('Reset URL:', resetUrl);
    console.log('----------------------------------------\n');
    throw error;
  }
}
