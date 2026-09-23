import express from 'express';
import { createItem, getItems, getItemById, createClaim, getMyItems, getMatchesForUser } from '../controllers/itemController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, createItem)
  .get(getItems);

router.get('/mine', protect, getMyItems);
router.get('/matches', protect, getMatchesForUser);

router.route('/:id/claims')
  .post(protect, createClaim);

router.route('/:id')
  .get(getItemById);

export default router;
