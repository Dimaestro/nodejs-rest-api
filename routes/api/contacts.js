const express = require("express");
const router = express.Router();
const ctrl = require("../../controllers/contacts");
const { isValidId, authenticate } = require("../../middlewares");

router.use(authenticate);
router.get("/", ctrl.getAllContacts);
router.get("/:contactId", isValidId, ctrl.getContactById);
router.post("/", ctrl.addContact);
router.delete("/:contactId", isValidId, ctrl.removeContact);
router.put("/:contactId", isValidId, ctrl.updateContact);
router.patch("/:contactId/favorite", isValidId, ctrl.updateStatusContact);

module.exports = router;
