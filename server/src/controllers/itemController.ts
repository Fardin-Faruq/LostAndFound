import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Item } from '../models/Item';
import { Claim } from '../models/Claim';

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, category, description, brand, color, location, dateLostOrFound, imageUrl } = req.body;

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
      imageUrl,
      reporter: req.user._id as any,
    });

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

    const items = await Item.find(filter)
      .sort(sortOption)
      .populate('reporter', 'name email');

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

const normalize = (value?: string) => String(value || '').trim().toLowerCase();

export const getMatchesForUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const lostItems = await Item.find({ reporter: req.user._id as any, type: 'LOST' });
    const foundItems = await Item.find({ type: 'FOUND', status: { $in: ['REPORTED', 'MATCH_FOUND'] } })
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 });

    const matches = foundItems.map((foundItem) => {
      const candidates = lostItems.map((lostItem) => {
        let score = 0;
        const reasons: string[] = [];
        const fields: Array<[keyof typeof lostItem, string]> = [
          ['category', 'category'],
          ['color', 'color'],
          ['location', 'location'],
          ['brand', 'brand'],
        ];

        fields.forEach(([field, label]) => {
          const lostValue = normalize(lostItem[field] as string);
          const foundValue = normalize(foundItem[field] as string);
          if (lostValue && foundValue && lostValue === foundValue) {
            score += field === 'category' ? 35 : field === 'location' ? 25 : 15;
            reasons.push(label);
          }
        });

        const lostTitle = normalize(lostItem.title);
        const foundTitle = normalize(foundItem.title);
        if (lostTitle && foundTitle && (lostTitle.includes(foundTitle) || foundTitle.includes(lostTitle))) {
          score += 20;
          reasons.push('title');
        }

        return { lostItem, score, reasons };
      }).sort((left, right) => right.score - left.score)[0];

      return candidates && candidates.score >= 35 ? {
        foundItem,
        lostItem: candidates.lostItem,
        score: Math.min(candidates.score, 100),
        reasons: candidates.reasons,
      } : null;
    }).filter(Boolean);

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

    const { proofDetails } = req.body;
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
      status: 'PENDING',
    });

    res.status(201).json(claim);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
