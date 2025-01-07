const mongoose = require('mongoose');
const bcrypt = require ('bcrypt');

const userSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Groups' }],
    mediaUrls: [String],
  },
  { timestamps: true }
);


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};
// No hashing or `comparePassword` method
const User = mongoose.model('users', userSchema);

module.exports = User;
