import express from 'express';
import { createItem, getItems, getItemById } from '../controllers/itemController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post(protect, createItem)
  .get(getItems);

router.route('/:id')
  .get(getItemById);

export default router;
