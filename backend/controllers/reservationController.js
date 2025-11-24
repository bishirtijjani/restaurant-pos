const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const Customer = require("../models/Customer");
const logAction = require("../utils/logAction");
const { sendNotification } = require("../utils/webSocket");

// Get all reservations
exports.getAllReservations = async (req, res) => {
  try {
    const { from, to, status, table, floor } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (table) filter.table = table;
    if (floor) filter.floor = floor;

    if (from && to) {
      filter.date = {
        $gte: new Date(new Date(from).setHours(0, 0, 0, 0)),
        $lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
      };
    }

    const reservations = await Reservation.find(filter)
      .populate("table", "tableNumber")
      .populate("floor", "name")
      .populate("createdBy", "fullname")
      .populate("confirmedBy", "fullname")
      .sort({ date: -1, time: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reservations",
      error: error.message,
    });
  }
};

// Get reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("table", "tableNumber capacity")
      .populate("floor", "name")
      .populate("createdBy", "fullname")
      .populate("confirmedBy", "fullname")
      .populate("customerId");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error("Error fetching reservation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reservation",
      error: error.message,
    });
  }
};

// Create a new reservation
exports.createReservation = async (req, res) => {
  try {
    const {
      customer,
      customerId,
      table,
      date,
      time,
      partySize,
      duration,
      specialRequests,
      notes,
    } = req.body;

    if (
      !customer ||
      !customer.name ||
      !customer.phone ||
      !table ||
      !date ||
      !time ||
      !partySize
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer details, table, date, time, and party size are required",
      });
    }

    // Find table and floor
    const tableDoc = await Table.findById(table);
    if (!tableDoc) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // Check for conflicting reservations
    const conflictingReservation = await Reservation.findOne({
      table,
      date: new Date(new Date(date).setHours(0, 0, 0, 0)),
      time, // This might need more sophisticated time-range checking
      status: { $in: ["pending", "confirmed"] },
    });

    if (conflictingReservation) {
      return res.status(409).json({
        success: false,
        message: "This table is already reserved for the selected date and time",
      });
    }

    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      // Find or create customer
      let existingCustomer = await Customer.findOne({ phone: customer.phone });
      if (!existingCustomer) {
        existingCustomer = await Customer.create({
          name: customer.name,
          phone: customer.phone,
          email: customer.email || "",
        });
      }
      resolvedCustomerId = existingCustomer._id;
    }

    const reservation = await Reservation.create({
      customer,
      customerId: resolvedCustomerId,
      table,
      floor: tableDoc.floor,
      date: new Date(new Date(date).setHours(0, 0, 0, 0)),
      time,
      partySize,
      duration: duration || 120,
      specialRequests,
      notes,
      createdBy: req.user.id,
      lastAction: {
        action: "create",
        performedBy: req.user.id,
        createdAt: new Date(),
      },
    });

    await logAction(
      req.user.id,
      "Reservation",
      reservation._id,
      "create",
      null,
      reservation,
      `Created reservation ${reservation.reservationNumber}`
    );

    sendNotification("reservation_created", reservation);

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create reservation",
      error: error.message,
    });
  }
};

// Update reservation
exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const oldReservation = await Reservation.findById(id);
    if (!oldReservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // Prevent updates to completed or cancelled reservations
    if (["completed", "cancelled", "no-show"].includes(oldReservation.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot update a completed or cancelled reservation",
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      {
        ...updateData,
        lastAction: {
          action: "update",
          performedBy: req.user.id,
          createdAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    await logAction(
      req.user.id,
      "Reservation",
      id,
      "update",
      oldReservation,
      reservation,
      `Updated reservation ${reservation.reservationNumber}`
    );

    sendNotification("reservation_updated", reservation);

    res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update reservation",
      error: error.message,
    });
  }
};

// Update reservation status
exports.updateReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const oldStatus = reservation.status;

    // Handle status-specific logic
    switch (status) {
      case "confirmed":
        reservation.confirmedBy = req.user.id;
        break;
      case "seated":
        reservation.seatedAt = new Date();
        // Update table status
        await Table.findByIdAndUpdate(reservation.table, {
          status: "occupied",
        });
        break;
      case "completed":
        reservation.completedAt = new Date();
        // Update table status back to available
        await Table.findByIdAndUpdate(reservation.table, {
          status: "available",
        });
        break;
      case "cancelled":
      case "no-show":
        // Ensure table is not blocked
        if (oldStatus === "confirmed" || oldStatus === "pending") {
          // No table status change needed unless it was set to reserved
        }
        break;
    }

    reservation.status = status;
    reservation.lastAction = {
      action: status,
      performedBy: req.user.id,
      createdAt: new Date(),
      reason: reason || `Status changed to ${status}`,
    };

    await reservation.save();

    await logAction(
      req.user.id,
      "Reservation",
      id,
      `status_update: ${status}`,
      { status: oldStatus },
      { status },
      `Reservation ${reservation.reservationNumber} status updated to ${status}`
    );

    sendNotification("reservation_status_updated", reservation);

    res.status(200).json({
      success: true,
      message: `Reservation status updated to ${status}`,
      data: reservation,
    });
  } catch (error) {
    console.error("Error updating reservation status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update reservation status",
      error: error.message,
    });
  }
};

// Delete a reservation
exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // Only allow deletion for pending reservations, otherwise cancel
    if (reservation.status !== "pending") {
      return res.status(400).json({
        success: false,
        message:
          "Only pending reservations can be deleted. Please cancel the reservation instead.",
      });
    }

    await reservation.deleteOne();

    await logAction(
      req.user.id,
      "Reservation",
      id,
      "delete",
      reservation,
      null,
      `Deleted reservation ${reservation.reservationNumber}`
    );

    sendNotification("reservation_deleted", { id });

    res.status(200).json({
      success: true,
      message: "Reservation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete reservation",
      error: error.message,
    });
  }
};

// Get available tables for a given date, time, and party size
exports.getAvailableTables = async (req, res) => {
  try {
    const { date, time, partySize } = req.query;

    if (!date || !time || !partySize) {
      return res.status(400).json({
        success: false,
        message: "Date, time, and party size are required",
      });
    }

    // Find reserved table IDs for the given time slot
    const reservedTables = await Reservation.find({
      date: new Date(new Date(date).setHours(0, 0, 0, 0)),
      time, // This can be improved with time range logic
      status: { $in: ["pending", "confirmed"] },
    }).select("table");

    const reservedTableIds = reservedTables.map((r) => r.table);

    // Find available tables
    const availableTables = await Table.find({
      _id: { $nin: reservedTableIds },
      capacity: { $gte: partySize },
      isActive: true,
    })
      .populate("floor", "name")
      .sort({ "floor.name": 1, capacity: 1 });

    res.status(200).json({
      success: true,
      count: availableTables.length,
      data: availableTables,
    });
  } catch (error) {
    console.error("Error fetching available tables:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available tables",
      error: error.message,
    });
  }
};