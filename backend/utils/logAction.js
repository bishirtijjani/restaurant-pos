const AuditLog = require("../models/AuditLog");
const mongoose = require("mongoose");

const logAction = async (
  userId,
  storeId,
  organizationId, // NEW: Required organization context
  entityType,
  entityId,
  action,
  oldValue,
  newValue,
  reason,
  session = null
) => {
  try {
    // Create and save audit log entry
    const auditLog = new AuditLog({
      userId,
      storeId,
      organizationId,
      entityType,
      entityId,
      action,
      oldValue,
      newValue,
      reason,
    });
    await auditLog.save({ session });

    // Get the model dynamically based on entityType
    const Model = mongoose.model(entityType);

    // Update the lastAction field of the corresponding document
    await Model.findByIdAndUpdate(
      entityId,
      {
        lastAction: {
          action: action,
          performedBy: userId,
          createdAt: new Date(),
          reason: reason,
        },
      },
      { session }
    );
  } catch (error) {
    console.error("Error in logAction:", error);
    throw error;
  }
};

module.exports = logAction;
