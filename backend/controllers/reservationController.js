const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const logAction = require("../utils/logAction");

exports.getAllReservations = async (req, res) => {
  try {
    const { status, tableId, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (tableId) filter.tableId = tableId;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.reservationDate = { $gte: startDate, $lte: endDate };
    }

    const reservations = await Reservation.find(filter)
      .populate("tableId", "tableNumber floorId status")
      .populate("createdBy", "fullname")
      .sort({ reservationDate: 1, reservationTime: 1 });

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

exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("tableId", "tableNumber floorId status capacity")
      .populate("createdBy", "fullname email");

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

exports.createReservation = async (req, res) => {
  try {
    const {
      tableId,
      customerName,
      customerPhone,
      customerEmail,
      partySize,
      reservationDate,
      reservationTime,
      duration,
      notes,
    } = req.body;

    if (
      !customerName ||
      !customerPhone ||
      !partySize ||
      !reservationDate ||
      !reservationTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: Customer Name, Phone, Party Size, Date, and Time.",
      });
    }

    let table = null;
    if (tableId) {
        table = await Table.findById(tableId);
        if (!table) {
          return res.status(404).json({
            success: false,
            message: "Table not found",
          });
        }

        if (!table.isActive) {
          return res.status(400).json({
            success: false,
            message: "Table is not active",
          });
        }

        if (partySize > table.capacity) {
          return res.status(400).json({
            success: false,
            message: `Party size exceeds table capacity (${table.capacity})`,
          });
        }
    }

    // Check for conflicts
    const resDate = new Date(reservationDate);
    const startOfDay = new Date(resDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(resDate);
    endOfDay.setHours(23, 59, 59, 999);

    if (tableId) {
        const existingReservations = await Reservation.find({
          tableId,
          reservationDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ["pending", "confirmed", "seated"] },
        });

        for (const existing of existingReservations) {
          if (existing.reservationTime === reservationTime) {
            return res.status(400).json({
              success: false,
              message: "Table is already reserved at this time",
            });
          }
        }
    }

    const reservation = await Reservation.create({
      tableId: tableId || null,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      partySize,
      reservationDate: resDate,
      reservationTime,
      duration: duration || 120,
      notes: notes || "",
      createdBy: req.user.id,
      status: "pending",
    });

    await logAction(
      req.user.id,
      "Reservation",
      reservation._id,
      "create",
      null,
      reservation,
      `Created reservation for ${customerName}${table ? ` at table ${table.tableNumber}` : ''}`
    );

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("tableId", "tableNumber floorId")
      .populate("createdBy", "fullname");

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: populatedReservation,
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

exports.updateReservation = async (req, res) => {
  try {
    const oldReservation = await Reservation.findById(req.params.id);

    if (!oldReservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const {
      tableId,
      customerName,
      customerPhone,
      customerEmail,
      partySize,
      reservationDate,
      reservationTime,
      duration,
      notes,
    } = req.body;

    const updateData = {};
    if (tableId !== undefined) updateData.tableId = tableId;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (partySize !== undefined) updateData.partySize = partySize;
    if (reservationDate !== undefined)
      updateData.reservationDate = new Date(reservationDate);
    if (reservationTime !== undefined)
      updateData.reservationTime = reservationTime;
    if (duration !== undefined) updateData.duration = duration;
    if (notes !== undefined) updateData.notes = notes;

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("tableId", "tableNumber floorId")
      .populate("createdBy", "fullname");

    await logAction(
      req.user.id,
      "Reservation",
      req.params.id,
      "update",
      oldReservation,
      updatedReservation,
      req.body.reason ||
        `Updated reservation for ${updatedReservation.customerName}`
    );

    res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      data: updatedReservation,
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

exports.updateReservationStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const oldStatus = reservation.status;
    reservation.status = status;

    if (status === "seated") {
      const table = await Table.findById(reservation.tableId);
      if (table) {
        table.status = "occupied";
        await table.save();
      }
    }

    await reservation.save();

    await logAction(
      req.user.id,
      "Reservation",
      req.params.id,
      "update",
      { status: oldStatus },
      { status },
      reason || `Changed reservation status from ${oldStatus} to ${status}`
    );

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("tableId", "tableNumber floorId")
      .populate("createdBy", "fullname");

    res.status(200).json({
      success: true,
      message: "Reservation status updated successfully",
      data: populatedReservation,
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

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    await Reservation.findByIdAndDelete(req.params.id);

    await logAction(
      req.user.id,
      "Reservation",
      req.params.id,
      "delete",
      reservation,
      null,
      `Deleted reservation for ${reservation.customerName}`
    );

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

// NEW: Check-in reservation (creates order and updates table)
exports.checkInReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("tableId")
      .populate("customerId");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    if (reservation.status === "seated" || reservation.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Reservation already checked in",
      });
    }

    const table = await Table.findById(reservation.tableId);
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // Update reservation status
    reservation.status = "seated";
    await reservation.save();

    // Update table status and link reservation
    table.status = "occupied";
    table.currentReservation = reservation._id;
    table.timing.seatedAt = new Date();
    await table.save();

    await logAction(
      req.user.id,
      "Reservation",
      req.params.id,
      "update",
      { status: "confirmed" },
      { status: "seated" },
      `Checked in reservation for ${reservation.customerName}`
    );

    // Return reservation with customer and table data for frontend
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("tableId", "tableNumber floorId")
      .populate("customerId")
      .populate("createdBy", "fullname");

    res.status(200).json({
      success: true,
      message: "Reservation checked in successfully",
      data: populatedReservation,
    });
  } catch (error) {
    console.error("Error checking in reservation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check in reservation",
      error: error.message,
    });
  }
};

module.exports = exports;
