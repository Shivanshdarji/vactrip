const { User } = require("../models");
const bcrypt = require("bcrypt");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, city, country, phone, photo, newPassword } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if new email is taken by someone else
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (city !== undefined) updates.city = city;
    if (country !== undefined) updates.country = country;
    if (phone !== undefined) updates.phone = phone;
    if (photo !== undefined) updates.photo = photo;

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(newPassword, salt);
    }

    await user.update(updates);

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash"] },
    });

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};
