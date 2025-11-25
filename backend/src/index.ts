import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import categoryRoutes from './routes/categories';
import contentRoutes from './routes/content';
import mediaRoutes from './routes/media';
import progressRoutes from './routes/progress';
import forumRoutes from './routes/forums';
import messageRoutes from './routes/messages';
import videoRoutes from './routes/video';
import analyticsRoutes from './routes/analytics';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'LMS API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user room for direct messaging
  socket.on('join_user', (userId: string) => {
    socket.join(`user:${userId}`);
  });

  // Join forum room
  socket.on('join_forum', (forumId: string) => {
    socket.join(`forum:${forumId}`);
  });

  // Leave forum room
  socket.on('leave_forum', (forumId: string) => {
    socket.leave(`forum:${forumId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Export io for use in routes
app.set('io', io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { app, io };

