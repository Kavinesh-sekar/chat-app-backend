const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Groups' }]
  },
  { timestamps: true }
);

// No hashing or `comparePassword` method
const User = mongoose.model('users', userSchema);

module.exports = User;
