import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, getUserById, users } from '../config/dataStore.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'urbancartsecretkey9876543210', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' });
  }

  try {
    const userExists = getUserByEmail(email);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Determine role (e.g. admin if email contains admin@urbancart.com or has a query parameter for dev/seed purposes)
    let role = 'user';
    if (email.toLowerCase().endsWith('@urbancart.admin') || email.toLowerCase() === 'admin@urbancart.com') {
      role = 'admin';
    }

    const user = await createUser({ name, email, password, role });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const rawUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (rawUser && (await bcrypt.compare(password, rawUser.password))) {
      res.json({
        _id: rawUser.id,
        name: rawUser.name,
        email: rawUser.email,
        role: rawUser.role,
        token: generateToken(rawUser.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  // req.user was attached by protect middleware
  if (req.user) {
    res.json({
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
