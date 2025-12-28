import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import { Buffer } from "buffer";

const mockInsertMany = vi.fn();

const mockStartSession = vi.fn().mockReturnValue({
  startTransaction: vi.fn(),
  commitTransaction: vi.fn(),
  abortTransaction: vi.fn(),
  endSession: vi.fn(),
});

vi.spyOn(mongoose, "startSession").mockImplementation(mockStartSession);

import importExportService from "../services/ImportExportService";
import Category from "../models/Category";

describe("ImportExportService", () => {
  const context = {
    userId: "user123",
    organizationId: "org123",
    storeId: "store123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Category, "insertMany").mockImplementation(mockInsertMany);
  });

  describe("processImport", () => {
    it("should parse and preview valid CSV data (Dry Run)", async () => {
      const csvContent =
        "name,description,publishStatus\nBeverages,Soft Drinks,published\nFood,Main Courses,draft";
      const buffer = Buffer.from(csvContent);

      const result = await importExportService.processImport(
        "category",
        buffer,
        "text/csv",
        context,
        { dryRun: true }
      );

      expect(result.status).toBe("dry_run");
      expect(result.summary.valid).toBe(2);
      expect(mockInsertMany).not.toHaveBeenCalled();
    });

    it("should identify invalid rows (Dry Run)", async () => {
      const csvContent = "name,description\nValidCat,Desc\n,InvalidDesc";
      const buffer = Buffer.from(csvContent);

      const result = await importExportService.processImport(
        "category",
        buffer,
        "text/csv",
        context,
        { dryRun: true }
      );

      expect(result.summary.valid).toBe(1);
      expect(result.summary.invalid).toBe(1);
    });

    it("should persist data when not dry run and valid", async () => {
      const csvContent = "name,description\nCat1,Desc1\nCat2,Desc2";
      const buffer = Buffer.from(csvContent);
      mockInsertMany.mockResolvedValue([{ name: "Cat1" }, { name: "Cat2" }]);

      const result = await importExportService.processImport(
        "category",
        buffer,
        "text/csv",
        context,
        { dryRun: false }
      );

      expect(result.status).toBe("success");
      expect(mockInsertMany).toHaveBeenCalledTimes(1);
      expect(mockStartSession).toHaveBeenCalled();

      const savedDocs = mockInsertMany.mock.calls[0][0];
      expect(savedDocs).toBeDefined();
      expect(savedDocs[0].name).toBe("Cat1");
      expect(savedDocs[0].organizationId).toBe("org123");
      expect(savedDocs[0].storeId).toBe("store123");
    });
  });
});
