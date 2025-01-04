const mongoose =  require('mongoose');

const GroupmessageSchema = new mongoose.Schema(
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
      },
      group: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Groups',
        required: true,
      },
      content: { type: String, required: true },
      mediaUrl: { type: String },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model('GroupMessage', GroupmessageSchema);
  