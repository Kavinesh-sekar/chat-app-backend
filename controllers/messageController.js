const Message = require('../models/message');
const User = require('../models/user');

// Send a message
const sendMessage = async (req, res) => {
    console.log('inside send message', req.body);
    
  const { senderId, receiverId, content, mediaUrl } = req.body;

  try {
    // Check if sender and receiver exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new message
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      mediaUrl,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ message: 'Error sending message', error });
  }
};

// Get messages between two users
const getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 }); // Sort messages by timestamp

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

module.exports = { sendMessage, getMessages };
