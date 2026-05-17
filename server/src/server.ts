import http from 'http';
import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { initSocket } from './socket';
import { startCronJobs } from './jobs/cron';

const start = async (): Promise<void> => {
  await connectDB();
  startCronJobs();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    console.log(`Swagger docs: http://localhost:${env.port}/api/docs`);
    console.log(`WebSocket enabled`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
