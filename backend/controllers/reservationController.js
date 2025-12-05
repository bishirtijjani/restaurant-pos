const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const Order = require("../models/Order");
const GeneralSettings = require("../models/GeneralSettings");
const logAction = require("../utils/logAction");

// Helper function to generate unique order number
const generateOrderNumber = async () => {
  let orderNumber;
  let exists;
  do {
    orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Order.exists({ orderNumber });
  } while (exists);
  return orderNumber;
};

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

    // Check for conflicts with proper time overlap detection
    const resDate = new Date(reservationDate);
    const startOfDay = new Date(resDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(resDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Helper function to convert time string to minutes from midnight
    const timeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // Buffer time in minutes (time needed between reservations for table turnover)
    const BUFFER_MINUTES = 15;
    const newResDuration = duration || 120; // Default 2 hours if not specified
    const newResStartMinutes = timeToMinutes(reservationTime);
    const newResEndMinutes = newResStartMinutes + newResDuration + BUFFER_MINUTES;

    if (tableId) {
        const existingReservations = await Reservation.find({
          tableId,
          reservationDate: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ["pending", "confirmed", "seated"] },
        });

        for (const existing of existingReservations) {
          const existingStartMinutes = timeToMinutes(existing.reservationTime);
          const existingDuration = existing.duration || 120;
          const existingEndMinutes = existingStartMinutes + existingDuration + BUFFER_MINUTES;

          // Check for overlap: new reservation starts before existing ends AND new ends after existing starts
          const hasOverlap = 
            newResStartMinutes < existingEndMinutes && 
            newResEndMinutes > existingStartMinutes;

          if (hasOverlap) {
            const formatTime = (mins) => {
              const h = Math.floor(mins / 60);
              const m = mins % 60;
              return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
            };
            return res.status(400).json({
              success: false,
              message: `Time conflict: Table is reserved from ${existing.reservationTime} to ${formatTime(existingEndMinutes - BUFFER_MINUTES)} for "${existing.customerName}"`,
              conflictDetails: {
                existingReservation: existing.customerName,
                existingTime: existing.reservationTime,
                existingDuration: existingDuration,
              },
            });
          }
        }

        // Also check if the table is currently occupied
        if (table.status === "occupied") {
          // If reservation is for today, check if table will be free in time
          const now = new Date();
          const isToday = resDate.toDateString() === now.toDateString();
          if (isToday) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            // If trying to reserve for a time that's less than buffer time from now
            if (newResStartMinutes < currentMinutes + BUFFER_MINUTES) {
              return res.status(400).json({
                success: false,
                message: "Table is currently occupied. Please select a later time or different table.",
              });
            }
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

    // Get restaurant settings for order creation
    const settings = await GeneralSettings.findOne();
    if (!settings) {
      return res.status(500).json({
        success: false,
        message: "Restaurant settings not configured",
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create dine-in order linked to reservation
    const newOrder = await Order.create({
      orderNumber,
      orderType: "dine-in",
      table: table.tableNumber,
      tableId: table._id,
      orderItems: [], // Empty order - items will be added later
      subtotal: 0,
      totalAmount: 0,
      status: "pending",
      paymentStatus: "unpaid",
      amountPaid: 0,
      balance: 0,
      // Link to reservation
      reservationId: reservation._id,
      // Customer details from reservation
      customerDetails: {
        name: reservation.customerName,
        phone: reservation.customerPhone,
        email: reservation.customerEmail || "",
        partySize: reservation.partySize,
      },
      // Link to customer if exists
      customerId: reservation.customerId || null,
      // Tax settings from restaurant config
      taxBreakdown: {
        taxMode: settings.taxSettings?.mode || "per-order",
        globalRate: settings.taxSettings?.globalRate || 0,
        totalTax: 0,
        serviceCharge: 0,
      },
      createdBy: req.user.id,
    });

    // Update reservation with order reference
    reservation.status = "seated";
    reservation.orderId = newOrder._id;
    await reservation.save();

    // Update table status and link reservation
    table.status = "occupied";
    table.currentReservation = reservation._id;
    table.currentOrder = newOrder._id;
    table.timing.seatedAt = new Date();
    await table.save();

    await logAction(
      req.user.id,
      "Reservation",
      req.params.id,
      "update",
      { status: "confirmed" },
      { status: "seated", orderId: newOrder._id },
      `Checked in reservation for ${reservation.customerName}, created order #${orderNumber}`
    );

    // Return reservation with customer, table, and order data
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("tableId", "tableNumber floorId")
      .populate("customerId")
      .populate("createdBy", "fullname");

    res.status(200).json({
      success: true,
      message: "Reservation checked in successfully",
      data: {
        reservation: populatedReservation,
        order: newOrder,
      },
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
