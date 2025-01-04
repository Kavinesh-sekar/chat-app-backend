const express = require('express');
const Group = require('../models/groups');
const User = require('../models/user');
const groupMessage = require('../models/groupMessage');


const CreateGroup = async(req,res)=>{
    const { groupName, groupDesc, groupCreatedBy, groupMembers, mediaUrl } = req.body;

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

const SendMessage = async(req,res)=>{
    const { sender, groupId, content, mediaUrl } = req.body;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    try{
    const message = new groupMessage({
      sender,
      group: groupId,
      content,
      mediaUrl,
    });

    const savedMessage = await message.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message', details: err.message });
  }

}

const ReceiveMessage =  async(req,res)=>{
    const { groupId } = req.params;

    try {
      const messages = await groupMessage.find({ group: groupId }).populate('sender', 'name');
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch messages', details: err.message });
    }
}

module.exports = {CreateGroup,JoinGroup,SendMessage,ReceiveMessage}
  