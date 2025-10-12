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
    origin: '*',          // tighten to your client origin if you want
    credentials: true,
  })
);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

async function start() {
  try {
    await connectDb();
    console.log('[db] connected');

    await initBroadcastThread();
    console.log('[seed] broadcast thread is ready');

    // Create HTTP server and Socket.IO
    const server = createServer(app);
    const io = new Server(server, {
      cors: { origin: '*', credentials: true },
      transports: ['websocket', 'polling'],
    });

    // Attach auth middleware and register handlers
    attachSocketAuth(io);
    registerSockets(io);

    // Expose io if needed by routes/controllers
    app.set('io', io);

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
