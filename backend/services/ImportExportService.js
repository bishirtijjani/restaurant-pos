const mongoose = require("mongoose");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");
const exceljs = require("exceljs");
const { validateImportData } = require("../utils/importValidators");

// Model Mapping
const MODELS = {
  category: require("../models/Category"),
  // Future: menuItem, inventoryItem, etc.
};

class ImportExportService {
  /**
   * Main entry point to process an import file.
   * flow: Parse -> Validate -> (DryRun ? Return Report : Persist)
   */
  async processImport(type, fileBuffer, fileType, context, options = {}) {
    const { dryRun = true } = options;
    const { organizationId, storeId, userId } = context;

    if (!MODELS[type]) {
      throw new Error(`Unsupported import type: ${type}`);
    }

    // 1. Parse File
    let rawData = [];
    if (fileType === "text/csv" || fileType.includes("csv")) {
      rawData = this.parseCSV(fileBuffer);
    } else if (fileType.includes("spreadsheet") || fileType.includes("excel")) {
      rawData = await this.parseExcel(fileBuffer);
    } else {
      throw new Error(`Unsupported file format: ${fileType}`);
    }

    if (!rawData || rawData.length === 0) {
      throw new Error("File is empty or could not be parsed.");
    }

    // 2. Validate Data
    const validationResults = this.validateBatch(type, rawData);
    const { validRows, invalidRows, errors } = validationResults;

    // 3. Dry Run / Preview Mode
    if (dryRun) {
      return {
        status: "dry_run",
        summary: {
          total: rawData.length,
          valid: validRows.length,
          invalid: invalidRows.length,
        },
        errors: errors.slice(0, 100), // Limit error reporting
        preview: validRows.slice(0, 5),
      };
    }

    // 4. Persistence (Only if not dry run and we have valid rows)
    if (invalidRows.length > 0 && options.stopOnError) {
      throw new Error(
        `Validation failed for ${invalidRows.length} rows. Fix errors and retry.`
      );
    }

    const savedDocs = await this.persistBatch(type, validRows, context);

    return {
      status: "success",
      summary: {
        total: rawData.length,
        imported: savedDocs.length,
        failed: rawData.length - savedDocs.length, // validRows that failed db save?
      },
    };
  }

  /**
   * Export data to CSV/Excel
   * @param {string} type - Entity type
   * @param {string} format - 'csv' or 'excel'
   * @param {Object} context - User context
   */
  async processExport(type, format, context) {
    const Model = MODELS[type];
    if (!Model) throw new Error(`Unsupported export type: ${type}`);

    // Query data based on context (scoped to org)
    // Future: Add filtering based on query params
    const data = await Model.find({
      organizationId: context.organizationId,
    }).lean();

    if (!data || data.length === 0) {
      return null; // Handle empty data in controller
    }

    // Transform data for export (flatten objects if needed, remove internal fields)
    const exportData = data.map((item) => {
      const { _id, __v, organizationId, storeId, lastAction, ...rest } = item;
      return rest; // Customize this per model if needed
    });

    if (format === "csv") {
      return stringify(exportData, { header: true, bom: true });
    } else if (format === "excel") {
      const workbook = new exceljs.Workbook();
      const sheet = workbook.addWorksheet("Export");

      if (exportData.length > 0) {
        const columns = Object.keys(exportData[0]).map((key) => ({
          header: key,
          key,
          width: 20,
        }));
        sheet.columns = columns;
        sheet.addRows(exportData);
      }

      return await workbook.xlsx.writeBuffer();
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  parseCSV(buffer) {
    try {
      return parse(buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });
    } catch (error) {
      throw new Error(`CSV Parsing Failed: ${error.message}`);
    }
  }

  async parseExcel(buffer) {
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    const data = [];

    // Assume first row is header
    const headers = [];
    if (worksheet.rowCount < 1) return [];

    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = cell.text;
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          // Rudimentary value extraction
          // exceljs values can be objects (links, etc), we want text/value
          rowData[header] = cell.value?.result || cell.value;
        }
      });
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    });

    return data;
  }

  validateBatch(type, rows) {
    const validRows = [];
    const invalidRows = [];
    const errors = [];

    rows.forEach((row, index) => {
      const { value, error } = validateImportData(type, row);
      if (error) {
        invalidRows.push(row);
        errors.push({
          row: index + 2, // +2 because 1-indexed and header is row 1
          message: error.details.map((d) => d.message).join(", "),
          data: row,
        });
      } else {
        validRows.push(value);
      }
    });

    return { validRows, invalidRows, errors };
  }

  async persistBatch(type, validRows, context) {
    const Model = MODELS[type];

    const docsToSave = validRows.map((row) => ({
      ...row,
      organizationId: context.organizationId,
      storeId: context.storeId, // Optional depending on scope, logic needed here
      // Add default tracking
      "lastAction.createdAt": new Date(),
      "lastAction.action": "create",
      "lastAction.reason": "Bulk Import",
    }));

    if (docsToSave.length === 0) return [];

    // Use transaction for atomic batch
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const result = await Model.insertMany(docsToSave, {
        session,
        ordered: false,
      });
      await session.commitTransaction();
      session.endSession();
      return result;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw new Error(`Database Error: ${error.message}`);
    }
  }
}

module.exports = new ImportExportService();
