const asyncHandler = require("express-async-handler");
const Report = require("../models/Report");

// @desc    Get all saved reports
// @route   GET /api/reports
// @access  Private
const getReports = asyncHandler(async (req, res) => {
  // Filter by branch if applicable, otherwise just by user or global
  // For now, assuming reports are visible to all users (or filtered by creator if needed)
  const reports = await Report.find({}).sort({ createdAt: -1 }).limit(50); // Limit to 50 most recent for now

  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports,
  });
});

// @desc    Create a new report configuration
// @route   POST /api/reports
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  const { name, metrics, dateRange, filters, type } = req.body;

  if (!name || !metrics || metrics.length === 0) {
    res.status(400);
    throw new Error("Please provide a name and at least one metric.");
  }

  const report = await Report.create({
    name,
    metrics,
    dateRange,
    filters,
    type: type || "custom",
    createdBy: req.user.id, // Auth middleware populates req.user with 'id'
    // branch: req.user.branch // matching existing pattern if any
  });

  res.status(201).json({
    success: true,
    data: report,
  });
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error("Report not found");
  }

  // Optional: Check ownership
  // if (report.createdBy.toString() !== req.user.id && req.user.role !== 'admin') { ... }

  await report.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
    message: "Report deleted successfully",
  });
});

module.exports = {
  getReports,
  createReport,
  deleteReport,
};
