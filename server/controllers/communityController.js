const { Trip, Stop, StopActivity, City, Activity, User } = require("../models");

exports.getCommunityTrips = async (req, res, next) => {
  try {
    const trips = await Trip.findAll({
      where: { is_public: true },
      include: [
        {
          model: User,
          attributes: ["id", "name", "photo"],
        },
        {
          model: Stop,
          include: [{ model: City, attributes: ["name", "country", "imageUrl"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(trips);
  } catch (err) {
    next(err);
  }
};

exports.copyTrip = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch original trip with stops and activities
    const originalTrip = await Trip.findOne({
      where: { id, is_public: true },
      include: [
        {
          model: Stop,
          include: [{ model: StopActivity }],
        },
      ],
    });

    if (!originalTrip) {
      return res.status(404).json({ message: "Public trip not found." });
    }

    // 2. Create new Trip for the logged-in user
    const newTrip = await Trip.create({
      user_id: req.user.id,
      name: `Copy of ${originalTrip.name}`,
      description: originalTrip.description,
      start_date: null, // Let user set new dates
      end_date: null,
      cover_photo: originalTrip.cover_photo,
      budget: originalTrip.budget,
      is_public: false, // Default to private
      status: "upcoming",
    });

    // 3. Clone Stops and StopActivities
    if (originalTrip.Stops && originalTrip.Stops.length > 0) {
      for (const stop of originalTrip.Stops) {
        const newStop = await Stop.create({
          trip_id: newTrip.id,
          city_id: stop.city_id,
          order_index: stop.order_index,
          start_date: null,
          end_date: null,
          notes: stop.notes,
        });

        if (stop.StopActivities && stop.StopActivities.length > 0) {
          for (const activity of stop.StopActivities) {
            await StopActivity.create({
              stop_id: newStop.id,
              activity_id: activity.activity_id,
              order_index: activity.order_index,
              start_time: null,
              end_time: null,
              notes: activity.notes,
            });
          }
        }
      }
    }

    res.status(201).json(newTrip);
  } catch (err) {
    next(err);
  }
};
