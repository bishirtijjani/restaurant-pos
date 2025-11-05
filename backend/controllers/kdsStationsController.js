// backend/controllers/kdsStationsController.js
const KDSStation = require("../models/KDSStation");

// Get all KDS stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await KDSStation.find()
      .populate("assignedUsers", "fullname email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: stations,
    });
  } catch (error) {
    console.error("Error fetching stations:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create KDS station
exports.createStation = async (req, res) => {
  try {
    const station = await KDSStation.create(req.body);

    res.status(201).json({
      success: true,
      message: "Station created successfully",
      data: station,
    });
  } catch (error) {
    console.error("Error creating station:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update KDS station
exports.updateStation = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await KDSStation.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.json({
      success: true,
      message: "Station updated successfully",
      data: station,
    });
  } catch (error) {
    console.error("Error updating station:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete station
exports.deleteStation = async (req, res) => {
  try {
    const { id } = req.params;

    const station = await KDSStation.findByIdAndDelete(id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.json({
      success: true,
      message: "Station deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting station:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = exports;
