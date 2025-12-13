import complaintsRouter from './complaints.js';
import dashboardRouter from './dashboard.js';
import usersRouter from './users.js';
import adminRouter from './admin.js';
import notificationsRouter from './notifications.js';
import reportsRouter from './reports.js';
import migrateRouter from './migrate.js';
import healthRouter from './health.js';

export function registerRoutes(app) {
  app.use('/api/complaints', complaintsRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/reports', reportsRouter);
  app.use('/api/migrate', migrateRouter);
  app.use('/api/health', healthRouter);
}
