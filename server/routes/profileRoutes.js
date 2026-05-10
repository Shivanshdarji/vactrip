const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { getProfile, updateProfile } = require("../controllers/profileController");

router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);

module.exports = router;
