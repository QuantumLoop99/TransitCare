import 'dotenv/config';
import { createApp } from './src/app.js';

const app = createApp();
const PORT = process.env.PORT || 3001;

process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled promise rejection (suppressed):', reason instanceof Error ? reason.message : reason);
});

process.on('uncaughtException', (err) => {
  console.warn('Uncaught exception (suppressed):', err?.message || err);
});

app.listen(PORT, () => {
  console.log(`TransitCare API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;