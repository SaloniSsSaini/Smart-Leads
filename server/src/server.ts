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

  const host = '0.0.0.0';
  httpServer.listen(env.port, host, () => {
    console.log(`Server running on http://${host}:${env.port}`);
    console.log(`Swagger docs: http://localhost:${env.port}/api/docs`);
    console.log(`WebSocket enabled`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
