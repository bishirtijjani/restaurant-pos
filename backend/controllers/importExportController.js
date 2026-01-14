const asyncHandler = require("express-async-handler");
const importExportService = require("../services/ImportExportService");
const logAction = require("../utils/logAction");

/**
 * Handle data import (Preview or Execute)
 * Route: POST /api/import/:type
 * Consumes: multipart/form-data (file: 'file')
 * Body: { dryRun: boolean }
 */
const importData = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("Please upload a file to import.");
  }

  const { type } = req.params;
  const { dryRun } = req.body;

  // Extract context from request (populated by auth/store middleware)
  const context = {
    userId: req.user._id,
    organizationId: req.user.organizationId,
    storeId: req.storeId || req.user.stores?.[0]?.storeId, // storeId injected by storeMiddleware
    userRole: req.user.role, // For permission checks in service if needed
  };

  const fileBuffer = req.file.buffer;
  const mimeType = req.file.mimetype;

  const options = {
    dryRun: dryRun === "true",
    stopOnError: false, // Could be a query param
  };

  try {
    const result = await importExportService.processImport(
      type,
      fileBuffer,
      mimeType,
      context,
      options
    );

    // Initial audit log for attempt (or completion dependent on async)
    if (!dryRun) {
      await logAction(
        req.user.id,
        req.storeId,
        req.user.organizationId,
        "Import",
        null,
        "import",
        null,
        { type, fileName: req.file.originalname, result },
        `Imported ${type} data`
      );
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(400); // Bad Request for validation/parsing errors
    throw new Error(error.message);
  }
});

const exportData = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { format = "csv" } = req.query;

  // Extract context from request (populated by auth/store middleware)
  const context = {
    userId: req.user._id,
    organizationId: req.user.organizationId,
    storeId: req.storeId || req.user.stores?.[0]?.storeId,
  };

  try {
    const data = await importExportService.processExport(type, format, context);

    await logAction(
      req.user.id,
      req.storeId,
      req.user.organizationId,
      "Export",
      null,
      "export",
      null,
      { type, format },
      `Exported ${type} data as ${format}`
    );

    if (!data) {
      return res.status(404).json({ message: "No data found to export." });
    }

    if (format === "csv") {
      res.header("Content-Type", "text/csv");
      res.attachment(
        `${type}_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      res.send(data);
    } else if (format === "excel") {
      res.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.attachment(
        `${type}_export_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      res.send(data);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  importData,
  exportData,
};
