import axios from "axios";

const API_URL = "/api/import";

/**
 * Uploads a file for import.
 * @param {string} type - Entity type (e.g., 'category')
 * @param {File} file - The file to upload
 * @param {boolean} dryRun - Whether to run in simulation mode
 * @returns {Promise<Object>} - The server response containing preview or success status
 */
export const importFile = async (type, file, dryRun = true) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("dryRun", dryRun);

  try {
    const response = await axios.post(`${API_URL}/${type}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Import failed";
  }
};

/**
 * Triggers a file download for exported data.
 * @param {string} type - Entity type
 * @param {string} format - 'csv' or 'excel'
 */
export const exportFile = async (type, format = "csv") => {
  try {
    const response = await axios.get(
      `${API_URL}/${type}/export?format=${format}`,
      {
        responseType: "blob", // Important for file handling
      }
    );

    // Create a link to download the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    const date = new Date().toISOString().split("T")[0];
    link.setAttribute(
      "download",
      `${type}_export_${date}.${format === "excel" ? "xlsx" : "csv"}`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    throw error.response?.data?.message || "Export failed";
  }
};

const importService = {
  importFile,
  exportFile,
};

export default importService;
