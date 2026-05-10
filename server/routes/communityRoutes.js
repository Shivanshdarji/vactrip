const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { getCommunityTrips, copyTrip } = require("../controllers/communityController");

router.get("/community/trips", requireAuth, getCommunityTrips);
router.post("/community/trips/:id/copy", requireAuth, copyTrip);

module.exports = router;
