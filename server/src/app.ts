import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './modules/auth/auth.routes';
import audioRoutes from './modules/audio/audio.routes';
import imageRoutes from './modules/image/image.routes';
import logsRoutes from './modules/logs/logs.routes';
import streakRoutes from './modules/streak/streak.routes';
import subscriptionRoutes from './modules/subscription/subscription.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { subscriptionMiddleware } from './middleware/subscription.middleware';
import { sendError } from './utils/response';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Each OpenAI-backed route gets its own limiter instance (separate 20-req quota per endpoint).
// authMiddleware is mounted first so req.user.uid is populated before keyGenerator runs.
const makeOpenAiLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    keyGenerator: (req) => req.user!.uid,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) =>
      sendError(res, 'Too many requests. Please slow down.', 429, 'RATE_LIMIT_EXCEEDED'),
  });

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/audio', authMiddleware, subscriptionMiddleware, makeOpenAiLimiter(), audioRoutes);
app.use('/api/image', authMiddleware, subscriptionMiddleware, makeOpenAiLimiter(), imageRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/streak', streakRoutes);
app.use('/api/subscription', subscriptionRoutes);

app.use(errorMiddleware);

export default app;
