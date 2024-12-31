const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors());

// Initialize Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // React app URL
        methods: ['GET', 'POST'],
    },
});

// Connect to MongoDB
connectDB();

// Define User model
const User = mongoose.model('users', new mongoose.Schema({
    userName: { type: String, required: true },
    password: { type: String, required: true }
}));

// Define a basic API route
app.get('/api', (req, res) => {
    res.send('Hello World');
});

// Get user by ID
app.get('/user/:id', async (req, res) => {
    // const User = mongoose.model('users', schema);
    try {
        const id = req.params.id;

        console.log('User ID:', id);    
        

        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Find the user by ID
        const user = await User.findById(id);

        console.log('User:', user);
        

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred' });
    }
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('message', (data) => {
        console.log('Message from client:', data);
        io.emit('message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
