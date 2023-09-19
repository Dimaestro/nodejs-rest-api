const express = require("express");
const router = express.Router();
const { authenticate, upload } = require("../../middlewares");
const ctrl = require("../../controllers/auth");

router.post("/register", ctrl.signUp);
router.post("/login", ctrl.signIn);
router.post("/logout", authenticate, ctrl.signOut);
router.get("/current", authenticate, ctrl.getCurrentUser);
router.patch("/", authenticate, ctrl.updateSubscription);
router.patch("/avatars", authenticate, upload.single('avatarURL'), ctrl.updateAvatar);

module.exports = router;
