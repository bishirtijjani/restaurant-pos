import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Loader,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { showNotification } from "../../common/headerSlice"; // Assuming notification slice exists
import importService from "../../../services/importService";

const STEPS = {
  UPLOAD: "UPLOAD",
  PREVIEW: "PREVIEW",
  SUCCESS: "SUCCESS",
};

const ImportWizardModalBody = ({ closeModal, extraObject }) => {
  const { type, title } = extraObject || {};
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const startDryRun = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await importService.importFile(type, file, true);
      setPreviewData(result);
      setStep(STEPS.PREVIEW);
    } catch (err) {
      setError(err);
      // dispatch(showNotification({ message: err, status: 0 })); // Optional
    } finally {
      setLoading(false);
    }
  };

  const executeImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await importService.importFile(type, file, false);
      setImportResult(result);
      setStep(STEPS.SUCCESS);
      dispatch(
        showNotification({
          message: "Import completed successfully!",
          status: 1,
        })
      );
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const renderUploadStep = () => (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-base-300 rounded-xl bg-base-100/50 hover:bg-base-200/50 transition-colors">
      <div className="p-4 bg-primary/10 rounded-full mb-4">
        <Upload className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Upload your {title || type} file
      </h3>
      <p className="text-sm text-base-content/60 mb-6 text-center max-w-xs">
        Supported formats: CSV, Excel (.xlsx). Ensure your file matches the
        template.
      </p>

      <button
        className="btn btn-sm btn-outline gap-2 mb-6"
        onClick={() => {
          const content =
            type === "category"
              ? "name,description,publishStatus\nBeverages,Soft drinks and juices,published"
              : "name,description"; // Fallback
          const blob = new Blob([content], { type: "text/csv" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${type}_template.csv`;
          a.click();
        }}
      >
        <FileText size={16} /> Download Template
      </button>

      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        className="file-input file-input-bordered file-input-primary w-full max-w-xs"
        onChange={handleFileChange}
      />

      {error && (
        <div className="mt-4 p-3 bg-error/10 text-error rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="mt-6 w-full flex justify-end">
        <button
          className="btn btn-primary"
          disabled={!file || loading}
          onClick={startDryRun}
        >
          {loading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            "Analyze File"
          )}
          {!loading && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    if (!previewData) return null;
    const { summary, errors, preview } = previewData;
    const hasErrors = summary.invalid > 0;

    return (
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat bg-base-100 shadow rounded-lg p-4">
            <div className="stat-title text-xs uppercase tracking-wide">
              Total Rows
            </div>
            <div className="stat-value text-2xl">{summary.total}</div>
          </div>
          <div className="stat bg-success/10 text-success shadow rounded-lg p-4 transition-colors">
            <div className="stat-title text-current text-xs uppercase tracking-wide">
              Valid
            </div>
            <div className="stat-value text-current text-2xl">
              {summary.valid}
            </div>
            <CheckCircle
              className="absolute top-4 right-4 opacity-20"
              size={32}
            />
          </div>
          <div
            className={`stat shadow rounded-lg p-4 transition-colors ${
              summary.invalid > 0 ? "bg-error/10 text-error" : "bg-base-100"
            }`}
          >
            <div className="stat-title text-current text-xs uppercase tracking-wide">
              Invalid
            </div>
            <div className="stat-value text-current text-2xl">
              {summary.invalid}
            </div>
            {summary.invalid > 0 && (
              <XCircle
                className="absolute top-4 right-4 opacity-20"
                size={32}
              />
            )}
          </div>
        </div>

        {/* Errors List */}
        {hasErrors && (
          <div className="bg-error/5 border border-error/20 rounded-lg p-4 max-h-48 overflow-y-auto">
            <h4 className="font-bold text-error flex items-center gap-2 mb-2 sticky top-0 bg-base-100/0 backdrop-blur-sm pb-1">
              <AlertTriangle size={16} /> Validation Errors ({summary.invalid})
            </h4>
            <ul className="space-y-2 text-sm">
              {errors?.map((err, idx) => (
                <li
                  key={idx}
                  className="flex gap-2 items-start py-1 border-b border-error/10 last:border-0"
                >
                  <span className="font-mono text-xs bg-error/10 px-1 rounded text-error whitespace-nowrap">
                    Row {err.row}
                  </span>
                  <span className="text-base-content/80">{err.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Valid Preview Table */}
        {preview && preview.length > 0 && (
          <div className="rounded-lg border border-base-300 overflow-hidden">
            <div className="bg-base-200 px-4 py-2 font-semibold text-sm border-b border-base-300">
              Preview (First 5 Valid Rows)
            </div>
            <div className="overflow-x-auto">
              <table className="table table-xs w-full">
                <thead>
                  <tr>
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key} className="capitalize">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j}>{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          <button
            className="btn btn-ghost"
            onClick={() => setStep(STEPS.UPLOAD)}
          >
            Back
          </button>
          <button
            className="btn btn-success text-white"
            onClick={executeImport}
            disabled={loading || summary.valid === 0}
          >
            {loading ? <Loader className="animate-spin" /> : "Confirm Import"}
          </button>
        </div>
      </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center text-white mb-4 animate-bounce">
        <CheckCircle size={40} />
      </div>
      <h3 className="text-2xl font-bold">Import Successful!</h3>
      <p className="text-base-content/70">
        Successfully imported{" "}
        <span className="font-bold text-success">
          {importResult?.summary?.imported || 0}
        </span>{" "}
        records.
      </p>
      <button
        className="btn btn-primary mt-6 w-full max-w-xs"
        onClick={closeModal}
      >
        Done
      </button>
    </div>
  );

  return (
    <div className="w-full">
      {/* Steps Indicator */}
      <ul className="steps w-full mb-8 text-sm">
        <li
          className={`step ${
            step === STEPS.UPLOAD ||
            step === STEPS.PREVIEW ||
            step === STEPS.SUCCESS
              ? "step-primary"
              : ""
          }`}
        >
          Upload
        </li>
        <li
          className={`step ${
            step === STEPS.PREVIEW || step === STEPS.SUCCESS
              ? "step-primary"
              : ""
          }`}
        >
          Validate
        </li>
        <li className={`step ${step === STEPS.SUCCESS ? "step-primary" : ""}`}>
          Finish
        </li>
      </ul>

      {step === STEPS.UPLOAD && renderUploadStep()}
      {step === STEPS.PREVIEW && renderPreviewStep()}
      {step === STEPS.SUCCESS && renderSuccessStep()}
    </div>
  );
};

export default ImportWizardModalBody;
