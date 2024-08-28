import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Gmail',  // or another email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send verification email
export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your email address',
    html: `<p>Please click the following link to verify your email address:</p>
           <a href="${verificationUrl}">${verificationUrl}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error('Could not send verification email');
  }
};


export const sendResetPasswordEmail = async (email: string, resetUrl: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `<p>You requested to reset your password. Click the link below to reset it:</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (err) {
    console.error('Error sending reset email:', err);
    throw new Error('Could not send password reset email');
  }
};