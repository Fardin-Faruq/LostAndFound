import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { processImagePayload } from '../services/imageService';

export const uploadImage = async (req: AuthRequest, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400).json({ message: 'Image payload is required' });
      return;
    }

    const result = await processImagePayload(image);
    res.status(201).json({
      url: result.url,
      mimeType: result.mimeType,
      sizeBytes: result.bytes,
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Image processing failed' });
  }
};
