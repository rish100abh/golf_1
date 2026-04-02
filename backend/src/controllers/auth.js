import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import {
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
} from '../utils/token.js';

export const register = async (req, res) => {
  // Your exact code - just change require → import
  try {
    const { email, password, name, charity_id, charity_percentage } = req.body;
    // ... rest of your exact code unchanged
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ detail: 'Registration failed' });
  }
};

// Export all your functions exactly the same
export const login = async (req, res) => { /* your exact code */ };
export const me = async (req, res) => { /* your exact code */ };
// ... all other functions unchanged