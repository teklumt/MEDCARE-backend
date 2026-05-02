"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  MapPin,
  Navigation,
  Phone,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Globe,
  ChevronDown,
} from "lucide-react";

type DeliveryStatus = "ON THE WAY" | "DELAYED" | "ARRIVED" | "DELIVERED";

interface DeliveryOrder {
  id: string;
  status: DeliveryStatus;
  statusAm: string;
  patient: string;
  address: string;
  agent: string;
  eta: string;
  elapsedMins: number;
  flagged: boolean;
  flagDetails?: any;
}

const INITIAL_DELIVERIES: DeliveryOrder[] = [
  {
    id: "ORD-20840",
    status: "ON THE WAY",
    statusAm: "በመንገድ ላይ",
    patient: "Sara Mohammed",
    address: "Bole, Atlas Area",
    agent: "Abebe Tadesse",
    eta: "10",
    elapsedMins: 25,
    flagged: false,
  },
  {
    id: "ORD-20841",
    status: "DELAYED",
    statusAm: "ዘግይቷል",
    patient: "Helen Girma",
    address: "Kazanchis",
    agent: "Dawit Kebede",
    eta: "Unknown",
    elapsedMins: 45,
    flagged: false,
  },
];

const PERSONNEL = [
  {
    id: "1",
    name: "Abebe Tadesse",
    phone: "+251 911 234 567",
    vehicle: "Motorcycle",
    vehicleAm: "ሞተርሳይክል",
    status: "On Delivery",
    statusAm: "በማድረስ ላይ",
    activeCount: 2,
    limit: 5,
  },
  {
    id: "2",
    name: "Dawit Kebede",
    phone: "+251 922 345 678",
    vehicle: "Bicycle",
    vehicleAm: "ብስክሌት",
    status: "On Delivery",
    statusAm: "በማድረስ ላይ",
    activeCount: 1,
    limit: 3,
  },
  {
    id: "3",
    name: "Chala Mohammed",
    phone: "+251 933 456 789",
    vehicle: "Motorcycle",
    vehicleAm: "ሞተርሳይክል",
    status: "Available",
    statusAm: "ዝግጁ",
    activeCount: 0,
    limit: 5,
  },
];

const TRANSLATIONS = {
  en: {
    deliveryOps: "Delivery Operations",
    deliveryOpsSubtitle: "Track active deliveries and manage your personnel.",
    tabs: ["Active Deliveries", "Delivery Personnel", "Performance"],
    liveMapView: "Live Map View",
    trackingAgents: "Tracking 2 active agents",
    currentDispatches: "Current Dispatches",
    to: "To",
    eta: "ETA",
    elapsed: "Elapsed",
    contact: "Contact",
    flagIssue: "Flag Issue",
    deliveryTeam: "Delivery Team",
    addPersonnel: "Add Personnel",
    tabName: "Name",
    tabContact: "Contact",
    tabVehicle: "Vehicle",
    tabStatus: "Status",
    tabWorkload: "Workload",
    tabActions: "Actions",
    edit: "Edit",
    performancePlaceholder:
      "Performance metrics and COD confirmation will appear here.",
  },
  am: {
    deliveryOps: "የአቅርቦት ስራዎች",
    deliveryOpsSubtitle: "ንቁ አቅርቦቶችን ይከታተሉ እና ሰራተኞችዎን ያስተዳድሩ።",
    tabs: ["ንቁ አቅርቦቶች", "አድራሽ ሰራተኞች", "አፈጻጸም"],
    liveMapView: "የካርታ እይታ",
    trackingAgents: "2 ንቁ አድራሾችን በመከታተል ላይ",
    currentDispatches: "የአሁኑ አቅርቦቶች",
    to: "ወደ",
    eta: "የሚጠበቀው ጊዜ",
    elapsed: "ያለፈው ጊዜ",
    contact: "አግኝ",
    flagIssue: "ችግር ሪፖርት አድርግ",
    deliveryTeam: "አድራሽ ቡድን",
    addPersonnel: "ሰራተኛ አክል",
    tabName: "ስም",
    tabContact: "አድራሻ",
    tabVehicle: "ተሽከርካሪ",
    tabStatus: "ሁኔታ",
    tabWorkload: "የስራ ጫና",
    tabActions: "ድርጊቶች",
    edit: "አስተካክል",
    performancePlaceholder: "የአፈጻጸም መለኪያዎች እና የ COD ማረጋገጫዎች እዚህ ይታያሉ።",
  },
};

export default function DeliveriesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { language, setLanguage } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const [deliveries, setDeliveries] = useState<DeliveryOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Modals state
  const [contactModalDelivery, setContactModalDelivery] =
    useState<DeliveryOrder | null>(null);
  const [flagModalDelivery, setFlagModalDelivery] =
    useState<DeliveryOrder | null>(null);
  const [viewFlagModalDelivery, setViewFlagModalDelivery] =
    useState<DeliveryOrder | null>(null);

  // Flag Modal specifics
  const [flagIssueType, setFlagIssueType] = useState<string>("");
  const [flagDescription, setFlagDescription] = useState<string>("");
  const [flagUrgency, setFlagUrgency] = useState<
    "Low" | "Medium" | "High" | ""
  >("");
  const [flagNotifyPatient, setFlagNotifyPatient] = useState<boolean>(true);
  const [isSubmittingFlag, setIsSubmittingFlag] = useState<boolean>(false);
  const [discardConfirmState, setDiscardConfirmState] =
    useState<boolean>(false);

  // Contact Modal specifics
  const [isFetchingContact, setIsFetchingContact] = useState<boolean>(false);
  const [contactPatientPhone, setContactPatientPhone] = useState<string | null>(
    null,
  );
  const [contactAgentPhone, setContactAgentPhone] = useState<string | null>(
    null,
  );
  const [contactTab, setContactTab] = useState<"agent" | "patient">("agent");
  const [showNotificationInput, setShowNotificationInput] = useState(false);
  const [notificationText, setNotificationText] = useState("");
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastMessageTwo, setToastMessageTwo] = useState<string | null>(null);

  const showToast = (msg: string, secondaryMsg?: string) => {
    setToastMessage(msg);
    if (secondaryMsg) {
      setTimeout(() => setToastMessageTwo(secondaryMsg), 1000);
      setTimeout(() => setToastMessageTwo(null), 4000);
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Setup initial fetch and polling
  useEffect(() => {
    let mounted = true;

    // Simulate initial fetch
    setTimeout(() => {
      if (mounted) {
        setDeliveries([...INITIAL_DELIVERIES]);
        setIsLoading(false);
      }
    }, 800);

    // Polling every 30s
    const pollInterval = setInterval(() => {
      // In a real app we'd fetch here. For now we just keep the current list mostly.
      // We could simulate changes but sticking to elapsed time updates is safer.
    }, 30000);

    // Update elapsed time every 60s
    const timerInterval = setInterval(() => {
      setDeliveries((prev) =>
        prev.map((d) => {
          const newElapsed = d.elapsedMins + 1;
          const etaMins = parseInt(d.eta);
          let newStatus = d.status;

          // Auto-delay if ETA exceeded by 15 mins
          if (
            !isNaN(etaMins) &&
            d.status === "ON THE WAY" &&
            newElapsed > etaMins + 15
          ) {
            newStatus = "DELAYED";
          }

          return { ...d, elapsedMins: newElapsed, status: newStatus };
        }),
      );
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const handleOpenContactModal = (delivery: DeliveryOrder) => {
    setContactModalDelivery(delivery);
    setIsFetchingContact(true);
    setContactTab("agent");
    setShowNotificationInput(false);
    setNotificationSent(false);

    // Simulate fetch
    setTimeout(() => {
      // Find mocked phones from Personnel and original active deliveries
      const agentPhone =
        PERSONNEL.find((p) => p.name === delivery.agent)?.phone ||
        "+251 911 000 000";
      const patientPhone =
        delivery.patient === "Sara Mohammed"
          ? "+251 911 234 567"
          : "+251 922 345 678";

      setContactAgentPhone(agentPhone);
      setContactPatientPhone(patientPhone);
      setIsFetchingContact(false);

      setNotificationText(
        `Hello ${delivery.patient}, your order ${delivery.id} from Kenema Pharmacy is ${delivery.status}. ${delivery.agent} is your delivery agent. We will update you shortly.`,
      );
    }, 600);
  };

  const handleOpenFlagModal = (delivery: DeliveryOrder) => {
    if (delivery.flagged) {
      setViewFlagModalDelivery(delivery);
      return;
    }

    setFlagModalDelivery(delivery);
    setFlagIssueType(delivery.status === "DELAYED" ? "Significant Delay" : "");
    setFlagDescription("");
    setFlagUrgency(delivery.status === "DELAYED" ? "High" : "");
    setFlagNotifyPatient(true);
    setDiscardConfirmState(false);
  };

  const handleCloseFlagModal = () => {
    if ((flagIssueType || flagDescription) && !discardConfirmState) {
      setDiscardConfirmState(true);
      return;
    }
    setFlagModalDelivery(null);
    setDiscardConfirmState(false);
  };

  const submitFlag = () => {
    if (
      !flagModalDelivery ||
      !flagIssueType ||
      flagDescription.length < 20 ||
      !flagUrgency
    )
      return;

    setIsSubmittingFlag(true);
    setTimeout(() => {
      // Success
      setDeliveries((prev) =>
        prev.map((d) => {
          if (d.id === flagModalDelivery.id) {
            return {
              ...d,
              flagged: true,
              flagDetails: {
                type: flagIssueType,
                desc: flagDescription,
                urgency: flagUrgency,
              },
              status:
                flagUrgency === "Medium" || flagUrgency === "High"
                  ? "DELAYED"
                  : d.status,
            };
          }
          return d;
        }),
      );

      setIsSubmittingFlag(false);
      setFlagModalDelivery(null);

      if (flagUrgency === "Low") {
        showToast(
          `Issue flagged for ${flagModalDelivery.id}.`,
          flagNotifyPatient
            ? `Patient ${flagModalDelivery.patient} has been notified.`
            : undefined,
        );
      } else {
        showToast(
          `Issue flagged for ${flagModalDelivery.id}. Admin has been notified.`,
          flagNotifyPatient
            ? `Patient ${flagModalDelivery.patient} has been notified.`
            : undefined,
        );
      }
    }, 1000);
  };

  const sendNotification = () => {
    setIsSendingNotification(true);
    setTimeout(() => {
      setIsSendingNotification(false);
      setNotificationSent(true);
      setShowNotificationInput(false);
    }, 800);
  };

  const toggleLanguage = (lang: "en" | "am") => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const t = TRANSLATIONS[language];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">
            {t.deliveryOps}
          </h1>
          <p className="text-gray-500 font-medium">{t.deliveryOpsSubtitle}</p>
        </div>

        <div className="flex items-center">
          {/* Compact Language Selector */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-4 h-4 text-brand-600" />
              <span className="text-sm font-bold text-brand-950">
                {language === "en" ? "EN" : "አማ"}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <button
                  onClick={() => toggleLanguage("en")}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === "en" ? "text-brand-600 bg-brand-50/50" : "text-gray-700"}`}
                >
                  English
                </button>
                <button
                  onClick={() => toggleLanguage("am")}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === "am" ? "text-brand-600 bg-brand-50/50" : "text-gray-700"}`}
                >
                  አማርኛ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 shrink-0">
        {t.tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`whitespace-nowrap px-6 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === idx ? "border-brand-600 text-brand-900" : "border-transparent text-gray-500 hover:text-brand-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {activeTab === 0 && (
          <>
            {/* Map Placeholder */}
            <div className="h-64 bg-gray-200 rounded-2xl border border-gray-300 flex items-center justify-center shrink-0 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'url("https://www.transparenttextures.com/patterns/cubes.png")',
                }}
              ></div>
              <div className="text-center relative z-10 p-4">
                <MapPin className="w-8 h-8 text-brand-600 mx-auto mb-2" />
                <p className="font-bold text-gray-700">{t.liveMapView}</p>
                <p className="text-sm font-bold text-gray-900 mb-3">
                  Tracking {deliveries.length} active agent
                  {deliveries.length !== 1 ? "s" : ""}
                </p>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-4 py-2 rounded-lg max-w-sm mx-auto shadow-sm">
                  Map integration is currently unavailable. Delivery agents are
                  being tracked — use the contact and status information below
                  to monitor dispatches.
                </div>
              </div>
            </div>

            {/* Active Deliveries List */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-brand-950">
                  {t.currentDispatches}
                </h3>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col md:flex-row gap-4"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                        <div className="h-10 bg-gray-200 rounded-xl w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : hasError ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                  <p className="text-gray-900 font-bold mb-1">
                    Unable to load delivery data.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="text-brand-600 font-bold text-sm hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : deliveries.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
                  <Navigation className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-900 font-bold mb-1">
                    No active deliveries right now.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Accepted orders assigned to delivery agents will appear
                    here.
                  </p>
                </div>
              ) : (
                deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-brand-950">
                          {delivery.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            delivery.status === "DELAYED"
                              ? "bg-red-50 text-red-700"
                              : delivery.status === "ARRIVED"
                                ? "bg-blue-50 text-blue-700"
                                : delivery.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {language === "am"
                            ? delivery.statusAm
                            : delivery.status}
                        </span>
                        {delivery.flagged && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {t.to}: {delivery.patient} • {delivery.address}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {delivery.agent}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {t.eta}:{" "}
                          {delivery.eta !== "Unknown"
                            ? `${delivery.eta} mins`
                            : "Unknown"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3.5 h-3.5" /> {t.elapsed}:{" "}
                          {delivery.elapsedMins} mins
                        </span>
                      </div>

                      {delivery.status === "ON THE WAY" &&
                        delivery.eta !== "Unknown" &&
                        delivery.elapsedMins > parseInt(delivery.eta) + 15 && (
                          <div className="mt-2 text-xs font-medium text-amber-700 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> This delivery
                            may be delayed. Consider contacting the agent.
                          </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => handleOpenContactModal(delivery)}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                      >
                        <Phone className="w-4 h-4" /> {t.contact}
                      </button>

                      <Link 
                        href={`/pharmacy/messages?agent=${encodeURIComponent(delivery.agent)}&orderId=${delivery.id}`} 
                        className="flex items-center justify-center p-2 text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors"
                        title="Message Agent"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                      </Link>

                      {delivery.flagged ? (
                        <button
                          onClick={() => handleOpenFlagModal(delivery)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors border border-red-200"
                        >
                          View Flag
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenFlagModal(delivery)}
                          className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                          <AlertCircle className="w-4 h-4" /> {t.flagIssue}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center min-w-max">
              <h3 className="font-bold text-brand-950 pr-4">
                {t.deliveryTeam}
              </h3>
              <button className="text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                {t.addPersonnel}
              </button>
            </div>
            <div className="min-w-full inline-block align-middle">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-accent-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-medium">{t.tabName}</th>
                    <th className="p-4 font-medium">{t.tabContact}</th>
                    <th className="p-4 font-medium">{t.tabVehicle}</th>
                    <th className="p-4 font-medium">{t.tabStatus}</th>
                    <th className="p-4 font-medium">{t.tabWorkload}</th>
                    <th className="p-4 font-medium text-right">
                      {t.tabActions}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PERSONNEL.map((person) => (
                    <tr key={person.id} className="hover:bg-accent-50/50">
                      <td className="p-4 font-bold text-brand-950 text-sm">
                        {person.name}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {person.phone}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {language === "am" ? person.vehicleAm : person.vehicle}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap ${person.status === "Available" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}
                        >
                          {language === "am" ? person.statusAm : person.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                            <div
                              className={`h-full ${person.activeCount === person.limit ? "bg-red-500" : "bg-brand-500"}`}
                              style={{
                                width: `${(person.activeCount / person.limit) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-gray-500">
                            {person.activeCount}/{person.limit}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link 
                            href={`/pharmacy/messages?agent=${encodeURIComponent(person.name)}&tab=team`}
                            className="text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 p-2 rounded-lg transition-colors"
                            title="Message Agent"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                          </Link>
                          <button className="text-sm font-bold text-gray-600 hover:text-gray-900">
                            {t.edit}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="flex items-center justify-center p-12 text-gray-500 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 mt-4">
            {t.performancePlaceholder}
          </div>
        )}
      </div>

      {/* Modals */}

      {/* Contact Modal */}
      {contactModalDelivery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setContactModalDelivery(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Contact — {contactModalDelivery.id}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{contactModalDelivery.patient}</span> •
                <span>{contactModalDelivery.agent}</span> •
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    contactModalDelivery.status === "DELAYED"
                      ? "bg-red-50 text-red-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {contactModalDelivery.status}
                </span>
              </div>
              <button
                onClick={() => setContactModalDelivery(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <AlertCircle className="w-5 h-5 hidden" /> {/* just padding */}
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>

            <div className="flex border-b border-gray-100">
              <button
                onClick={() => {
                  setContactTab("agent");
                  setShowNotificationInput(false);
                }}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${contactTab === "agent" ? "border-brand-600 text-brand-900" : "border-transparent text-gray-500 hover:text-brand-700"}`}
              >
                Delivery Agent
              </button>
              <button
                onClick={() => {
                  setContactTab("patient");
                  setShowNotificationInput(false);
                }}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${contactTab === "patient" ? "border-brand-600 text-brand-900" : "border-transparent text-gray-500 hover:text-brand-700"}`}
              >
                Patient
              </button>
            </div>

            <div className="p-6 bg-gray-50">
              {contactTab === "agent" ? (
                // Agent Tab
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Delivery Agent
                    </p>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {contactModalDelivery.agent || "Not Assigned"}
                    </p>

                    {isFetchingContact ? (
                      <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse mb-4"></div>
                    ) : contactAgentPhone ? (
                      <p className="font-mono text-gray-700 mb-4">
                        {contactAgentPhone}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic mb-4">
                        Phone number not available. <br />
                        Contact information is missing for this delivery.
                      </p>
                    )}

                    <div className="flex gap-3">
                      <a
                        href={
                          contactAgentPhone ? `tel:${contactAgentPhone}` : "#"
                        }
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                          contactAgentPhone
                            ? "bg-brand-600 text-white hover:bg-brand-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={(e) =>
                          !contactAgentPhone && e.preventDefault()
                        }
                      >
                        <Phone className="w-4 h-4" /> Call Agent
                      </a>
                      <Link
                        href={`/pharmacy/messages`}
                        onClick={() => setContactModalDelivery(null)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Send Message
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // Patient Tab
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Patient
                    </p>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {contactModalDelivery.patient}
                    </p>

                    {isFetchingContact ? (
                      <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse mb-4"></div>
                    ) : contactPatientPhone ? (
                      <p className="font-mono text-gray-700 mb-4">
                        {contactPatientPhone}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic mb-4">
                        Phone number not available. <br />
                        Contact information is missing for this delivery.
                      </p>
                    )}

                    <div className="flex gap-3">
                      <a
                        href={
                          contactPatientPhone
                            ? `tel:${contactPatientPhone}`
                            : "#"
                        }
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                          contactPatientPhone
                            ? "bg-brand-600 text-white hover:bg-brand-700"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={(e) =>
                          !contactPatientPhone && e.preventDefault()
                        }
                      >
                        <Phone className="w-4 h-4" /> Call Patient
                      </a>
                      <button
                        onClick={() => setShowNotificationInput(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Send Notification
                      </button>
                    </div>
                  </div>

                  {showNotificationInput && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Notification Message
                      </label>
                      <textarea
                        value={notificationText}
                        onChange={(e) => setNotificationText(e.target.value)}
                        className="w-full h-24 mb-3 p-3 border border-gray-200 text-sm text-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowNotificationInput(false)}
                          className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={sendNotification}
                          disabled={
                            isSendingNotification ||
                            notificationText.trim() === ""
                          }
                          className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-50"
                        >
                          {isSendingNotification
                            ? "Sending..."
                            : "Send Notification"}
                        </button>
                      </div>
                    </div>
                  )}
                  {notificationSent && (
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 flex items-center justify-center gap-2 text-sm font-bold animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4" /> Notification sent to{" "}
                      {contactModalDelivery.patient}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flag Issue Modal */}
      {flagModalDelivery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={handleCloseFlagModal}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {discardConfirmState ? (
              <div className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Discard this report?
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Your input will not be saved.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setDiscardConfirmState(false)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                  >
                    Keep editing
                  </button>
                  <button
                    onClick={() => {
                      setDiscardConfirmState(false);
                      setFlagModalDelivery(null);
                    }}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-100 shrink-0">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Report a Delivery Issue
                  </h3>
                  <p className="text-sm font-medium text-gray-600">
                    {flagModalDelivery.id} — {flagModalDelivery.patient}
                  </p>
                  <button
                    onClick={handleCloseFlagModal}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-xl leading-none">&times;</span>
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  {/* Issue Type */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Select Issue Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          id: "Cannot Locate Address",
                          label: "Cannot Locate Address",
                          desc: "Agent can't find location",
                        },
                        {
                          id: "Patient Unreachable",
                          label: "Patient Unreachable",
                          desc: "Not answering calls",
                        },
                        {
                          id: "Agent Reported Problem",
                          label: "Agent Problem",
                          desc: "Vehicle issue, emergency",
                        },
                        {
                          id: "Significant Delay",
                          label: "Significant Delay",
                          desc: "Taking much longer",
                        },
                        {
                          id: "Order Damaged",
                          label: "Order Damaged",
                          desc: "Condition concern",
                        },
                        {
                          id: "Other",
                          label: "Other",
                          desc: "Describe manually",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setFlagIssueType(opt.id)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            flagIssueType === opt.id
                              ? "border-brand-600 bg-brand-50 shadow-sm"
                              : "border-gray-100 hover:border-gray-200 bg-white"
                          }`}
                        >
                          <p
                            className={`font-bold text-sm ${flagIssueType === opt.id ? "text-brand-900" : "text-gray-700"}`}
                          >
                            {opt.label}
                          </p>
                          <p
                            className={`text-[10px] sm:text-xs mt-0.5 ${flagIssueType === opt.id ? "text-brand-700" : "text-gray-500"}`}
                          >
                            {opt.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      {flagIssueType === "Other"
                        ? "Please describe the issue (required)"
                        : "Additional details (required)"}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={flagDescription}
                      onChange={(e) => setFlagDescription(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none h-24 text-sm"
                      placeholder="Describe the issue in detail. Include any relevant information that will help resolve this quickly."
                    ></textarea>
                    <div className="text-right mt-1">
                      <span
                        className={`text-xs font-medium ${flagDescription.length < 20 ? "text-red-500" : "text-emerald-600"}`}
                      >
                        {flagDescription.length} / 500 characters
                      </span>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Urgency Level <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${flagUrgency === "Low" ? "border-amber-400 bg-amber-50" : "border-gray-100 bg-white"}`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="Low"
                          className="sr-only"
                          onChange={() => setFlagUrgency("Low")}
                          checked={flagUrgency === "Low"}
                        />
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <span className="text-sm font-bold text-gray-700">
                          Low
                        </span>
                      </label>
                      <label
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${flagUrgency === "Medium" ? "border-orange-500 bg-orange-50" : "border-gray-100 bg-white"}`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="Medium"
                          className="sr-only"
                          onChange={() => setFlagUrgency("Medium")}
                          checked={flagUrgency === "Medium"}
                        />
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-sm font-bold text-gray-700">
                          Medium
                        </span>
                      </label>
                      <label
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${flagUrgency === "High" ? "border-red-600 bg-red-50" : "border-gray-100 bg-white"}`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value="High"
                          className="sr-only"
                          onChange={() => setFlagUrgency("High")}
                          checked={flagUrgency === "High"}
                        />
                        <div className="w-3 h-3 rounded-full bg-red-600"></div>
                        <span className="text-sm font-bold text-gray-700">
                          High
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Notify Patient */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                        checked={flagNotifyPatient}
                        onChange={(e) => setFlagNotifyPatient(e.target.checked)}
                      />
                      <div>
                        <span className="text-sm font-bold text-gray-900 block mb-1">
                          Notify patient about this issue
                        </span>
                        {flagNotifyPatient && (
                          <div className="text-xs text-gray-600 italic border-l-2 border-brand-300 pl-2">
                            Preview: "Hello {flagModalDelivery.patient}, there
                            is a delay with your order {flagModalDelivery.id}{" "}
                            from Kenema Pharmacy. Our team is working to resolve
                            this. We will update you shortly."
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
                  <button
                    onClick={submitFlag}
                    disabled={
                      !flagIssueType ||
                      flagDescription.length < 20 ||
                      !flagUrgency ||
                      isSubmittingFlag
                    }
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center h-[52px]"
                  >
                    {isSubmittingFlag ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Submit Flag"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* View Active Flag Modal */}
      {viewFlagModalDelivery && viewFlagModalDelivery.flagDetails && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setViewFlagModalDelivery(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 bg-red-50 flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-0.5">
                  Active Issue Report
                </h3>
                <p className="text-sm font-medium text-red-800">
                  {viewFlagModalDelivery.id}
                </p>
              </div>
              <button
                onClick={() => setViewFlagModalDelivery(null)}
                className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors"
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg font-medium">
                An issue report is already active for this delivery. It is
                currently under review.
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Issue Type
                </p>
                <p className="font-bold text-gray-900">
                  {viewFlagModalDelivery.flagDetails.type}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {viewFlagModalDelivery.flagDetails.desc}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Urgency
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    viewFlagModalDelivery.flagDetails.urgency === "High"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : viewFlagModalDelivery.flagDetails.urgency === "Medium"
                        ? "bg-orange-100 text-orange-700 border border-orange-200"
                        : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      viewFlagModalDelivery.flagDetails.urgency === "High"
                        ? "bg-red-600"
                        : viewFlagModalDelivery.flagDetails.urgency === "Medium"
                          ? "bg-orange-500"
                          : "bg-amber-400"
                    }`}
                  ></div>
                  {viewFlagModalDelivery.flagDetails.urgency}
                </span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
              <button
                onClick={() => setViewFlagModalDelivery(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-0 mx-auto w-max z-50 flex flex-col gap-2 items-center pointer-events-none">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-medium animate-in fade-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </div>
          {toastMessageTwo && (
            <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 font-medium animate-in fade-in slide-in-from-bottom-5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              {toastMessageTwo}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
