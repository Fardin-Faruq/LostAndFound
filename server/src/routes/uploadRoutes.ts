import express from 'express';
import { uploadImage } from '../controllers/uploadController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, uploadImage);

export default router;
