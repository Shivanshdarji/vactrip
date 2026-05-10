const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getSummary,
} = require("../controllers/expenseController");

// Mount point will determine the base path in server/index.js
// So we will handle both /api/trips/:id/expenses and /api/expenses/:id here
// Actually, it's better to export two separate routers if they have different bases.
// Or we can just use the absolute path in the router.
// Given typical Express routing, let's just define routes directly if we mount at /api

router.post("/trips/:id/expenses", requireAuth, addExpense);
router.get("/trips/:id/expenses", requireAuth, getExpenses);
router.get("/trips/:id/expenses/summary", requireAuth, getSummary);

router.put("/expenses/:id", requireAuth, updateExpense);
router.delete("/expenses/:id", requireAuth, deleteExpense);

module.exports = router;
