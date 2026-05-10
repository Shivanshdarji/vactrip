const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  getSavedDestinations,
  addSavedDestination,
  removeSavedDestination,
} = require("../controllers/savedDestinationController");

router.get("/saved-destinations", requireAuth, getSavedDestinations);
router.post("/saved-destinations", requireAuth, addSavedDestination);
router.delete("/saved-destinations/:id", requireAuth, removeSavedDestination);

module.exports = router;
