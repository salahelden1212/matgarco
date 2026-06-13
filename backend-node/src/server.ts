import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

import app from './app';
import logger from './utils/logger';
import { connectDatabase } from './config/database';
import { seedDefaultAccounts } from './utils/seedDefaultAccounts';
import { queueService } from './services/queue.service';
import { registerWorkers } from './services/queueWorkers';

const PORT = process.env.PORT || 5000;

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGO_URI'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  logger.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Seed default accounts
    await seedDefaultAccounts();

    // Initialize background job queue
    try {
      queueService.init();
      registerWorkers();
      logger.info('Background job queue initialized');
    } catch (err: any) {
      logger.warn('Queue initialization skipped (Redis not available): ' + err.message);
    }
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`Server started on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection', { reason: reason.message, stack: reason.stack });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

startServer();
