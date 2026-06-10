import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './modules/auth/auth.routes';
import audioRoutes from './modules/audio/audio.routes';
import logsRoutes from './modules/logs/logs.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/logs', logsRoutes);

app.use(errorMiddleware);

export default app;
