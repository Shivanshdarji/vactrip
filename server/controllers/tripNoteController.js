const { TripNote, Trip } = require("../models");

exports.addNote = async (req, res, next) => {
  try {
    const { id: trip_id } = req.params;
    const { note, content } = req.body;

    const trip = await Trip.findOne({ where: { id: trip_id, user_id: req.user.id } });
    if (!trip) return res.status(403).json({ message: "Not authorized to access this trip" });

    const newNote = await TripNote.create({
      trip_id,
      content: content || note || "New Note",
    });
    res.status(201).json(newNote);
  } catch (err) {
    next(err);
  }
};

exports.getNotes = async (req, res, next) => {
  try {
    const { id: trip_id } = req.params;
    const trip = await Trip.findOne({ where: { id: trip_id, user_id: req.user.id } });
    if (!trip) return res.status(403).json({ message: "Not authorized to access this trip" });

    const notes = await TripNote.findAll({
      where: { trip_id },
      order: [["createdAt", "DESC"]]
    });
    res.json(notes);
  } catch (err) {
    next(err);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note, content } = req.body;

    const tripNote = await TripNote.findByPk(id, { include: [Trip] });
    if (!tripNote) return res.status(404).json({ message: "Note not found" });
    if (tripNote.Trip.user_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    await tripNote.update({
      content: content !== undefined ? content : (note !== undefined ? note : tripNote.content)
    });
    res.json(tripNote);
  } catch (err) {
    next(err);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tripNote = await TripNote.findByPk(id, { include: [Trip] });
    if (!tripNote) return res.status(404).json({ message: "Note not found" });
    if (tripNote.Trip.user_id !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    await tripNote.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
