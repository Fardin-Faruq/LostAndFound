import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import itemRoutes from './routes/itemRoutes';
import claimRoutes from './routes/claimRoutes';
import officeRoutes from './routes/officeRoutes';
import notificationRoutes from './routes/notificationRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app = express();

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Robust uploads directory resolution
const uploadsDir = (() => {
  const dirFromDirname = path.resolve(__dirname, '../uploads');
  if (fs.existsSync(dirFromDirname)) return dirFromDirname;
  const dirInCwd = path.join(process.cwd(), 'uploads');
  if (fs.existsSync(dirInCwd)) return dirInCwd;
  const dirInServerCwd = path.join(process.cwd(), 'server', 'uploads');
  if (fs.existsSync(dirInServerCwd)) return dirInServerCwd;
  try {
    fs.mkdirSync(dirFromDirname, { recursive: true });
    return dirFromDirname;
  } catch {
    return dirInCwd;
  }
})();

// Serve uploaded images statically with explicit CORS and Cross-Origin-Resource-Policy
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(uploadsDir)
);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'API is running...',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/office', officeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

export default app;

