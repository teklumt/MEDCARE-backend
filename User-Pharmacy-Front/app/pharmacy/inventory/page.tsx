"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Search,
  Plus,
  Upload,
  AlertTriangle,
  Clock,
  Edit,
  Trash2,
  Globe,
  ChevronDown,
} from "lucide-react";
import AddStockPanel from "../../components/pharmacy/AddStockPanel";
import BulkUploadModal from "../../components/pharmacy/BulkUploadModal";
import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  bulkUploadPharmacyInventoryApi,
} from "@/lib/api";

type InventoryItem = {
  id: string;
  name: string;
  amharicName?: string;
  genericName?: string;
  dosageStrength?: string;
  dosageForm?: string;
  category?: string;
  description?: string;
  requiresPrescription?: boolean;
  quantity: number;
  price: number;
  expiry: string;
  batch?: string;
  status: string;
  lowStockThreshold?: number;
  imageUrl?: string;
};

const TRANSLATIONS = {
  en: {
    inventoryManagement: "Inventory Management",
    inventorySubtitle:
      "Manage your medication stock, prices, and track expirations.",
    bulkUploadCSV: "Bulk Upload CSV",
    addNewItem: "Add New Item",
    itemsLowStock: "items low on stock",
    itemsOutOfStock: "items out of stock",
    itemsExpiring: "items expiring within 30 days",
    searchPlaceholder: "Search medications by name or batch...",
    allCategories: "All Categories",
    antibiotic: "Antibiotic",
    painkiller: "Painkiller",
    supplement: "Supplement",
    allStatuses: "All Statuses",
    allInventory: "All Inventory",
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    expiringSoon: "Expiring Soon",
    medication: "Medication",
    category: "Category",
    quantity: "Quantity",
    priceETB: "Price (ETB)",
    expiryDate: "Expiry Date",
    status: "Status",
    actions: "Actions",
    batch: "Batch",
    noItems: "No items found matching your filters.",
  },
  am: {
    inventoryManagement: "የክምችት አስተዳደር",
    inventorySubtitle: "የመድሃኒት ክምችትዎን፣ ዋጋዎን ያስተዳድሩ፣ እና የሚያበቃበትን ጊዜ ይከታተሉ።",
    bulkUploadCSV: "የጅምላ ጭነት CSV",
    addNewItem: "አዲስ እቃ ጨምር",
    itemsLowStock: "እቃዎች ክምችት ያነሳቸው",
    itemsOutOfStock: "እቃዎች ክምችት ያቋረጡ",
    itemsExpiring: "እቃዎች በ30 ቀናት ውስጥ የሚያበቁ",
    searchPlaceholder: "መድሃኒቶችን በስም ወይም በባች ይፈልጉ...",
    allCategories: "ሁሉም ምድቦች",
    antibiotic: "ፀረ-ባክቴሪያ",
    painkiller: "ማስታገሻ",
    supplement: "ማሟያ",
    allStatuses: "ሁሉም ሁኔታዎች",
    allInventory: "ሁሉም ክምችት",
    inStock: "በክምችት አለ",
    lowStock: "አነስተኛ ክምችት",
    outOfStock: "ክምችት አልቋል",
    expiringSoon: "በቅርቡ የሚያበቃ",
    medication: "መድሃኒት",
    category: "ምድብ",
    quantity: "ብዛት",
    priceETB: "ዋጋ (ብር)",
    expiryDate: "የሚያበቃበት ቀን",
    status: "ሁኔታ",
    actions: "እርምጃዎች",
    batch: "ባች",
    noItems: "ምንም እቃ አልተገኘም።",
  },
};

const mapMedicationToItem = (med: any): InventoryItem => {
  const expiryDate = med.expiryDate ? new Date(med.expiryDate) : null;
  const expiringSoon = expiryDate
    ? expiryDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : false;
  let status = "In Stock";

  if (med.stockStatus === "out_of_stock") status = "Out of Stock";
  if (med.stockStatus === "low_stock") status = "Low Stock";
  if (expiringSoon && med.stockStatus !== "out_of_stock")
    status = "Expiring Soon";

  return {
    id: med._id,
    name: med.name,
    amharicName: med.name,
    genericName: med.genericName,
    dosageStrength: med.strength,
    dosageForm: med.dosageForm,
    category: med.category,
    description: med.description,
    requiresPrescription: med.requiresPrescription,
    quantity: med.stockQuantity ?? 0,
    price: med.price ?? 0,
    expiry: expiryDate ? expiryDate.toISOString().slice(0, 10) : "",
    batch: med.batchNumber,
    status,
    lowStockThreshold: med.lowStockThreshold,
    imageUrl: med.imageUrl,
  };
};

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [alertFilter, setAlertFilter] = useState("All");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { language } = useLanguage();
  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await apiGet<any[]>("/pharmacy/me/inventory");
        const items = (response.data || []).map(mapMedicationToItem);
        setInventoryItems(items);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInventory();
  }, []);
  const t = TRANSLATIONS[language];

  const handleAddStock = async (newItem: any) => {
    try {
      const payload = {
        name: newItem.name,
        genericName: newItem.genericName,
        category: newItem.category,
        dosageForm: newItem.dosageForm,
        strength: newItem.dosageStrength,
        manufacturer: newItem.supplier,
        batchNumber: newItem.batch,
        expiryDate: newItem.expiry,
        price: newItem.price,
        stockQuantity: newItem.quantity,
        lowStockThreshold: Number(newItem.lowStockThreshold || 10),
        requiresPrescription: newItem.requiresPrescription ?? false,
        description: newItem.description,
        imageUrl: newItem.imageUrl,
      };

      if (editItem) {
        const response = await apiPatch<any>(
          `/pharmacy/me/inventory/${editItem.id}`,
          payload,
        );
        const updatedItem = mapMedicationToItem(response.data);
        setInventoryItems((prev) =>
          prev.map((item) => (item.id === editItem.id ? updatedItem : item)),
        );
        setEditItem(null);
      } else {
        const response = await apiPost<any>("/pharmacy/me/inventory", payload);
        if (response.data) {
          setInventoryItems((prev) => [
            mapMedicationToItem(response.data),
            ...prev,
          ]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateItemField = (
    id: string,
    field: "quantity" | "price",
    value: number,
  ) => {
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleCommitUpdate = async (
    id: string,
    payload: Record<string, any>,
  ) => {
    try {
      await apiPatch(`/pharmacy/me/inventory/${id}`, payload);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditIcon = (item: InventoryItem) => {
    setEditItem(item);
    setIsAddStockOpen(true);
  };

  const handleDeleteIcon = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await apiDelete(`/pharmacy/me/inventory/${deleteConfirmId}`);
      setInventoryItems((prev) => prev.filter((i) => i.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBulkUpload = async (file: File) => {
    const result = await bulkUploadPharmacyInventoryApi(file);
    const response = await apiGet<any[]>("/pharmacy/me/inventory");
    setInventoryItems((response.data || []).map(mapMedicationToItem));
    return result;
  };

  const lowStockCount = inventoryItems.filter(
    (i) => i.status === "Low Stock",
  ).length;
  const outOfStockCount = inventoryItems.filter(
    (i) => i.status === "Out of Stock",
  ).length;
  const expiringCount = inventoryItems.filter(
    (i) => i.status === "Expiring Soon",
  ).length;

  const translateStatus = (status: string) => {
    switch (status) {
      case "In Stock":
        return t.inStock;
      case "Low Stock":
        return t.lowStock;
      case "Out of Stock":
        return t.outOfStock;
      case "Expiring Soon":
        return t.expiringSoon;
      default:
        return status;
    }
  };

  const translateCategory = (cat: string) => {
    switch (cat) {
      case "Antibiotic":
        return t.antibiotic;
      case "Painkiller":
        return t.painkiller;
      case "Supplement":
        return t.supplement;
      default:
        return cat;
    }
  };

  const filteredItems = inventoryItems.filter((item) => {
    const query = searchTerm.toLowerCase();
    const searchMatch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      (item.amharicName && item.amharicName.toLowerCase().includes(query)) ||
      (item.batch || "").toLowerCase().includes(query);

    const catMatch =
      categoryFilter === "All Categories" ||
      item.category === categoryFilter ||
      categoryFilter === t.allCategories;

    const isStatusAll =
      statusFilter === "All Statuses" || statusFilter === t.allStatuses;
    const statusMatch =
      isStatusAll ||
      item.status === statusFilter ||
      translateStatus(item.status) === statusFilter;

    let alertMatch = true;
    if (alertFilter === "Low Stock") alertMatch = item.status === "Low Stock";
    if (alertFilter === "Out of Stock")
      alertMatch = item.status === "Out of Stock";
    if (alertFilter === "Expiring Soon")
      alertMatch = item.status === "Expiring Soon";

    return searchMatch && catMatch && statusMatch && alertMatch;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">
            {t.inventoryManagement}
          </h1>
          <p className="text-gray-500 font-medium">{t.inventorySubtitle}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsBulkUploadOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-brand-950 px-4 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {t.bulkUploadCSV}
          </button>
          <button
            onClick={() => setIsAddStockOpen(true)}
            className="flex items-center gap-2 bg-brand-900 hover:bg-brand-800 text-white px-5 py-2.5 rounded-xl font-bold transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            {t.addNewItem}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setAlertFilter("All")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${alertFilter === "All" ? "bg-brand-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          {t.allInventory}
        </button>
        <button
          onClick={() => setAlertFilter("Low Stock")}
          className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-bold transition-colors ${alertFilter === "Low Stock" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}`}
        >
          <AlertTriangle className="w-4 h-4" />
          {lowStockCount} {t.itemsLowStock}
        </button>
        <button
          onClick={() => setAlertFilter("Out of Stock")}
          className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-bold transition-colors ${alertFilter === "Out of Stock" ? "bg-red-100 text-red-800 border-red-300" : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"}`}
        >
          <div className="w-2 h-2 rounded-full bg-red-600"></div>
          {outOfStockCount} {t.itemsOutOfStock}
        </button>
        <button
          onClick={() => setAlertFilter("Expiring Soon")}
          className={`flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-bold transition-colors ${alertFilter === "Expiring Soon" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}`}
        >
          <Clock className="w-4 h-4" />
          {expiringCount} {t.itemsExpiring}
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-accent-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select
            className="bg-accent-50 border border-gray-200 text-brand-950 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All Categories">{t.allCategories}</option>
            <option value="Antibiotic">{t.antibiotic}</option>
            <option value="Painkiller">{t.painkiller}</option>
            <option value="Supplement">{t.supplement}</option>
          </select>
          <select
            className="bg-accent-50 border border-gray-200 text-brand-950 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Statuses">{t.allStatuses}</option>
            <option value="In Stock">{t.inStock}</option>
            <option value="Low Stock">{t.lowStock}</option>
            <option value="Out of Stock">{t.outOfStock}</option>
            <option value="Expiring Soon">{t.expiringSoon}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-medium">{t.medication}</th>
                <th className="p-4 font-medium">{t.category}</th>
                <th className="p-4 font-medium">{t.quantity}</th>
                <th className="p-4 font-medium">{t.priceETB}</th>
                <th className="p-4 font-medium">{t.expiryDate}</th>
                <th className="p-4 font-medium">{t.status}</th>
                <th className="p-4 font-medium text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-accent-50/50 transition-colors ${
                    item.status === "Out of Stock"
                      ? "bg-red-50/30"
                      : item.status === "Expiring Soon"
                        ? "bg-amber-50/30"
                        : ""
                  }`}
                >
                  <td className="p-4">
                    <p className="font-bold text-brand-950 text-sm">
                      {language === "am" && item.amharicName
                        ? item.amharicName
                        : item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {language === "en" && item.amharicName
                        ? item.amharicName
                        : item.name}{" "}
                      • {t.batch}: {item.batch || "N/A"}
                    </p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {translateCategory(item.category || "")}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItemField(
                            item.id,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                        onBlur={(e) =>
                          handleCommitUpdate(item.id, {
                            stockQuantity: Number(e.target.value),
                          })
                        }
                        className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleUpdateItemField(
                            item.id,
                            "price",
                            Number(e.target.value),
                          )
                        }
                        onBlur={(e) =>
                          handleCommitUpdate(item.id, {
                            price: Number(e.target.value),
                          })
                        }
                        className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-sm ${item.status === "Expiring Soon" ? "text-red-600 font-bold" : "text-gray-600"}`}
                    >
                      {item.expiry || "N/A"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        item.status === "In Stock"
                          ? "bg-emerald-50 text-emerald-700"
                          : item.status === "Low Stock"
                            ? "bg-amber-50 text-amber-700"
                            : item.status === "Out of Stock"
                              ? "bg-red-50 text-red-700"
                              : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {translateStatus(item.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditIcon(item)}
                        title="Edit Name"
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteIcon(item.id)}
                        title="Delete Item"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    {t.noItems}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddStockPanel
        isOpen={isAddStockOpen}
        onClose={() => {
          setIsAddStockOpen(false);
          setEditItem(null);
        }}
        onAdd={handleAddStock}
        editItem={editItem}
      />

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onUpload={handleBulkUpload}
      />

      {deleteConfirmId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {language === "en" ? "Delete Item" : "እቃ መሰረዝ"}
              </h3>
              <p className="text-gray-600 mb-6">
                {language === "en"
                  ? "Are you sure you want to delete this item? This action cannot be undone."
                  : "ይህን እቃ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ይሄ ድርጊት ወደኋላ መመለስ አይቻልም።"}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors w-full"
                >
                  {language === "en" ? "Cancel" : "ሰርዝ"}
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors w-full"
                >
                  {language === "en" ? "Delete" : "አጥፋ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
