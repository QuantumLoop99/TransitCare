import express, { urlencoded } from 'express';
import cors from 'cors';
import { connectToDatabase } from './config/db.js';
import { registerRoutes } from './routes/index.js';
import { safeJson } from './middlewares/safeJson.js';
import { initializeDefaultSettings } from './models/Settings.js';

export function createApp() {
  connectToDatabase(process.env.MONGODB_URI);

  // Initialize default settings after database connection
  setTimeout(() => initializeDefaultSettings(), 1000);

  const app = express();

  app.use(cors());
  app.use(safeJson);
  app.use(urlencoded({ extended: true }));

  registerRoutes(app);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong!',
      message: err.message,
    });
  });

  app.use((req, res) => {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found',
    });
  });

  return app;
}
