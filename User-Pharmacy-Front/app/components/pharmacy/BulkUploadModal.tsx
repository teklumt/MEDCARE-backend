'use client';

import { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download } from 'lucide-react';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export default function BulkUploadModal({ isOpen, onClose, onUpload }: BulkUploadModalProps) {
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock validation data
  const MOCK_PREVIEW = [
    { id: 1, name: 'Amoxicillin 500mg', qty: 100, price: 150, valid: true },
    { id: 2, name: 'Paracetamol 500mg', qty: 50, price: 45, valid: true },
    { id: 3, name: 'Ibuprofen 400mg', qty: 0, price: 60, valid: false, error: 'Quantity must be positive' },
    { id: 4, name: 'Vitamin C', qty: 200, price: 12.555, valid: false, error: 'Price has >2 decimal places' },
    { id: 5, name: 'Azithromycin', qty: 30, price: 250, valid: false, error: 'Expiration date in past' },
  ];

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file first.');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      await onUpload(selectedFile);
      setStep(3);
    } catch (uploadError) {
      setError((uploadError as Error).message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-serif font-bold text-brand-950">Bulk Upload Inventory</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Stepper */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-brand-900 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-brand-900' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-brand-900 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-brand-900' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-brand-900 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <div className={`w-16 h-1 ${step >= 4 ? 'bg-brand-900' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 4 ? 'bg-brand-900 text-white' : 'bg-gray-200 text-gray-500'}`}>4</div>
            </div>
          </div>

          {/* Step 1 & 2: Download & Upload */}
          {step < 3 && (
            <div className="space-y-8">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
                <FileSpreadsheet className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-blue-900 mb-2">Step 1: Download Template</h3>
                <p className="text-sm text-blue-800 mb-4 max-w-md mx-auto">
                  Use our pre-formatted CSV template to ensure your data is structured correctly. Do not change the column headers.
                </p>
                <button className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm">
                  <Download className="w-4 h-4" /> Download CSV Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center hover:bg-gray-50 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h3 className="font-bold text-brand-950 mb-1">Step 2: Upload Completed File</h3>
                <p className="text-sm text-gray-500 mb-6">Drag and drop your .csv file here, or click to browse</p>
                <input
                  type="file"
                  accept=".csv"
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
                    {selectedFile ? 'Change File' : 'Choose File'}
                  </label>
                  {selectedFile && (
                    <p className="text-xs text-gray-600 font-medium">Selected: {selectedFile.name}</p>
                  )}
                  {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
                  <button
                    onClick={handleFileUpload}
                    disabled={isUploading}
                    className="bg-brand-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-brand-800 transition-colors shadow-sm disabled:opacity-70"
                  >
                    {isUploading ? 'Processing...' : 'Upload File'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Validation Preview */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-brand-950 text-lg">Step 3: Validation Preview</h3>
                <span className="text-sm text-gray-500">Showing first 5 rows</span>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-3 font-bold text-gray-700">Status</th>
                      <th className="p-3 font-bold text-gray-700">Medication</th>
                      <th className="p-3 font-bold text-gray-700">Qty</th>
                      <th className="p-3 font-bold text-gray-700">Price</th>
                      <th className="p-3 font-bold text-gray-700">Error Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_PREVIEW.map((row) => (
                      <tr key={row.id} className={row.valid ? '' : 'bg-red-50/50'}>
                        <td className="p-3">
                          {row.valid ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                        </td>
                        <td className="p-3 font-medium">{row.name}</td>
                        <td className="p-3">{row.qty}</td>
                        <td className="p-3">{row.price}</td>
                        <td className="p-3 text-red-600 text-xs font-medium">{row.error || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800">Review Required</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Found 47 items in file. 43 are valid and ready to upload. 4 rows have errors and will be skipped.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-brand-950 mb-2">Upload Complete</h3>
              <p className="text-gray-600 mb-6">
                47 items processed. <span className="font-bold text-emerald-600">43 added successfully.</span> 4 skipped due to errors.
              </p>
              <button className="inline-flex items-center gap-2 text-brand-700 font-bold hover:underline">
                <Download className="w-4 h-4" /> Download Error Report
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
          {step < 4 && (
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
          )}
          {step === 3 && (
            <button 
              onClick={() => setStep(4)}
              className="px-6 py-2.5 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors shadow-sm"
            >
              Upload 43 Valid Items
            </button>
          )}
          {step === 4 && (
            <button 
              onClick={onClose}
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
