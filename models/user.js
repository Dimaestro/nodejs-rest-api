const { Schema, model } = require('mongoose');
const { subscriptions, emailRegExp } = require('../constants/user-constants');
const { handleValidationError } = require('./hooks');

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: emailRegExp,
    unique: true,
  },
  subscription: {
    type: String,
    enum: subscriptions,
    default: "starter"
  },
  avatarURL: {
    type: String,
  },
  token: {
    type: String,
    default: null,
  },
},
  {
    versionKey: false,
  }
)

userSchema.post("save", handleValidationError);
const User = model("user", userSchema);

module.exports = User;