const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  addNote,
  getNotes,
  updateNote,
  deleteNote
} = require("../controllers/tripNoteController");

// The user specified /api/trips/:id/notes and /api/notes/:id
router.post("/trips/:id/notes", requireAuth, addNote);
router.get("/trips/:id/notes", requireAuth, getNotes);

router.put("/notes/:id", requireAuth, updateNote);
router.delete("/notes/:id", requireAuth, deleteNote);

module.exports = router;
