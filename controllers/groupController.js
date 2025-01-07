// const express = require('express');
const Group = require('../models/groups');
const User = require('../models/user');
const groupMessage = require('../models/groupMessage');
const cloudinary = require('../config/cloudinary');


const CreateGroup = async(req,res)=>{
    const { groupName, groupDesc, groupCreatedBy, groupMembers, mediaUrl } = req.body;

    console.log('req.body',req.body);
    

    try {
      const group = new Group({
        groupName,
        groupDesc,
        groupCreatedBy,
        mediaUrl,
        groupMembers,
      });
  
      const savedGroup = await group.save();
      await User.updateMany(
        { _id: { $in: groupMembers } },
        { $push: { groups: savedGroup._id } }
      );
  
      res.status(201).json(savedGroup);
    } catch (err) {
      console.log('create grp error',err);
      
      res.status(500).json({ error: 'Failed to create group', details: err.message });
    }
}

const JoinGroup =  async(req,res)=>{

    const { groupId, userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group.groupMembers.includes(userId)) {
      group.groupMembers.push(userId);
      await group.save();

      await User.findByIdAndUpdate(userId, { $push: { groups: groupId } });
    }

    res.status(200).json({ message: 'Joined group successfully', group });
  } catch (err) {
    res.status(500).json({ error: 'Failed to join group', details: err.message });
  }
}

const SendGroupMessage = async(req,res)=>{
    const { senderId, groupId, content } = req.body;
    console.log('ggggggg',req.body);

    console.log('group id',req.body);


    // console.log('req body', req);
    
    
    const files = req.files;
    console.log('Received files:', files);
    const groups = await Group.findById(groupId);
    if (!groups) {
      console.log('gggggggggggggggggg not gound');
      
      return res.status(404).json({ error: 'Group not found' });
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
      let mediaUrls = [];
        if (files && files.length > 0) {
          console.log('Processing file uploads...');
          const uploadPromises = files.map((file) =>
            new Promise((resolve, reject) => {
              cloudinary.uploader.upload_stream(
                {
                  resource_type: 'auto',
                  folder: 'GroupChatMedia',
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
    try{
    const message = new groupMessage({
      sender :senderId,
      group: groupId,
      content,
      mediaUrls,
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Error sending message:', err.message);
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }

}


const ReceiveMessage = async (req, res) => {
  const { groupId } = req.params;
  
  console.log('groupId:', groupId);

  try {
    // Fetch messages for the given group and sort by createdAt in ascending order (chronologically)
    const messages = await groupMessage
      .find({ group: groupId })
      .sort({ createdAt: 1 })  // Sort messages by date in ascending order
      .populate('sender', 'userName');// Populate the sender field to include sender's name
    
    // Send the messages as a response
    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
  }
}


module.exports = {CreateGroup,JoinGroup,SendGroupMessage,ReceiveMessage}
  