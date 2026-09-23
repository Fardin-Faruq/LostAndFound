import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Claim } from '../models/Claim';
import { Item } from '../models/Item';
import { User } from '../models/User';

import { notificationService } from '../services/notificationService';

export const getClaimsForItem = async (req: AuthRequest, res: Response) => {
  try {
    const { itemId } = req.query;
    const isStaffOrAdmin = req.user?.role === 'ADMIN' || req.user?.role === 'OFFICE_STAFF';

    const filter: any =
      itemId === 'mine'
        ? { claimant: req.user?._id }
        : itemId && itemId !== 'all'
        ? { item: String(itemId) }
        : isStaffOrAdmin
        ? {}
        : { claimant: req.user?._id };

    const claims = await Claim.find(filter)
      .populate('claimant', 'name email')
      .populate('item', 'title location status category')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createClaimDirect = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const {
      itemId,
      proofDetails,
      explanation,
      whereLost,
      approximateDate,
      identifyingCharacteristics,
    } = req.body;

    if (!itemId) {
      res.status(400).json({ message: 'Item ID is required' });
      return;
    }

    const item = await Item.findById(itemId);
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

export const getMyClaims = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const claims = await Claim.find({ claimant: req.user._id as any })
      .populate('item', 'title category location status imageUrl physicalItemReceived')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getClaimById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const claim = await Claim.findById(req.params.id)
      .populate('claimant', 'name email')
      .populate('item', 'title category location status imageUrl physicalItemReceived storageLocation')
      .populate('reviewedBy', 'name email');

    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    const isStaffOrAdmin = req.user.role === 'ADMIN' || req.user.role === 'OFFICE_STAFF';
    const claimantId = (claim.claimant as any)?._id || claim.claimant;
    const isOwner = String(claimantId) === String(req.user._id);

    if (!isStaffOrAdmin && !isOwner) {
      res.status(403).json({ message: 'Not authorized to view this claim' });
      return;
    }

    res.json(claim);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelClaim = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    if (String(claim.claimant) !== String(req.user._id)) {
      res.status(403).json({ message: 'You can only cancel your own claims' });
      return;
    }

    if (claim.status === 'APPROVED' || claim.status === 'REJECTED') {
      res.status(400).json({ message: `Cannot cancel a claim that is already ${claim.status}` });
      return;
    }

    claim.status = 'CANCELLED';
    await claim.save();

    res.json({ message: 'Claim cancelled successfully', claim });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateClaimStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const user = await User.findById(req.user._id);
    const isStaffOrAdmin = user && (user.role === 'ADMIN' || user.role === 'OFFICE_STAFF');
    if (!isStaffOrAdmin) {
      res.status(403).json({ message: 'Only office admins can approve or reject claims' });
      return;
    }

    const { status, rejectionReason } = req.body;
    if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
      res.status(400).json({ message: 'Status must be APPROVED, REJECTED, or UNDER_REVIEW' });
      return;
    }

    const claim = await Claim.findById(req.params.id).populate('item');
    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    claim.status = status;
    claim.reviewedBy = req.user._id as any;
    claim.reviewedAt = new Date();
    if (rejectionReason) {
      claim.rejectionReason = String(rejectionReason).trim();
    }
    await claim.save();

    if (claim.item && status === 'APPROVED') {
      const itemId = (claim.item as any)._id || claim.item;
      await Item.findByIdAndUpdate(itemId, { status: 'CLAIMED' });
    }

    // Trigger notification to claimant
    await notificationService.notifyClaimStatusUpdate(
      String(claim.claimant),
      claim,
      status as any,
      claim.rejectionReason
    );

    res.json(claim);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

