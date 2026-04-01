const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
} = require('../utils/token');

const register = async (req, res) => {
  try {
    const { email, password, name, charity_id, charity_percentage } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ detail: 'Email, password, and name are required' });
    }

    const emailLower = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: emailLower,
        passwordHash,
        name,
        charityId: charity_id || null,
        charityPercentage: charity_percentage || 10,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        charityId: true,
        charityPercentage: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    const accessToken = createAccessToken(user.id, user.email);
    const refreshToken = createRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);
    res.json(user);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ detail: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password are required' });
    }

    const emailLower = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({ detail: 'Invalid email or password' });
    }

    const accessToken = createAccessToken(user.id, user.email);
    const refreshToken = createRefreshToken(user.id);

    setAuthCookies(res, accessToken, refreshToken);

    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Login failed' });
  }
};

const me = async (req, res) => {
  res.json(req.user);
};

const logout = async (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.json({ message: 'Logged out successfully' });
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ detail: 'No refresh token' });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (payload.type !== 'refresh') {
      return res.status(401).json({ detail: 'Invalid token type' });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(401).json({ detail: 'User not found' });
    }

    const newAccessToken = createAccessToken(user.id, user.email);

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(401).json({ detail: 'Invalid refresh token' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const emailLower = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailLower },
      select: { id: true },
    });

    if (!user) {
      return res.json({ message: 'If email exists, reset link has been sent' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    console.log(`Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${token}`);

    res.json({ message: 'If email exists, reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ detail: 'Failed to process request' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || new Date(resetToken.expiresAt) < new Date()) {
      return res.status(400).json({ detail: 'Invalid or expired token' });
    }

    const passwordHash = await bcrypt.hash(new_password, 10);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ detail: 'Failed to reset password' });
  }
};

module.exports = {
  register,
  login,
  me,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
};