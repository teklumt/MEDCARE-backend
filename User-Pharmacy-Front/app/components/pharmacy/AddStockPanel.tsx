'use client';

import { useState, useEffect } from 'react';
import { X, Search, Upload, AlertTriangle, CheckCircle2, Info, Camera } from 'lucide-react';

interface AddStockPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
  editItem?: any | null;
}

const DOSAGE_FORMS = ['Tablet', 'Capsule', 'Syrup/Liquid', 'Injection', 'Cream/Ointment', 'Drops', 'Inhaler', 'Suppository', 'Powder', 'Other'];
const CATEGORIES = ['Antibiotic', 'Painkiller / Analgesic', 'Antimalaria', 'Antiparasitic', 'Vitamins & Supplements', 'Cardiovascular', 'Diabetes', 'Respiratory', 'Gastrointestinal', 'Dermatology', 'Mental Health', 'Women\'s Health', 'Pediatric', 'Vaccine', 'Other'];
const UNITS = ['Tablets', 'Capsules', 'Bottles', 'Vials', 'Tubes', 'Sachets', 'Pieces'];
const STORAGE_REQS = ['Room Temperature', 'Refrigerated (2–8°C)', 'Frozen', 'Cool and Dry', 'Protect from Light', 'Controlled Substance Storage'];

// Mock master database
const MASTER_DB = [
  { name: 'Amoxicillin 250mg', generic: 'Amoxicillin', category: 'Antibiotic', form: 'Capsule', amharic: 'አሞክሲሲሊን 250mg' },
  { name: 'Amoxicillin 500mg', generic: 'Amoxicillin', category: 'Antibiotic', form: 'Capsule', amharic: 'አሞክሲሲሊን 500mg' },
  { name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Painkiller / Analgesic', form: 'Tablet', amharic: 'ፓራሲታሞል 500mg' },
];

export default function AddStockPanel({ isOpen, onClose, onAdd, editItem }: AddStockPanelProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  // Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewMedication, setIsNewMedication] = useState(false);
  
  const [formData, setFormData] = useState({
    nameEn: '',
    nameAm: '',
    genericName: '',
    dosageStrength: '',
    dosageForm: '',
    category: '',
    description: '',
    requiresPrescription: null as boolean | null,
    
    quantity: '',
    unit: 'Tablets',
    price: '',
    lowStockThreshold: '10',
    batchNumber: '',
    supplier: '',
    expirationDate: '',
    dateReceived: new Date().toISOString().split('T')[0],
    
    storageReq: 'Room Temperature',
    specialInstructions: '',
    isControlled: false,
    
    availability: 'Available Now',
    deliveryEligible: true,
    maxOrderQty: '',
    
    prescriptionMode: 'Require prescription image upload before order is confirmed',
    prescriptionValidDays: '30',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setSearchQuery('');
      setIsNewMedication(false);
      
      if (editItem) {
        setFormData({
          nameEn: editItem.name || '',
          nameAm: editItem.amharicName || '',
          genericName: editItem.genericName || '',
          dosageStrength: editItem.dosageStrength || '',
          dosageForm: editItem.dosageForm || '',
          category: editItem.category || '',
          description: editItem.description || '',
          requiresPrescription: editItem.requiresPrescription ?? null,
          quantity: String(editItem.quantity || ''),
          unit: editItem.unit || 'Tablets',
          price: String(editItem.price || ''),
          lowStockThreshold: editItem.lowStockThreshold || '10',
          batchNumber: editItem.batch || '',
          supplier: editItem.supplier || '',
          expirationDate: editItem.expiry || '',
          dateReceived: editItem.dateReceived || new Date().toISOString().split('T')[0],
          storageReq: editItem.storageReq || 'Room Temperature',
          specialInstructions: editItem.specialInstructions || '',
          isControlled: editItem.isControlled || false,
          availability: editItem.status || 'In Stock',
          deliveryEligible: editItem.deliveryEligible ?? true,
          maxOrderQty: editItem.maxOrderQty || '',
          prescriptionMode: editItem.prescriptionMode || 'Require prescription image upload before order is confirmed',
          prescriptionValidDays: editItem.prescriptionValidDays || '30',
        });
      } else {
        setFormData({
          nameEn: '', nameAm: '', genericName: '', dosageStrength: '', dosageForm: '', category: '', description: '', requiresPrescription: null,
          quantity: '', unit: 'Tablets', price: '', lowStockThreshold: '10', batchNumber: '', supplier: '', expirationDate: '', dateReceived: new Date().toISOString().split('T')[0],
          storageReq: 'Room Temperature', specialInstructions: '', isControlled: false,
          availability: 'In Stock', deliveryEligible: true, maxOrderQty: '',
          prescriptionMode: 'Require prescription image upload before order is confirmed', prescriptionValidDays: '30',
        });
      }
      setErrors({});
      setWarnings({});
    }
  }, [isOpen, editItem]);

  // Expiration Date Warning
  useEffect(() => {
    if (formData.expirationDate) {
      const expDate = new Date(formData.expirationDate);
      const today = new Date();
      const diffTime = expDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0 && diffDays <= 30) {
        setWarnings(prev => ({ ...prev, expirationDate: '⚠️ This item will expire soon. It will appear with an expiration warning to you but will still be listed as available to patients until it expires.' }));
      } else {
        setWarnings(prev => {
          const newWarn = { ...prev };
          delete newWarn.expirationDate;
          return newWarn;
        });
      }
    }
  }, [formData.expirationDate]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowDropdown(val.length > 0);
    if (val !== formData.nameEn) {
      setIsNewMedication(true);
      setFormData(prev => ({ ...prev, nameEn: val }));
    }
  };

  const selectMedication = (med: any) => {
    setSearchQuery(med.name);
    setShowDropdown(false);
    setIsNewMedication(false);
    setFormData(prev => ({
      ...prev,
      nameEn: med.name,
      nameAm: med.amharic,
      genericName: med.generic,
      category: med.category,
      dosageForm: med.form,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.nameEn.trim()) newErrors.nameEn = 'Medication Name in English is required.';
    if (!formData.nameAm.trim()) newErrors.nameAm = 'Medication Name in Amharic is required.';
    if (!formData.dosageForm) newErrors.dosageForm = 'Dosage Form is required.';
    if (!formData.category) newErrors.category = 'Category is required.';
    if (formData.requiresPrescription === null) newErrors.requiresPrescription = 'Please select if a prescription is required.';
    
    const qty = Number(formData.quantity);
    if (!formData.quantity || isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      newErrors.quantity = 'Quantity must be a positive whole number.';
    }
    
    const price = Number(formData.price);
    if (!formData.price || isNaN(price) || price <= 0 || !/^\d+(\.\d{1,2})?$/.test(formData.price)) {
      newErrors.price = 'Price must be a positive number with max 2 decimal places.';
    }
    
    if (!formData.expirationDate) {
      newErrors.expirationDate = 'Expiration Date is required.';
    } else {
      const expDate = new Date(formData.expirationDate);
      if (expDate <= new Date()) {
        newErrors.expirationDate = 'Expiration Date must be in the future.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newItem = {
        id: editItem ? editItem.id : Math.random().toString(36).substr(2, 9),
        name: formData.nameEn,
        amharicName: formData.nameAm,
        genericName: formData.genericName,
        dosageStrength: formData.dosageStrength,
        dosageForm: formData.dosageForm,
        category: formData.category,
        description: formData.description,
        requiresPrescription: formData.requiresPrescription,
        unit: formData.unit,
        lowStockThreshold: formData.lowStockThreshold,
        supplier: formData.supplier,
        dateReceived: formData.dateReceived,
        storageReq: formData.storageReq,
        specialInstructions: formData.specialInstructions,
        isControlled: formData.isControlled,
        deliveryEligible: formData.deliveryEligible,
        maxOrderQty: formData.maxOrderQty,
        prescriptionMode: formData.prescriptionMode,
        prescriptionValidDays: formData.prescriptionValidDays,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
        expiry: formData.expirationDate,
        batch: formData.batchNumber || 'N/A',
        status: formData.availability,
      };
      
      onAdd(newItem);
      setStep('success');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <h2 className="text-xl font-serif font-bold text-brand-950">{editItem ? 'Edit Stock' : 'Add New Stock'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'success' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-brand-950 mb-2">{editItem ? 'Stock Updated Successfully' : 'Stock Added Successfully'}</h3>
            <p className="text-gray-600 mb-8">
              <span className="font-bold text-brand-900">{formData.nameEn}</span> has been {editItem ? 'updated in' : 'added to'} your inventory. It is now visible to patients.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep('form')}
                className="px-6 py-2.5 bg-white border border-gray-200 text-brand-950 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Add Another Item
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors shadow-sm"
              >
                View in Inventory
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-accent-50/30">
              
              {/* Section 1: Medication Identification */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="font-bold text-brand-950 border-b border-gray-100 pb-2">1. Medication Identification</h3>
                
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Search Medication Database <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Type medication name (e.g., Amoxicillin)..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {MASTER_DB.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).map((med, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => selectMedication(med)}
                          className="px-4 py-3 hover:bg-brand-50 cursor-pointer border-b border-gray-50 last:border-0"
                        >
                          <p className="font-bold text-brand-950 text-sm">{med.name}</p>
                          <p className="text-xs text-gray-500">{med.category} • {med.form}</p>
                        </div>
                      ))}
                      {MASTER_DB.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500">No matches found. You will create a new entry.</div>
                      )}
                    </div>
                  )}
                </div>

                {isNewMedication && searchQuery.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl text-sm flex gap-2 items-start">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>This medication is not in our database yet — you will create a new entry.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Name in English <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.nameEn}
                      onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-brand-500 ${errors.nameEn ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.nameEn && <p className="text-red-500 text-xs mt-1">{errors.nameEn}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Name in Amharic <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.nameAm}
                      onChange={(e) => setFormData({...formData, nameAm: e.target.value})}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-brand-500 ${errors.nameAm ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.nameAm && <p className="text-red-500 text-xs mt-1">{errors.nameAm}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Generic Name</label>
                    <input 
                      type="text" 
                      value={formData.genericName}
                      onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Dosage Strength</label>
                    <input 
                      type="text" 
                      placeholder="e.g., 500mg"
                      value={formData.dosageStrength}
                      onChange={(e) => setFormData({...formData, dosageStrength: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Dosage Form <span className="text-red-500">*</span></label>
                    <select 
                      value={formData.dosageForm}
                      onChange={(e) => setFormData({...formData, dosageForm: e.target.value})}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-brand-500 ${errors.dosageForm ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select form...</option>
                      {DOSAGE_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {errors.dosageForm && <p className="text-red-500 text-xs mt-1">{errors.dosageForm}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-brand-500 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select category...</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description of the medication/drug <span className="text-gray-500 font-normal ml-1">(Details for what purpose it is used for)</span></label>
                    <textarea 
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g., Used to treat bacterial infections..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Requires Prescription? <span className="text-red-500">*</span></label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="reqPrescription" 
                        checked={formData.requiresPrescription === true}
                        onChange={() => setFormData({...formData, requiresPrescription: true})}
                        className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="reqPrescription" 
                        checked={formData.requiresPrescription === false}
                        onChange={() => setFormData({...formData, requiresPrescription: false})}
                        className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                  {errors.requiresPrescription && <p className="text-red-500 text-xs mt-1">{errors.requiresPrescription}</p>}
                </div>
              </section>

              {/* Section 2: Stock Details */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="font-bold text-brand-950 border-b border-gray-100 pb-2">2. Stock Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantity in Stock <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-brand-500 ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Price per Unit <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ETB</span>
                      <input 
                        type="number" 
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className={`w-full pl-12 pr-4 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-brand-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Expiration Date <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      value={formData.expirationDate}
                      onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                      className={`w-full px-4 py-2.5 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-brand-500 ${errors.expirationDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate}</p>}
                    {warnings.expirationDate && <p className="text-amber-600 text-xs mt-1 font-medium">{warnings.expirationDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Low Stock Alert Threshold</label>
                    <input 
                      type="number" 
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({...formData, lowStockThreshold: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Batch Number <span className="text-gray-400 font-normal ml-1" title="Batch numbers help identify recalled medications.">ⓘ</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.batchNumber}
                      onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Supplier / Manufacturer</label>
                    <input 
                      type="text" 
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Storage & Handling */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="font-bold text-brand-950 border-b border-gray-100 pb-2">3. Storage & Handling</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Storage Requirements</label>
                    <select 
                      value={formData.storageReq}
                      onChange={(e) => setFormData({...formData, storageReq: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {STORAGE_REQS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Special Instructions</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Keep refrigerated after opening"
                      value={formData.specialInstructions}
                      onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isControlled}
                      onChange={(e) => setFormData({...formData, isControlled: e.target.checked})}
                      className="mt-1 w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-900">Controlled Substance</span>
                      {formData.isControlled && (
                        <p className="text-xs text-amber-700 mt-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          By marking this as a controlled substance, you confirm this medication is stored and dispensed in compliance with Ethiopian pharmaceutical regulations.
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              </section>

              {/* Section 4: Availability Settings */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="font-bold text-brand-950 border-b border-gray-100 pb-2">4. Availability Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Availability Status</label>
                    <select 
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="In Stock">In Stock (Available to patients)</option>
                      <option value="Low Stock">Low Stock (Available but running out)</option>
                      <option value="Out of Stock">Out of Stock (Hidden from search/Cannot order)</option>
                      <option value="Expiring Soon">Expiring Soon (Visible with warning)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div>
                      <span className="text-sm font-bold text-gray-900 block">Delivery Eligible</span>
                      <span className="text-xs text-gray-500">Can this item be delivered to patients?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.deliveryEligible}
                        onChange={(e) => setFormData({...formData, deliveryEligible: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Max Order Quantity per Patient</label>
                    <input 
                      type="number" 
                      placeholder="Optional limit"
                      value={formData.maxOrderQty}
                      onChange={(e) => setFormData({...formData, maxOrderQty: e.target.value})}
                      className="w-full md:w-1/2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </section>

              {/* Section 5: Prescription Handling (Conditional) */}
              {formData.requiresPrescription && (
                <section className="bg-brand-50 p-6 rounded-2xl border border-brand-200 shadow-sm space-y-5">
                  <h3 className="font-bold text-brand-950 border-b border-brand-200 pb-2">5. Prescription Handling Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Verification Mode</label>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rxMode" 
                            value="Require prescription image upload before order is confirmed"
                            checked={formData.prescriptionMode === 'Require prescription image upload before order is confirmed'}
                            onChange={(e) => setFormData({...formData, prescriptionMode: e.target.value})}
                            className="mt-1 w-4 h-4 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-sm">Require prescription image upload before order is confirmed <span className="text-brand-700 text-xs font-bold">(Strictest)</span></span>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rxMode" 
                            value="Accept order but request prescription at delivery or pickup"
                            checked={formData.prescriptionMode === 'Accept order but request prescription at delivery or pickup'}
                            onChange={(e) => setFormData({...formData, prescriptionMode: e.target.value})}
                            className="mt-1 w-4 h-4 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-sm">Accept order but request prescription at delivery or pickup</span>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rxMode" 
                            value="Pharmacist reviews prescription image manually before accepting order"
                            checked={formData.prescriptionMode === 'Pharmacist reviews prescription image manually before accepting order'}
                            onChange={(e) => setFormData({...formData, prescriptionMode: e.target.value})}
                            className="mt-1 w-4 h-4 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-sm">Pharmacist reviews prescription image manually before accepting order</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Prescription Valid For</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={formData.prescriptionValidDays}
                          onChange={(e) => setFormData({...formData, prescriptionValidDays: e.target.value})}
                          className="w-24 px-4 py-2.5 bg-white border border-brand-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-600 font-medium">days</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Section 6: Image */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                <h3 className="font-bold text-brand-950 border-b border-gray-100 pb-2">6. Medication Image</h3>
                
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-brand-950 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mb-4">JPEG or PNG, max 5MB</p>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    A clear photo helps patients verify they received the correct medication and reduces dispensing errors.
                  </p>
                </div>
              </section>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-white shrink-0 flex justify-end gap-3">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-8 py-2.5 bg-brand-900 text-white font-bold rounded-xl hover:bg-brand-800 transition-colors shadow-sm"
              >
                Add to Inventory
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
