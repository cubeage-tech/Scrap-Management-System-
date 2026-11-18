import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import { port, clientUrls } from './src/core/config/db.js';
import prisma from './src/core/lib/prisma.js';
import { validateEnvironment } from './src/config/validateEnv.js';
import { startLifecycleScheduler } from './src/core/scheduler/lifecycle.scheduler.js';

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || clientUrls.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.on('join:auction', (auctionId) => {
    if (auctionId) {
      socket.join(`auction:${auctionId}`);
    }
  });

  socket.on('leave:auction', (auctionId) => {
    if (auctionId) {
      socket.leave(`auction:${auctionId}`);
    }
  });
});

const startServer = async () => {
  try {
    validateEnvironment();
    await prisma.$connect();
    console.log('✅ Database Connected');

    startLifecycleScheduler();

    server.listen(port, () => {
      console.log(`🚀 Server with WebSocket running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database');
    console.error(error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
