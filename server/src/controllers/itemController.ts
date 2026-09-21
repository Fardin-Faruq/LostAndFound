import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Item } from '../models/Item';

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, category, description, brand, color, location, dateLostOrFound } = req.body;

    if (!req.user) {
       res.status(401).json({ message: 'User not found' });
       return;
    }

    const item = await Item.create({
      type,
      title,
      category,
      description,
      brand,
      color,
      location,
      dateLostOrFound,
      reporter: req.user._id,
    });

    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getItems = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    
    const items = await Item.find(filter).sort({ createdAt: -1 }).populate('reporter', 'name email');
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getItemById = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Item.findById(req.params.id).populate('reporter', 'name');
    
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
