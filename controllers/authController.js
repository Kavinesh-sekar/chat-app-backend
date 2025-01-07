const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Group = require('../models/groups')
const {generateAccessToken,generateRefreshToken} = require('../utilites/tokenUtils');
const RefreshToken = require('../models/refreshToken');
const bcrypt = require('bcrypt');
const cloudinary = require('../config/cloudinary');

const register = async (req, res) => {
  try {
   
    console.log('inside register',req.body);

    const {userName ,email,password} = req.body;
    
    const files = req.files;
  console.log('Received files:', files);

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/avi', 'video/mov'];

 // Filter files based on MIME types
 const validFiles = files.filter((file) => allowedMimeTypes.includes(file.mimetype));

 if (validFiles.length !== files.length) {
   return res.status(400).json({
     error: 'Only image and video files are allowed.',
   });
 }

  let mediaUrls = [];
     if (files && files.length > 0) {
       console.log('Processing file uploads...');
       const uploadPromises = files.map((file) =>
         new Promise((resolve, reject) => {
           cloudinary.uploader.upload_stream(
             {
               resource_type: 'auto',
               folder: 'ProfilePics',
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
 

    // Save the new user
    const newUser = new User({ userName, email, password ,mediaUrls});
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Error registering user', error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('inside login',req.body);
    

    const user = await User.findOne({ email });
    console.log('users',user);

    console.log('usersssss',user.id);

    
    if (!user) return res.status(404).json({ message: 'User not found' });

    // const isPasswordCorrect = await User.comparePassword(password);
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    else{

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      const newRefreshToken = new RefreshToken({
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 3600000)// Set expiration time (1 hour)
      });
  
      // Save the refresh token to the database
      await newRefreshToken.save();
      console.log('Refresh token saved successfully');
  

    res.status(200).json({ message: 'Login successful', 
      'accessToken' :accessToken,
      'refreshToken' :refreshToken
    });}
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Error logging in', error });
  }
};



const RefreshTokenAccess = async(req,res)=>{
  try {
    const { refreshToken } = req.body;

    // console.log('ffffffffffffffffff',req.body);
    

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Validate the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    // const storedToken = await RefreshToken.findOne({ refreshToken });

    // console.log('decoded',decoded);
    

    // if (!storedToken) {
    //   return res.status(403).json({ message: 'Invalid refresh token' });
    // }

    // Generate a new access token
    const newAccessToken = generateAccessToken(decoded.id);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) { console.error('Refresh token error:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        message: 'Refresh token expired',
        error: 'TokenExpiredError',
        expiredAt: error.expiredAt, // Optional: Provide the expiration time
      });
    }

    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};


// const getUserDashboard = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     console.log('userId',userId);
    
//     // const { userId } = req.user; // Get the logged-in user's ID from the authentication middleware

//     // Fetch al l users (excluding password for security reasons)
//     const allUsers = await User.find({}, 'userName email');

//     // Fetch groups the logged-in user is part of
//     const user = await User.findById(userId).populate({
//       path: 'groups',
//       select: 'groupName groupDesc groupMembers',
//     });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userGroups = user.groups.map(group => ({
//       groupId: group._id,
//       groupName: group.groupName,
//       groupDesc: group.groupDesc,
//       membersCount: group.groupMembers.length,
//     }));

//     // Combine the response
//     const response = {
//       allUsers,
//       userGroups,
//     };

//     res.status(200).json(response);
//   } catch (error) {
//     console.error('Error fetching user dashboard:', error.message);
//     res.status(500).json({ message: 'Error fetching user dashboard', error });
//   }
// };

const getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch all users (excluding passwords)
    const allUsers = await User.find({}, 'userName email mediaUrls');

    // Fetch all groups with their members
    const allGroups = await Group.find({}).populate({
      path: 'groupMembers',
      select: 'userName email',
    });

    // Check if the user exists
    const user = await User.findById(userId).populate('groups', 'groupName groupDesc groupMembers');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create a list of user groups
    const userGroups = user.groups.map(group => ({
      groupId: group._id,
      groupName: group.groupName,
      groupDesc: group.groupDesc,
      membersCount: group.groupMembers.length,
    }));

    // Add membership status to all groups
    const groupsWithMembershipStatus = allGroups.map(group => ({
      groupId: group._id,
      groupName: group.groupName,
      groupDesc: group.groupDesc,
      isMember: group.groupMembers.some(member => member._id.toString() === userId),
      members: group.groupMembers.map(member => ({
        memberId: member._id,
        userName: member.userName,
        email: member.email,
      })),
    }));

    res.status(200).json({ allUsers, userGroups, groupsWithMembershipStatus });
  } catch (error) {
    console.error('Error fetching dashboard:', error.message);
    res.status(500).json({ message: 'Error fetching dashboard', error });
  }
};


module.exports = { register, login,getUserDashboard ,RefreshTokenAccess};
