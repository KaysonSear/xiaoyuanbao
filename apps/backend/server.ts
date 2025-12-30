import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

// Initialize Next.js
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Initialize Prisma (for saving messages)
const prisma = new PrismaClient();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all origins for mobile app
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's own room for receiving private messages
    socket.on('join_room', (userId: string) => {
      socket.join(userId);
      console.log(`User ${socket.id} joined room ${userId}`);
    });

    // Handle sending messages
    socket.on(
      'send_message',
      async (data: { senderId: string; receiverId: string; content: string }) => {
        console.log('Received message:', data);

        try {
          // Save to database
          const message = await prisma.message.create({
            data: {
              senderId: data.senderId,
              receiverId: data.receiverId,
              content: data.content,
              type: 'text',
            },
          });

          // Broadcast to receiver's room
          io.to(data.receiverId).emit('receive_message', message);
          // Also emit back to sender (optional, for confirmation if needed, though they usually optimistically update)
          // io.to(data.senderId).emit('message_sent', message);
        } catch (error) {
          console.error('Error saving message:', error);
          socket.emit('error', { message: 'Failed to save message' });
        }
      }
    );

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
