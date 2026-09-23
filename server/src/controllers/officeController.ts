import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { Item } from '../models/Item';
import { Claim } from '../models/Claim';
import { notificationService } from '../services/notificationService';

export const getOfficeStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalLost,
      totalFound,
      physicallyReceived,
      pendingClaims,
      matchedItems,
      returnedItems,
      unclaimedItems,
    ] = await Promise.all([
      Item.countDocuments({ type: 'LOST' }),
      Item.countDocuments({ type: 'FOUND' }),
      Item.countDocuments({ type: 'FOUND', physicalItemReceived: true }),
      Claim.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
      Item.countDocuments({ status: 'MATCH_FOUND' }),
      Item.countDocuments({ status: 'RETURNED' }),
      Item.countDocuments({ type: 'FOUND', status: 'REPORTED', physicalItemReceived: true }),
    ]);

    res.json({
      totalLost,
      totalFound,
      physicallyReceived,
      pendingClaims,
      matchedItems,
      returnedItems,
      unclaimedItems,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOfficeItems = async (req: AuthRequest, res: Response) => {
  try {
    const { received, category, status, search } = req.query;

    const filter: any = { type: 'FOUND' };

    if (received === 'true') {
      filter.physicalItemReceived = true;
    } else if (received === 'false') {
      filter.physicalItemReceived = false;
    }

    if (category && category !== 'ALL') {
      filter.category = category;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    if (search) {
      const q = String(search).trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { storageReference: { $regex: q, $options: 'i' } },
        { storageLocation: { $regex: q, $options: 'i' } },
      ];
    }

    const items = await Item.find(filter)
      .populate('reporter', 'name email')
      .populate('receivedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const receivePhysicalItem = async (req: AuthRequest, res: Response) => {
  try {
    const { storageReference, storageLocation, verificationStatus = 'VERIFIED' } = req.body;

    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    item.physicalItemReceived = true;
    item.receivedAt = new Date();
    item.receivedBy = req.user?._id as any;
    item.storageReference = storageReference ? String(storageReference).trim() : 'SHELF-DEFAULT';
    item.storageLocation = storageLocation ? String(storageLocation).trim() : 'Lost & Found Main Office';
    item.verificationStatus = verificationStatus;

    await item.save();

    // Notify the finder/reporter
    if (item.reporter) {
      await notificationService.notifyItemReceivedByOffice(
        String(item.reporter),
        item,
        item.storageLocation
      );
    }

    res.json({
      message: 'Physical item receipt recorded successfully',
      item,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const returnItemToOwner = async (req: AuthRequest, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }

    item.status = 'RETURNED';
    item.returnedAt = new Date();
    item.returnedBy = req.user?._id as any;

    await item.save();

    // Find approved claim if exists to notify claimant
    const approvedClaim = await Claim.findOne({ item: item._id as any, status: 'APPROVED' });
    if (approvedClaim && approvedClaim.claimant) {
      await notificationService.notifyItemReturned(String(approvedClaim.claimant), item);
    }

    res.json({
      message: 'Item handover recorded and status set to RETURNED',
      item,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getOfficeClaims = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const filter: any = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const claims = await Claim.find(filter)
      .populate('claimant', 'name email')
      .populate('item', 'title category location status physicalItemReceived storageReference storageLocation')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const reviewClaim = async (req: AuthRequest, res: Response) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    claim.status = 'UNDER_REVIEW';
    claim.reviewedBy = req.user?._id as any;
    claim.reviewedAt = new Date();
    await claim.save();

    await notificationService.notifyClaimStatusUpdate(
      String(claim.claimant),
      claim,
      'UNDER_REVIEW'
    );

    res.json(claim);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const approveClaim = async (req: AuthRequest, res: Response) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    claim.status = 'APPROVED';
    claim.reviewedBy = req.user?._id as any;
    claim.reviewedAt = new Date();
    await claim.save();

    // Mark item as claimed
    await Item.findByIdAndUpdate(claim.item, { status: 'CLAIMED' });

    // Notify claimant
    await notificationService.notifyClaimStatusUpdate(
      String(claim.claimant),
      claim,
      'APPROVED'
    );

    res.json(claim);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const rejectClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { rejectionReason } = req.body;
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    claim.status = 'REJECTED';
    claim.rejectionReason = rejectionReason ? String(rejectionReason).trim() : 'Insufficient proof of ownership';
    claim.reviewedBy = req.user?._id as any;
    claim.reviewedAt = new Date();
    await claim.save();

    // Notify claimant
    await notificationService.notifyClaimStatusUpdate(
      String(claim.claimant),
      claim,
      'REJECTED',
      claim.rejectionReason
    );

    res.json(claim);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
