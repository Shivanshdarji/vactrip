const { Expense, Trip } = require("../models");
const { sequelize } = require("../config/db");

// Helper to check trip ownership
const checkTripOwnership = async (tripId, userId) => {
  const trip = await Trip.findByPk(tripId);
  if (!trip) {
    throw { status: 404, message: "Trip not found" };
  }
  if (trip.user_id !== userId) {
    throw { status: 403, message: "Not authorized to access this trip" };
  }
  return trip;
};

// Helper to check expense ownership
const checkExpenseOwnership = async (expenseId, userId) => {
  const expense = await Expense.findByPk(expenseId, {
    include: [{ model: Trip, attributes: ["user_id"] }],
  });
  if (!expense) {
    throw { status: 404, message: "Expense not found" };
  }
  if (expense.Trip.user_id !== userId) {
    throw { status: 403, message: "Not authorized to access this expense" };
  }
  return expense;
};

exports.addExpense = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    const { category, description, arrival_date, departure_date, amount } = req.body;
    
    await checkTripOwnership(tripId, req.user.id);

    const expense = await Expense.create({
      trip_id: tripId,
      category,
      description,
      arrival_date: arrival_date || null,
      departure_date: departure_date || null,
      amount,
    });

    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    await checkTripOwnership(tripId, req.user.id);

    const expenses = await Expense.findAll({
      where: { trip_id: tripId },
      order: [["createdAt", "DESC"]],
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    res.json({
      expenses,
      totalSpent,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, description, arrival_date, departure_date, amount } = req.body;
    
    const expense = await checkExpenseOwnership(id, req.user.id);

    await expense.update({
      category: category !== undefined ? category : expense.category,
      description: description !== undefined ? description : expense.description,
      arrival_date: arrival_date !== undefined ? arrival_date : expense.arrival_date,
      departure_date: departure_date !== undefined ? departure_date : expense.departure_date,
      amount: amount !== undefined ? amount : expense.amount,
    });

    res.json(expense);
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await checkExpenseOwnership(id, req.user.id);
    
    await expense.destroy();
    
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getSummary = async (req, res, next) => {
  try {
    const { id: tripId } = req.params;
    const trip = await checkTripOwnership(tripId, req.user.id);

    const expenses = await Expense.findAll({
      where: { trip_id: tripId },
    });

    let totalSpent = 0;
    const categoryTotals = {};
    const dailyTotals = {};

    expenses.forEach((exp) => {
      const amt = Number(exp.amount);
      totalSpent += amt;

      // Group by category
      const cat = exp.category || "Other";
      if (!categoryTotals[cat]) categoryTotals[cat] = 0;
      categoryTotals[cat] += amt;

      // Group by day (using arrival_date or creation date fallback)
      const dateKey = exp.arrival_date || exp.createdAt.toISOString().split("T")[0];
      if (!dailyTotals[dateKey]) dailyTotals[dateKey] = 0;
      dailyTotals[dateKey] += amt;
    });

    const budget = Number(trip.budget) || 0;
    const remainingBudget = budget > 0 ? budget - totalSpent : null;
    const isOverBudget = budget > 0 && totalSpent > budget;

    // Convert dailyTotals to array for charts
    const dailyChartData = Object.keys(dailyTotals)
      .sort()
      .map((date) => ({
        date,
        amount: dailyTotals[date],
      }));

    res.json({
      totalSpent,
      budget,
      remainingBudget,
      isOverBudget,
      categoryTotals,
      dailyChartData,
    });
  } catch (error) {
    next(error);
  }
};
