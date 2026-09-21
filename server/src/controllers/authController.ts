import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';

const generateToken = (id: string) => {
  const secret = process.env.JWT_SECRET || 'secret';
  const expiresIn = (process.env.JWT_EXPIRES_IN || '30d') as SignOptions['expiresIn'];

  return jwt.sign({ id }, secret, {
    expiresIn,
  });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(String(user._id)),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(String(user._id)),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
       res.status(401).json({ message: 'User not found' });
       return;
    }
    res.json(req.user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
