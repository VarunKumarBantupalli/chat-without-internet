// server.js (ESM)
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDb from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

import { initBroadcastThread } from './utils/initBroadcastThread.js';
import { attachSocketAuth } from './middleware/authSocket.js';
import { registerSockets } from './sockets/index.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: '*', // tighten to your client origin if desired
    credentials: true,
  })
);

// REST Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

async function start() {
  try {
    // 1) DB
    await connectDb();
    console.log('[db] connected');

    // 2) Ensure single broadcast thread and keep its _id
    const broadcastThreadId = await initBroadcastThread();
    console.log('[seed] broadcast thread is ready:', String(broadcastThreadId));

    // 3) HTTP + Socket.IO
    const server = createServer(app);
    const io = new Server(server, {
      cors: { origin: '*', credentials: true },
      transports: ['websocket', 'polling'],
    });

    // 4) Socket auth + handlers (pass broadcastThreadId down)
    attachSocketAuth(io);
    registerSockets(io, { broadcastThreadId });

    // 5) Expose to app (optional, handy in routes/controllers)
    app.set('io', io);
    app.set('broadcastThreadId', broadcastThreadId);

    // 6) Start
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
}

start();

export default app;
