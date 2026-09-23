import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { updateClaimStatus, getClaimsForItem } from '../controllers/claimController';

const router = express.Router();

router.route('/').get(protect, getClaimsForItem);
router.route('/:id/status').put(protect, updateClaimStatus);

export default router;
