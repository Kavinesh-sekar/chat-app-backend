const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate tokens are stored
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
         required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically store creation time
  },
  expiresAt: {
    type: Date,
    required: true, // Store the expiration time of the token
  },
  revoked: {
    type: Boolean,
    default: false, // Track if the token has been revoked
  },
});

let RefreshToken;
try {
    RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
    console.log('Model created successfully');
  } catch (err) {
    console.error('Error creating model:', err);
  }
module.exports = RefreshToken;