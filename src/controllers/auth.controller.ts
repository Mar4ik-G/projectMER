import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import { sendResetPasswordEmail, sendVerificationEmail } from '../services/email.service';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

// Function to generate access token
const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

// Function to generate refresh token
const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Register User
export const register = async (req: Request, res: Response) => {

  console.log(req.body,"req.body");

  const { name, email, password } = req.body;

  // Generate a verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationToken,  // Store the verification token
    });
    await newUser.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Verify Email Token
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = null;  // Clear the token after verification
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login User
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user : IUser | null = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate Access Token and Refresh Token
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Optionally, save the refresh token to the database or send it as a secure cookie
    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Token Refresh
export const refresh = (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };

    // Generate a new access token
    const newAccessToken = generateAccessToken(decoded.id);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
};


export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetPasswordExpires);
    await user.save();

    // Send reset password email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendResetPasswordEmail(user.email, resetUrl);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const validateResetToken = async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.status(200).json({ message: 'Token is valid' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash the new password
    // Update user's password and clear reset token
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};