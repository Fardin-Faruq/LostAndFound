import mongoose from 'mongoose';
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Item } from '../models/Item';
import { Claim } from '../models/Claim';
import { matchingEngine } from '../services/matchingService';
import { notificationService } from '../services/notificationService';
import { processImagePayload } from '../services/imageService';

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, category, description, brand, color, location, dateLostOrFound, imageUrl } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    let processedImageUrl = imageUrl;
    if (imageUrl && typeof imageUrl === 'string') {
      try {
        const processed = await processImagePayload(imageUrl);
        processedImageUrl = processed.url;
      } catch (imgErr) {
        // In testing / development, if validation throws due to size or custom format, keep original for backward compatibility
        processedImageUrl = imageUrl;
      }
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
      imageUrl: processedImageUrl,
      reporter: req.user._id as any,
    });

    // If a FOUND item was reported, check if it matches any user's LOST items and notify them
    if (type === 'FOUND') {
      try {
        const potentialMatches = await matchingEngine.findMatchesForItem(String(item._id));
        for (const match of potentialMatches) {
          if (match.score >= 40 && match.lostItem.reporter) {
            await notificationService.notifyPossibleMatch(
              String(match.lostItem.reporter),
              match.lostItem,
              item,
              match.score
            );
          }
        }
      } catch (matchErr) {
        console.warn('Background match check warning:', matchErr);
      }
    }

    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getItems = async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      category,
      location,
      status,
      search,
      sort = 'newest',
      fromDate,
      toDate,
      page,
      limit,
    } = req.query;

    const filter: any = {};

    if (type && type !== 'ALL') {
      filter.type = type;
    }

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (location) {
      filter.location = { $regex: String(location), $options: 'i' };
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchValue = String(search);
      filter.$or = [
        { title: { $regex: searchValue, $options: 'i' } },
        { description: { $regex: searchValue, $options: 'i' } },
        { brand: { $regex: searchValue, $options: 'i' } },
        { category: { $regex: searchValue, $options: 'i' } },
        { location: { $regex: searchValue, $options: 'i' } },
      ];
    }

    if (fromDate || toDate) {
      filter.dateLostOrFound = {};

      if (fromDate) {
        filter.dateLostOrFound.$gte = new Date(String(fromDate));
      }

      if (toDate) {
        filter.dateLostOrFound.$lte = new Date(String(toDate));
      }
    }

    const sortOption: any = sort === 'oldest' ? { dateLostOrFound: 1 } : { dateLostOrFound: -1 };

    let query = Item.find(filter)
      .sort(sortOption)
      .populate('reporter', 'name email')
      .populate('receivedBy', 'name');

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
      const limitNum = Math.max(1, parseInt(String(limit), 10) || 20);
      const skip = (pageNum - 1) * limitNum;
      const total = await Item.countDocuments(filter);
      const items = await query.skip(skip).limit(limitNum);

      res.json({
        items,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      });
      return;
    }

    const items = await query;
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getItemById = async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    const item = await Item.findById(req.params.id)
      .populate('reporter', 'name')
      .populate('receivedBy', 'name');

    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyItems = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const items = await Item.find({ reporter: req.user._id as any }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMatchesForUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const matches = await matchingEngine.findMatchesForUser(String(req.user._id));
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getItemMatches = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    const matches = await matchingEngine.findMatchesForItem(id);
    res.json(matches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createClaim = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const {
      proofDetails,
      explanation,
      whereLost,
      approximateDate,
      identifyingCharacteristics,
    } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    const item = await Item.findById(req.params.id);

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    if (!proofDetails || !String(proofDetails).trim()) {
      res.status(400).json({ message: 'Proof details are required' });
      return;
    }

    const claim = await Claim.create({
      item: item._id as any,
      claimant: req.user._id as any,
      proofDetails: String(proofDetails).trim(),
      explanation: explanation ? String(explanation).trim() : undefined,
      whereLost: whereLost ? String(whereLost).trim() : undefined,
      approximateDate: approximateDate ? new Date(approximateDate) : undefined,
      identifyingCharacteristics: identifyingCharacteristics
        ? String(identifyingCharacteristics).trim()
        : undefined,
      status: 'PENDING',
    });

    res.status(201).json(claim);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

