const mongoose = require('mongoose');

const groupsSchema = new mongoose.Schema(
    {
        groupCreatedBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref:'users',
            required:true,
        },
        groupName:{
            type:String,
            required:true,

        },
        groupDesc:{
            type:String,
        },

        groupMembers:[
            {
            type:mongoose.Schema.Types.ObjectId,
            ref:'users',
            required:true,
            }
        ],
        mediaUrl: {
            type: String, 
          },


    },
    {timestamps:true}
);
module.exports = mongoose.model('Groups',groupsSchema)