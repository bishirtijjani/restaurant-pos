const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Store = require("../models/Store"); // Replaces GeneralSettings
const logAction = require("../utils/logAction");
const CommManager = require("../utils/communicationManager");

// Helper function to generate unique order number (scoped to store)
const generateOrderNumber = async (storeId) => {
  let orderNumber;
  let exists;
  do {
    orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await Order.exists({ orderNumber, storeId });
  } while (exists);
  return orderNumber;
};

exports.getAllReservations = async (req, res) => {
  try {
    const { status, tableId, date } = req.query;
    const filter = { storeId: req.storeId };

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
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    })
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
  const session = await mongoose.startSession();
  session.startTransaction();

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
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: Customer Name, Phone, Party Size, Date, and Time.",
      });
    }

    // 1. Get Store Settings for Timezone
    const store = await Store.findById(req.storeId).session(session);
    const timezone = store?.settings?.timezone || "UTC";

    // 2. Validate Table
    let table = null;
    if (tableId) {
      table = await Table.findOne({
        _id: tableId,
        storeId: req.storeId,
      }).session(session);
      if (!table) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: "Table not found",
        });
      }

      if (!table.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: "Table is not active",
        });
      }

      if (partySize > table.capacity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Party size exceeds table capacity (${table.capacity})`,
        });
      }
    }

    // 3. Timezone-Aware Date Construction
    // Combine date and time strings, treating them as originating in the Store's timezone
    // We utilize date-fns-tz to handle this conversion accurately
    const { toZonedTime, fromZonedTime } = require("date-fns-tz"); // inline require or move to top

    // Normalize date part (remove time component if present in string)
    const datePart = new Date(reservationDate).toISOString().split("T")[0];
    const timeString = `${datePart}T${reservationTime}:00`; // "YYYY-MM-DDTHH:mm:00"

    // This is the absolute UTC moment that represents the store's local time
    const reservationStartUtc = fromZonedTime(timeString, timezone);
    const durationMinutes = duration || 120;
    const reservationEndUtc = new Date(
      reservationStartUtc.getTime() + durationMinutes * 60000,
    );
    const bufferMinutes = 15;
    const bufferedEndUtc = new Date(
      reservationEndUtc.getTime() + bufferMinutes * 60000,
    );

    // 4. Check for Conflicts (scoped to transaction)
    if (tableId) {
      // Find overlapping reservations for this table
      // We look for any reservation where (Start < NewEnd) AND (End > NewStart)
      // Including the buffer time for the existing reservations

      // Get all active reservations for this table around the target time
      // Expanding search window slightly to be safe
      const searchStart = new Date(
        reservationStartUtc.getTime() - 24 * 60 * 60 * 1000,
      );
      const searchEnd = new Date(
        reservationEndUtc.getTime() + 24 * 60 * 60 * 1000,
      );

      const existingReservations = await Reservation.find({
        tableId,
        storeId: req.storeId,
        reservationDate: { $gte: searchStart, $lte: searchEnd },
        status: { $in: ["pending", "confirmed", "seated"] },
      }).session(session);

      for (const existing of existingReservations) {
        // Re-construct existing reservation's absolute UTC window
        // Note: existing.reservationDate is stored as UTC. existing.reservationTime is "HH:mm" string
        // We must rely on the stored reservationDate field which *should* represent the start time correctly if previously saved correctly.
        // However, to be consistent with our new logic, we should probably reconstruct it using the timezone.

        let existingStartUtc;
        if (existing.reservationDate) {
          existingStartUtc = new Date(existing.reservationDate); // Assuming stored correctly
          // If stored date was just the "day" (00:00:00), we act differently.
          // Audit showed reservationDate includes time?
          // Let's assume reservationDate is the source of truth for Date, and reservationTime for Time.

          // Safer reconstruction:
          const exDatePart = existing.reservationDate
            .toISOString()
            .split("T")[0];
          const exTimeString = `${exDatePart}T${existing.reservationTime}:00`;
          existingStartUtc = fromZonedTime(exTimeString, timezone);
        }

        const existingDuration = existing.duration || 120;
        const existingEndUtc = new Date(
          existingStartUtc.getTime() + existingDuration * 60000,
        );
        const existingBufferedEndUtc = new Date(
          existingEndUtc.getTime() + bufferMinutes * 60000,
        );

        // Check Overlap:
        // New Start < Existing Buffered End AND New Buffered End > Existing Start
        // We apply buffer to the *end* of each reservation.

        if (
          reservationStartUtc < existingBufferedEndUtc &&
          bufferedEndUtc > existingStartUtc
        ) {
          await session.abortTransaction();
          session.endSession();

          // Format times for error message (convert back to store timezone for display)
          const formatTime = (date) => {
            const zoned = toZonedTime(date, timezone);
            const h = zoned.getHours().toString().padStart(2, "0");
            const m = zoned.getMinutes().toString().padStart(2, "0");
            return `${h}:${m}`;
          };

          return res.status(400).json({
            success: false,
            message: `Time conflict: Table is reserved from ${formatTime(
              existingStartUtc,
            )} to ${formatTime(existingBufferedEndUtc)} (incl. buffer) for "${
              existing.customerName
            }"`,
          });
        }
      }

      // Check Real-Time Table Status if for Today
      if (table.status === "occupied") {
        const nowUtc = new Date();
        const startDiffMinutes = (reservationStartUtc - nowUtc) / 60000;

        // If trying to reserve within next 15 mins and table is occupied
        // logic: if (reservationStart < now + buffer)
        if (startDiffMinutes < bufferMinutes && startDiffMinutes > -120) {
          // and it's not in the distant past (e.g. creating a past reservation)
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            success: false,
            message:
              "Table is currently occupied and likely won't be ready in time.",
          });
        }
      }
    }

    // 5. Create Reservation
    const [reservation] = await Reservation.create(
      [
        {
          tableId: tableId || null,
          customerName,
          customerPhone,
          customerEmail: customerEmail || "",
          partySize,
          reservationDate: reservationStartUtc, // Store as UTC
          reservationTime, // Store string as valid reference
          duration: durationMinutes,
          notes: notes || "",
          createdBy: req.user.id,
          status: "pending",
          storeId: req.storeId,
        },
      ],
      { session },
    );

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Reservation",
      reservation._id,
      "create",
      null,
      reservation,
      `Created reservation for ${customerName}${
        table ? ` at table ${table.tableNumber}` : ""
      }`,
      session,
    );

    await session.commitTransaction();
    session.endSession();

    // 6. Post-Transaction: Populate and Notify
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("tableId", "tableNumber floorId")
      .populate("createdBy", "fullname");

    if (customerEmail || customerPhone) {
      // Use date-fns-tz or standard formatting
      const displayDate =
        populatedReservation.reservationDate.toLocaleDateString("en-US", {
          timeZone: timezone,
        });

      const tplData = {
        customerName,
        reservationDate: displayDate,
        reservationTime,
        partySize,
        restaurantName: store.name || "Our Restaurant",
      };

      if (customerEmail) {
        CommManager.sendEmail(req.storeId, {
          to: customerEmail,
          action: "reservation_confirmation",
          data: tplData,
        });
      }

      if (customerPhone) {
        CommManager.sendSMS(req.storeId, {
          to: customerPhone,
          action: "reservation_confirmation",
          data: tplData,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: populatedReservation,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
    const oldReservation = await Reservation.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

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

    const updatedReservation = await Reservation.findOneAndUpdate(
      { _id: req.params.id, storeId: req.storeId },
      updateData,
      { new: true, runValidators: true },
    )
      .populate("tableId", "tableNumber floorId")
      .populate("createdBy", "fullname");

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Reservation",
      req.params.id,
      "update",
      oldReservation,
      updatedReservation,
      req.body.reason ||
        `Updated reservation for ${updatedReservation.customerName}`,
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

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    const oldStatus = reservation.status;
    reservation.status = status;

    if (status === "seated") {
      const table = await Table.findOne({
        _id: reservation.tableId,
        storeId: req.storeId,
      });
      if (table) {
        table.status = "occupied";
        await table.save();
      }
    }

    await reservation.save();

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Reservation",
      req.params.id,
      "update",
      { status: oldStatus },
      { status },
      reason || `Changed reservation status from ${oldStatus} to ${status}`,
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
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    await Reservation.findOneAndDelete({
      _id: req.params.id,
      storeId: req.storeId,
    });

    await logAction(
      req.user.id,
      req.storeId,
      req.organizationId,
      "Reservation",
      req.params.id,
      "delete",
      reservation,
      null,
      `Deleted reservation for ${reservation.customerName}`,
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
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      storeId: req.storeId,
    })
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

    const table = await Table.findOne({
      _id: reservation.tableId,
      storeId: req.storeId,
    });
    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get restaurant settings for order creation
      const store = await Store.findById(req.storeId).session(session);
      if (!store || !store.settings) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({
          success: false,
          message: "Store settings not configured",
        });
      }
      const settings = store.settings;

      // Generate order number
      const orderNumber = await generateOrderNumber(req.storeId);

      // Create dine-in order linked to reservation
      // Use new Order + save({ session }) to ensure transaction context
      const newOrder = new Order({
        orderNumber,
        storeId: req.storeId,
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
        reservationId: reservation._id,
        customerDetails: {
          name: reservation.customerName,
          phone: reservation.customerPhone,
          email: reservation.customerEmail || "",
          partySize: reservation.partySize,
        },
        customerId: reservation.customerId || null,
        taxBreakdown: {
          taxMode: settings.taxSettings?.mode || "per-order",
          globalRate: settings.taxSettings?.globalRate || 0,
          totalTax: 0,
          serviceCharge: 0,
        },
        createdBy: req.user.id,
      });

      await newOrder.save({ session });

      // Update reservation with order reference
      reservation.status = "seated";
      reservation.orderId = newOrder._id;
      await reservation.save({ session });

      // Update table status and link reservation
      table.status = "occupied";
      table.currentReservation = reservation._id;
      table.currentOrder = newOrder._id;
      table.timing.seatedAt = new Date();
      await table.save({ session });

      await logAction(
        req.user.id,
        req.storeId,
        req.organizationId,
        "Reservation",
        req.params.id,
        "update",
        { status: "confirmed" },
        { status: "seated", orderId: newOrder._id },
        `Checked in reservation for ${reservation.customerName}, created order #${orderNumber}`,
        session,
      );

      await session.commitTransaction();
      session.endSession();

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
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
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


