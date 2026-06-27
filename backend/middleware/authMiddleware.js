import jwt from 'jsonwebtoken';
import { getUserById } from '../config/dataStore.js';

export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'urbancartsecretkey9876543210');
      
      // Get user from the data store
      const user = getUserById(decoded.id);
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin role required' });
  }
};
