const { ChecklistItem } = require("../models");

exports.addChecklistItem = async (req, res, next) => {
  try {
    const { text, name } = req.body;
    const item = await ChecklistItem.create({
      user_id: req.user.id,
      name: name || text || "New Item",
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

exports.getChecklistItems = async (req, res, next) => {
  try {
    const items = await ChecklistItem.findAll({
      where: { user_id: req.user.id },
      order: [["createdAt", "DESC"]]
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.updateChecklistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, name, is_checked, is_packed } = req.body;
    
    const item = await ChecklistItem.findOne({ where: { id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.update({
      name: name !== undefined ? name : (text !== undefined ? text : item.name),
      is_packed: is_packed !== undefined ? is_packed : (is_checked !== undefined ? is_checked : item.is_packed)
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

exports.deleteChecklistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await ChecklistItem.findOne({ where: { id, user_id: req.user.id } });
    if (!item) return res.status(404).json({ message: "Item not found" });

    await item.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
