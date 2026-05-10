const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  addChecklistItem,
  getChecklistItems,
  updateChecklistItem,
  deleteChecklistItem
} = require("../controllers/checklistController");

// The user specified /api/trips/:id/checklist and /api/checklist/:id
router.post("/trips/:id/checklist", requireAuth, addChecklistItem);
router.get("/trips/:id/checklist", requireAuth, getChecklistItems);

router.put("/checklist/:id", requireAuth, updateChecklistItem);
router.delete("/checklist/:id", requireAuth, deleteChecklistItem);

module.exports = router;
