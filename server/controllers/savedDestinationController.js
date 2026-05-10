const { SavedDestination, City } = require("../models");

exports.getSavedDestinations = async (req, res, next) => {
  try {
    const saved = await SavedDestination.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: City,
          attributes: ["id", "name", "country", "state", "imageUrl", "description"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(saved);
  } catch (err) {
    next(err);
  }
};

exports.addSavedDestination = async (req, res, next) => {
  try {
    const { city_id } = req.body;
    
    // Check if already saved
    const existing = await SavedDestination.findOne({
      where: { user_id: req.user.id, city_id },
    });
    
    if (existing) {
      return res.status(400).json({ message: "Destination already saved." });
    }

    const saved = await SavedDestination.create({
      user_id: req.user.id,
      city_id,
    });
    
    // fetch with city details to return
    const fullSaved = await SavedDestination.findByPk(saved.id, { include: [City] });
    
    res.status(201).json(fullSaved);
  } catch (err) {
    next(err);
  }
};

exports.removeSavedDestination = async (req, res, next) => {
  try {
    const { id } = req.params;
    const saved = await SavedDestination.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!saved) {
      return res.status(404).json({ message: "Saved destination not found." });
    }

    await saved.destroy();
    res.json({ message: "Removed from saved destinations." });
  } catch (err) {
    next(err);
  }
};
