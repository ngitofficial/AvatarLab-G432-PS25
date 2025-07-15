import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware'; // Import AuthRequest for getProfile
import mongoose from 'mongoose'; // Import mongoose to check for specific error types

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // --- ADDED LOGGING ---
    console.log('--- Register Attempt ---');
    console.log('Request Body:', { name, email, password: '[HIDDEN]' }); // Log input, hide password

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn('Registration failed: User already exists for email:', email);
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password Hashed. First 10 chars of hash:', hashedPassword.substring(0, 10) + '...');

    // Create user instance
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    // --- CRUCIAL: Attempt to save the user ---
    await user.save(); // This is the line that needs to succeed for data to be stored

    // --- ADDED LOGGING ---
    console.log('User saved successfully to MongoDB! User ID:', user._id, 'Email:', user.email);
    console.log('--- Register Success ---');

    // Generate JWT
    const payload = {
      userId: user._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '7d',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) { // Using 'any' to easily access error properties
    console.error('--- Registration Error Details ---');
    if (error instanceof mongoose.Error.ValidationError) {
      // Mongoose validation error (e.g., required field missing, minlength not met)
      console.error('Mongoose Validation Error:', error.message);
      for (const field in error.errors) {
        console.error(`  Field: ${field}, Message: ${error.errors[field].message}`);
      }
      res.status(400).json({ message: 'Validation failed', errors: error.errors });
    } else if (error.code === 11000) {
      // MongoDB duplicate key error (e.g., trying to register with an email that's already unique)
      console.error('MongoDB Duplicate Key Error (Code 11000):', error.message);
      res.status(400).json({ message: 'Email already registered or duplicate key error.' });
    } else {
      // Any other unexpected error
      console.error('Generic Registration Error:', error);
      res.status(500).json({ message: 'Server error during registration.' });
    }
    console.error('--- End Registration Error Details ---');
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // --- ADDED LOGGING ---
    console.log('--- Login Attempt ---');
    console.log('Login Request Body:', { email, password: '[HIDDEN]' });

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // --- ADDED LOGGING ---
    console.log('User found for login:', user.email);
    console.log('Plaintext password from request:', password);
    console.log('Hashed password from database:', user.password.substring(0, 10) + '...'); // Log first part of hash

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result (isMatch):', isMatch); // Should be true if passwords match
    if (!isMatch) {
      console.log('Login failed: Password mismatch for email:', email);
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const payload = {
      userId: user._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '7d',
    });

    // --- ADDED LOGGING ---
    console.log('Login successful for user:', user.email);
    console.log('--- Login Success ---');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('--- Login Error Details ---');
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
    console.error('--- End Login Error Details ---');
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // req.user is populated by authMiddleware
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};