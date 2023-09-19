const User = require("../models/user");
const { httpError } = require("../helpers");
const { ctrlWrapper } = require("../decorators");
const {
  userSignUpSchema,
  userSignInSchema,
  userUpdateSubscriptionSchema,
} = require("../schemas/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const fs = require("fs/promises");
const path = require("path");

const { JWT_SECRET,  SENDGRID_API_KEY} = process.env;

const avatarsPath = path.resolve("public", "avatars");

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg = {
  to: 'test@example.com', // Change to your recipient
  from: 'test@example.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })

const signUp = async (req, res) => {
  const { error } = userSignUpSchema.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw httpError(409, "Email in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email, { s: "250", r: "x", d: "retro" });

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const signIn = async (req, res) => {
  const { error } = userSignInSchema.validate(req.body);
  if (error) {
    throw httpError(400);
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw httpError(401, "Email or password is wrong");
  }

  const compareHashPassword = await bcrypt.compare(password, user.password);
  if (!compareHashPassword) {
    throw httpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token }, { new: true });

  res.status(200).json({
    token: token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};

const signOut = async (req, res) => {
  const { _id: contactId } = req.user;
  await User.findByIdAndUpdate(contactId, { token: null }, { new: true });
  res.status(204).json({
    message: "Logout success",
  });
};

const getCurrentUser = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({
    email,
    subscription,
  });
};

const updateSubscription = async (req, res) => {
  if (!Object.keys(req.body).length) {
    throw httpError(400, "missing field favorite");
  }

  const { error } = userUpdateSubscriptionSchema.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  const { _id: userId } = req.user;
  const user = await User.findByIdAndUpdate(userId, req.body, { new: true });

  res.status(200).json({
    message: `Subscription updated on ${user.subscription} successfully`,
  });
};

const updateAvatar = async (req, res) => {
  const { path: oldAvatarPath, filename } = req.file;
  const { _id: userId } = req.user;
  const newFilename = `${userId}_${filename}`;
  const newAvatarPath = path.join(avatarsPath, newFilename);

  const avatarImg = await Jimp.read(oldAvatarPath);
  await avatarImg.resize(250, 250);
  await avatarImg.writeAsync(oldAvatarPath);

  await fs.rename(oldAvatarPath, newAvatarPath);

  const avatarURL = path.join("public", "avatars", newFilename);

  await User.findByIdAndUpdate(
    userId,
    avatarURL,
    { new: true }
  );

  res.status(200).json({
    avatarURL,
  });
};



module.exports = {
  signUp: ctrlWrapper(signUp),
  signIn: ctrlWrapper(signIn),
  signOut: ctrlWrapper(signOut),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
