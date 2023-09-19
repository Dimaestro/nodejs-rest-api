const Joi = require("joi");
const { subscriptions, emailRegExp } = require("../constants/user-constants");

const userSignUpSchema = Joi.object({
  password: Joi.string().required().min(6).message({
    "any.required": "missing required password field",
  }),
  email: Joi.string().required().pattern(emailRegExp).message({
    "any.required": "missing required email field",
  }),
  subscription: Joi.string().valid(...subscriptions),
  token: Joi.string(),
});

const userSignInSchema = Joi.object({
  password: Joi.string().required().min(6).message({
    "any.required": "missing required password field",
  }),
  email: Joi.string().required().pattern(emailRegExp).message({
    "any.required": "missing required email field",
  }),
});

const userUpdateSubscriptionSchema = Joi.object({
  subscription: Joi.string()
    .valid(...subscriptions)
    .required(),
});

const userResendVerifyEmail = Joi.object({
  email: Joi.string().required().pattern(emailRegExp).message({
    "any.required": "missing required email field",
  }),
})

module.exports = {
  userSignUpSchema,
  userSignInSchema,
  userUpdateSubscriptionSchema,
  userResendVerifyEmail
};
