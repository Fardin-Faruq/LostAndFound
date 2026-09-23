import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  updateClaimStatus,
  getClaimsForItem,
  createClaimDirect,
  getMyClaims,
  getClaimById,
  cancelClaim,
} from '../controllers/claimController';

const router = express.Router();

router.route('/')
  .get(protect, getClaimsForItem)
  .post(protect, createClaimDirect);

router.get('/my', protect, getMyClaims);
router.get('/:id', protect, getClaimById);
router.put('/:id/cancel', protect, cancelClaim);
router.put('/:id/status', protect, updateClaimStatus);

export default router;

