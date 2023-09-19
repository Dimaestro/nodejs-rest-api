const User = require("../models/user");
const { httpError, sendEmail } = require("../helpers");
const { ctrlWrapper } = require("../decorators");
const {
  userSignUpSchema,
  userSignInSchema,
  userUpdateSubscriptionSchema,
  userResendVerifyEmail,
} = require("../schemas/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");

const { JWT_SECRET, PROJECT_URL } = process.env;

const avatarsPath = path.resolve("public", "avatars");

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
  const verificationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify Email",
    text: "contacts",
    html: `<strong><a href='${PROJECT_URL}/api/users/verify/${verificationToken}' target='_blank'> Click verify email </a></strong>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw httpError(404);
  }

  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null}, { new: true });

  res.status(200).json({
    message: "Verification successful",
  });
};

const resendVerifyEmail = async (req, res) => {
  if (!Object.keys(req.body).length) {
    throw httpError(400, "missing fields");
  }

  const { error } = userResendVerifyEmail.validate(req.body);
  if (error) {
    throw httpError(400, error.message);
  }

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw httpError(404);
  }
  if (user.verify) {
    throw httpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Verify Email",
    text: "contacts",
    html: `<strong><a href='${PROJECT_URL}/api/users/verify/${user.verificationToken}' target='_blank'> Click verify email </a></strong>`,
  };

  await sendEmail(verifyEmail);

  res.status(200).json({
    message: "Verification email sent",
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

  if (!user.verify) {
    throw httpError(401, "Email not verify");
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

  await User.findByIdAndUpdate(userId, avatarURL, { new: true });

  res.status(200).json({
    avatarURL,
  });
};

module.exports = {
  signUp: ctrlWrapper(signUp),
  verify: ctrlWrapper(verify),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  signIn: ctrlWrapper(signIn),
  signOut: ctrlWrapper(signOut),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
