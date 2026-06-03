"use client";

import { useState, useCallback } from "react";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
} from "lucide-react";
import type { BulkInventoryUploadResult } from "@/lib/api";

const CSV_HEADERS = [
  "name",
  "genericName",
  "category",
  "dosageForm",
  "strength",
  "manufacturer",
  "batchNumber",
  "stockQuantity",
  "lowStockThreshold",
  "price",
  "expiryDate",
  "requiresPrescription",
  "imageUrl",
  "description",
] as const;

const CSV_SAMPLE_ROW: Record<(typeof CSV_HEADERS)[number], string> = {
  name: "Amoxicillin 500mg",
  genericName: "Amoxicillin",
  category: "Antibiotic",
  dosageForm: "Capsule",
  strength: "500mg",
  manufacturer: "Example Pharma",
  batchNumber: "BATCH-001",
  stockQuantity: "100",
  lowStockThreshold: "10",
  price: "150",
  expiryDate: "2027-12-31",
  requiresPrescription: "true",
  imageUrl: "",
  description: "Optional notes",
};

export function downloadInventoryCsvTemplate() {
  const headerLine = CSV_HEADERS.join(",");
  const sampleLine = CSV_HEADERS.map((h) => {
    const v = CSV_SAMPLE_ROW[h];
    return v.includes(",") ? `"${v}"` : v;
  }).join(",");
  const csv = `${headerLine}\n${sampleLine}\n`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventory-upload-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadErrorReport(errors: BulkInventoryUploadResult["errors"]) {
  const header = "row,error";
  const lines = errors.map((e) => `${e.row},"${e.error.replace(/"/g, '""')}"`);
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventory-upload-errors.csv";
  a.click();
  URL.revokeObjectURL(url);
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<BulkInventoryUploadResult>;
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  onUpload,
}: BulkUploadModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkInventoryUploadResult | null>(null);

  const resetAndClose = useCallback(() => {
    setStep(1);
    setSelectedFile(null);
    setError(null);
    setResult(null);
    setIsUploading(false);
    onClose();
  }, [onClose]);

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const uploadResult = await onUpload(selectedFile);
      setResult(uploadResult);
      setStep(3);
    } catch (uploadError) {
      setError((uploadError as Error).message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const stepActive = (n: number) =>
    step >= n ? "bg-brand-900 text-white" : "bg-gray-200 text-gray-500";
  const connector = (n: number) => (step >= n ? "bg-brand-900" : "bg-gray-200");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-serif font-bold text-brand-950">
            Bulk Upload Inventory
          </h2>
          <button
            onClick={resetAndClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${stepActive(1)}`}
              >
                1
              </div>
              <div className={`w-16 h-1 ${connector(2)}`} />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${stepActive(2)}`}
              >
                2
              </div>
              <div className={`w-16 h-1 ${connector(3)}`} />
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${stepActive(3)}`}
              >
                3
              </div>
            </div>
          </div>

          {step < 3 && (
            <div className="space-y-8">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <FileSpreadsheet className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-blue-900 mb-2">
                  Step 1: Download Template
                </h3>
                <p className="text-sm text-blue-800 mb-4 max-w-md mx-auto">
                  Use our CSV template with the required column headers.
                  Required fields: name, stockQuantity, price, expiryDate
                  (YYYY-MM-DD).
                </p>
                <button
                  type="button"
                  onClick={downloadInventoryCsvTemplate}
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download CSV Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:bg-gray-50 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="font-bold text-brand-950 mb-1">
                  Step 2: Upload Completed File
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Select your .csv file, then upload to import items into
                  inventory
                </p>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  id="bulk-upload-input"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setSelectedFile(file);
                    if (file) setError(null);
                  }}
                />
                <div className="flex flex-col items-center gap-3">
                  <label
                    htmlFor="bulk-upload-input"
                    className="bg-white border border-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shadow-sm cursor-pointer"
                  >
                    {selectedFile ? "Change File" : "Choose File"}
                  </label>
                  {selectedFile && (
                    <p className="text-xs text-gray-600 font-medium">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                  {error && (
                    <p className="text-xs text-red-600 font-medium">{error}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleFileUpload}
                    disabled={isUploading || !selectedFile}
                    className="bg-brand-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-800 transition-colors shadow-sm disabled:opacity-70"
                  >
                    {isUploading ? "Processing..." : "Upload & Import"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-950 mb-2">
                  Import Complete
                </h3>
                <p className="text-gray-600">
                  {result.total} row{result.total !== 1 ? "s" : ""} processed.{" "}
                  <span className="font-bold text-emerald-600">
                    {result.succeeded} added successfully.
                  </span>
                  {result.failed > 0 && (
                    <>
                      {" "}
                      <span className="font-bold text-amber-700">
                        {result.failed} skipped due to errors.
                      </span>
                    </>
                  )}
                </p>
              </div>

              {result.errors.length > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-brand-950 text-lg">
                      Rows with errors
                    </h3>
                    <button
                      type="button"
                      onClick={() => downloadErrorReport(result.errors)}
                      className="inline-flex items-center gap-2 text-sm text-brand-700 font-bold hover:underline"
                    >
                      <Download className="w-4 h-4" /> Download Error Report
                    </button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="p-3 font-bold text-gray-700">Row</th>
                          <th className="p-3 font-bold text-gray-700">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {result.errors.map((row) => (
                          <tr key={row.row} className="bg-red-50/50">
                            <td className="p-3 font-medium">{row.row}</td>
                            <td className="p-3 text-red-600 text-xs font-medium">
                              {row.error}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700">
                      Fix the rows in your CSV and upload again for any skipped
                      items. Successfully imported rows are already in your
                      inventory.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
          {step < 3 ? (
            <button
              type="button"
              onClick={resetAndClose}
              className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={resetAndClose}
              className="px-8 py-2.5 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors shadow-sm"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
