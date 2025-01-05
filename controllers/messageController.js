const Message = require('../models/message');
const User = require('../models/user');
const cloudinary = require('../config/cloudinary');

// Send a message
// const sendMessage = async (req, res) => {
//     console.log('inside send message', req.body);
    
//   const { senderId, receiverId, content } = req.body;
//   const mediaUrl = req.file ? req.file.path : null;

//   try {
//     // Check if sender and receiver exist
//     const sender = await User.findById(senderId);
//     const receiver = await User.findById(receiverId);

//     if (!sender || !receiver) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Create a new message
//     const newMessage = new Message({
//       sender: senderId,
//       receiver: receiverId,
//       content,
//       mediaUrl,
//     });

//     await newMessage.save();
//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.error('Error sending message:', error.message);
//     res.status(500).json({ message: 'Error sending message', error });
//   }
// };


// const sendMessage = async (req, res) => {
//   console.log('Inside send message', req.body);

//   const { senderId, receiverId, content } = req.body;
//   const files = req.files; 
//   console.log('files',files);
  
//   // Use req.files to handle both single and multiple uploads

//   try {
//       // Check if sender and receiver exist
//       const sender = await User.findById(senderId);
//       const receiver = await User.findById(receiverId);

//       if (!sender || !receiver) {
//           return res.status(404).json({ message: 'User not found' });
//       }

//       // Handle file uploads to Cloudinary
//       let mediaUrls = [];
//       if (files && files.length > 0) {
//           const uploadPromises = files.map(file =>
//               new Promise((resolve, reject) => {
//                   cloudinary.uploader.upload_stream(
//                       {
//                           resource_type: 'auto',
//                           folder: 'ChatAppMedia'
//                       },
//                       (error, result) => {
//                           if (error) {
//                               reject(error);
//                           } else {
//                               resolve(result.secure_url);

//                               console.log('sssssssss',result.secure_url);
                              
                              
//                               // Get the secure URL of the uploaded file
//                           }
//                       }
//                   ).end(file.buffer); // Pass the file buffer
//               })
//           );

//           mediaUrls = await Promise.all(uploadPromises); 
//           console.log('mediaaa',mediaUrls);
          
//           // Wait for all uploads to finish
//       }

//       // Create a new message with uploaded media URLs
//       const newMessage = new Message({
//           sender: senderId,
//           receiver: receiverId,
//           content,
//           mediaUrls:mediaUrls, // Store all uploaded media URLs
//       });

//       await newMessage.save();
//       res.status(201).json(newMessage);
//   } catch (error) {
//       console.error('Error sending message:', error.message);
//       res.status(500).json({ message: 'Error sending message', error });
//   }
// };


const sendMessage = async (req, res) => {
  console.log('Inside send message', req.body);

  const { senderId, receiverId, content } = req.body;
  const files = req.files;
  console.log('Received files:', files);

  try {
    // Check if sender and receiver exist
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }
 // Allowed MIME types for images and videos
 const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];

 // Filter files based on MIME types
 const validFiles = files.filter((file) => allowedMimeTypes.includes(file.mimetype));

 if (validFiles.length !== files.length) {
   return res.status(400).json({
     error: 'Only image and video files are allowed.',
   });
 }
    // Handle file uploads to Cloudinary
    let mediaUrls = [];
    if (files && files.length > 0) {
      console.log('Processing file uploads...');
      const uploadPromises = files.map((file) =>
        new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: 'ChatAppMedia',
            },
            (error, result) => {
              if (error) {
                console.error('Error uploading file to Cloudinary:', error);
                reject(error);
              } else {
                console.log('File uploaded successfully:', result.secure_url);
                resolve(result.secure_url);
              }
            }
          ).end(file.buffer); // Pass the file buffer
        })
      );

      mediaUrls = await Promise.all(uploadPromises);
      console.log('Uploaded media URLs:', mediaUrls);
    }
    // mediaUrls.push(mediaUrls);

    // let mediaData  = mediaUrls;

    let www = 'kavin'

    // Create a new message with uploaded media URLs
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content ,
      mediaUrls, // Store all uploaded media URLs
    });

    await newMessage.save();
    console.log('Message saved successfully:', newMessage);
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
