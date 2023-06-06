const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  // other fields...
});

// Hash the password before saving the user model
UserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, 'secret');
  return token;
}

// Add this method
UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  // delete the password field
  delete userObject.password;

  return userObject;
}

const User = mongoose.model('User', UserSchema);

module.exports = User;
