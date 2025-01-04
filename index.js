const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authroute');
const messageRoutes = require('./routes/messageRoute');
const groupRoute = require('./routes/groupRoute');

// Load environment variables
dotenv.config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
app.use(express.json()); // Add this line to parse JSON request bodies
app.use(express.urlencoded({ extended: true }));


app.use(cors());

connectDB();




app.use('/api/auth', authRoutes);

app.use('/api/messages', messageRoutes);

app.use('/api/groups',groupRoute)



// Initialize Socket.IO

const io = new Server(server, {
    cors: {
      origin: '*', // Update with your frontend origin
    },
  });
  
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    // Join a room for one-to-one chat
    socket.on('join-room', ({ userId, chatPartnerId }) => {
      const roomId = [userId, chatPartnerId].sort().join('-');
      socket.join(roomId);
    });
  
    // Handle sending messages
    socket.on('send-message', ({ roomId, message }) => {
      io.to(roomId).emit('receive-message', message);
    });
  
    // Disconnect event
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });
  


// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});













// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// const port = 5000;

// // Connect to MongoDB
// mongoose.connect('mongodb://localhost:27017/develpoment-chat')
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Error connecting to MongoDB:', err));

// // Middleware
// app.use(cors());
// app.use(express.json()); // Parse JSON request bodies

// const testSchema  = new mongoose.Schema({
//     name:{
//       type:String,
//       required:true
//     }
// })

// const collection = mongoose.model('test',testSchema);

// const passwordscheme = new mongoose.Schema({

//   password:{
//     type:String,
//     required:true 
//   }
// })

// const collection2 = mongoose.model('password',passwordscheme);

// passs = {
//   password:'kavin123'
// }

// collection2.insertMany([passs]) 

// data = {
//   name:'kavin'
// }
// collection.insertMany([data])


// app.get('/api/test',async(req,res)=>{

//   try {
//     const users = await collection.find();
//     console.log('Users:', users); 
    
//     res.json(users);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Error fetching users' });
//   }
// })



// // Start the server
// app.listen(port, () => {
//   console.log(`Server listening on port ${port}`);
// });