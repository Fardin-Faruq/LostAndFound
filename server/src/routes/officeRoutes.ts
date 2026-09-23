import express from 'express';
import {
  getOfficeStats,
  getOfficeItems,
  receivePhysicalItem,
  returnItemToOwner,
  getOfficeClaims,
  reviewClaim,
  approveClaim,
  rejectClaim,
} from '../controllers/officeController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

// Guard all office routes for OFFICE_STAFF and ADMIN only
router.use(protect, authorize('OFFICE_STAFF', 'ADMIN'));

router.get('/stats', getOfficeStats);
router.get('/items', getOfficeItems);
router.put('/items/:id/receive', receivePhysicalItem);
router.put('/items/:id/return', returnItemToOwner);

router.get('/claims', getOfficeClaims);
router.put('/claims/:id/review', reviewClaim);
router.put('/claims/:id/approve', approveClaim);
router.put('/claims/:id/reject', rejectClaim);

export default router;
