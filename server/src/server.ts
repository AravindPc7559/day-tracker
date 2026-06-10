import { env } from './config/env';
import app from './app';
import { logger } from './utils/logger';

const PORT = Number(env.PORT);

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT} [${env.NODE_ENV}]`);
});
