
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authroute');
const messageRoutes = require('./routes/messageRoute');
const groupRoute = require('./routes/groupRoute');
const helmet = require('helmet');

const app = express();
app.use(helmet());

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Replace with your frontend URL for production
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', // Update for production
}));

// Connect to Database
connectDB()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoute);

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle joining a room for one-to-one private chat
  socket.on('join-room', ({ userId, chatPartnerId, groupId }) => {
    if (groupId) {
      // Join a group room
      socket.join(groupId);
      console.log(`User ${userId} joined group ${groupId}`);
    } else {
      // Join a private chat room
      const roomId = [userId, chatPartnerId].sort().join('-');
      socket.join(roomId);
      console.log(`User ${userId} joined private room ${roomId}`);
    }
  });

  // Handle sending private messages
  socket.on('send-message', ({ roomId, message }) => {
    io.to(roomId).emit('receive-message', message); // Broadcast message to private room
    console.log(`Private message sent to room ${roomId}:`, message);
  });

  // Handle sending group messages
  socket.on('send-group-message', ({ groupId, message }) => {
    io.to(groupId).emit('receive-message', message); // Broadcast message to group room
    console.log(`Group message sent to group ${groupId}:`, message);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });

  // Handle errors
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

// Default route
app.get('/', (req, res) => {
  res.send('Socket.IO Chat Server is running');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
