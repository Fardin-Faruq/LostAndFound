import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Claim } from '../models/Claim';
import { Item } from '../models/Item';
import { User } from '../models/User';

export const getClaimsForItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.query;

    const filter: any = itemId === 'mine'
      ? { claimant: req.user?._id }
      : itemId && itemId !== 'all'
        ? { item: String(itemId) }
        : req.user?.role === 'ADMIN' ? {} : { claimant: req.user?._id };

    const claims = await Claim.find(filter)
      .populate('claimant', 'name email')
      .populate('item', 'title location status')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateClaimStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only office admins can approve or reject claims' });
      return;
    }

    const { status } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ message: 'Status must be APPROVED or REJECTED' });
      return;
    }

    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    claim.status = status;
    await claim.save();

    if (claim.item && status === 'APPROVED') {
      const itemId = (claim.item as any)._id || claim.item;
      await Item.findByIdAndUpdate(itemId, { status: 'CLAIMED' });
    }

    res.json(claim);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
