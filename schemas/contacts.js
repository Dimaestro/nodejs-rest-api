const Joi = require("joi");

const contactAddSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "missing required name field",
  }),
  email: Joi.string().required().messages({
    "any.required": "missing required email field",
  }),
  phone: Joi.string().required().messages({
    "any.required": "missing required phone field",
  }),
  favorite: Joi.boolean(),
});

const contactUpdateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

const contactUpdateStatusSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

module.exports = {
  contactAddSchema,
  contactUpdateSchema,
  contactUpdateStatusSchema,
};
