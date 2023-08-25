const contactsService = require("../models/contacts");

const { httpError } = require("../helpers");

const { ctrlWrapper } = require("../decorators");

const { contactAddSchema, contactUpdateSchema } = require("../schemas/contacts");

const getAllContacts = async (req, res) => {
  const contacts = await contactsService.listContacts();
  res.json(contacts);
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;

  const contact = await contactsService.getContactById(contactId);

  if (!contact) {
    throw httpError(404);
  }

  res.json(contact);
};

const addContact = async (req, res) => {
  const { error } = contactAddSchema.validate(req.body);

  if (error) {
    throw httpError(400, error.message);
  }

  const contact = await contactsService.addContact(req.body);
  res.status(201).json(contact);
};

const removeContact = async (req, res) => {
  const { contactId } = req.params;
  const contact = await contactsService.removeContact(contactId);

  if (!contact) {
    throw httpError(404);
  }

  res.json({ message: "contact deleted" });
};

const updateContact = async (req, res) => {
  if (!Object.keys(req.body).length) {
    throw httpError(400, "missing fields");
  }

  const { error } = contactUpdateSchema.validate(req.body);

  if (error) {
    throw httpError(400, error.message);
  }

  const { contactId } = req.params;
  const contact = await contactsService.updateContact(contactId, req.body);

  if (!contact) {
    throw httpError(404);
  }

  res.status(200).json(contact);
};

module.exports = {
  getAllContacts: ctrlWrapper(getAllContacts),
  getContactById: ctrlWrapper(getContactById),
  addContact: ctrlWrapper(addContact),
  removeContact: ctrlWrapper(removeContact),
  updateContact: ctrlWrapper(updateContact),
};
