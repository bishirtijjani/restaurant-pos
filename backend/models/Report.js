const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a report name"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["sales", "inventory", "staff", "custom"],
      default: "custom",
    },
    metrics: {
      type: [String],
      required: [true, "Please select at least one metric"],
    },
    dateRange: {
      startDate: { type: Date },
      endDate: { type: Date },
      label: { type: String, default: "Custom" },
    },
    filters: {
      type: Map,
      of: String, // e.g., { "category": "Food", "staff": "John" }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      // required: true, // Uncomment when branch logic is fully enforced
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);
