
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



dotenv.config();



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST']
  }
});


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*', 
}));
app.use(helmet());

// Connect to Database
connectDB()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoute);

// Socket.IO 
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

 
  socket.on('join-room', ({ userId, chatPartnerId, groupId }) => {
    if (groupId) {
     
      socket.join(groupId);
      console.log(`User ${userId} joined group ${groupId}`);
    } else {
      
      const roomId = [userId, chatPartnerId].sort().join('-');
      socket.join(roomId);
      console.log(`User ${userId} joined private room ${roomId}`);
    }
  });

  
  socket.on('send-message', ({ roomId, message }) => {
    io.to(roomId).emit('receive-message', message); 
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


app.get('/', (req, res) => {
  res.send('Socket.IO Chat Server is running');
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
