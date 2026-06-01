'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Search, MapPin, Clock, CheckCircle2, XCircle, AlertTriangle, MessageSquare, ClipboardList, Globe, ChevronDown, FileText } from 'lucide-react';
import { apiGet, apiPatch, getMyDeliveryAgents, getMyPharmacy, getPrescriptionUpload, verifyPrescriptionUpload, rejectPrescriptionUpload, createConversation as ensureConversation, getConversationMessages, sendConversationMessage, markConversationRead, type PharmacyDeliveryAgent, type ConversationMessage, type DeliveryAddressPayload, type MyPharmacyProfile } from '@/lib/api';
import OrderRouteMapPanel from '@/components/pharmacy/OrderRouteMapPanel';
import { formatDeliveryAddressText } from '@/lib/mapGeo';

function fileLabelFromUrl(fileUrl: string): string {
  try {
    const u = new URL(fileUrl);
    const seg = u.pathname.split('/').filter(Boolean).pop();
    if (seg) return decodeURIComponent(seg);
  } catch {
    /* non-absolute URL fallback below */
    const slash = fileUrl.split('/').filter(Boolean).pop();
    if (slash) return decodeURIComponent(slash.replace(/\?.*$/, ''));
  }
  return 'prescription.pdf';
}

type OrderEntry = {
  id: string;
  backendId: string;
  patient: string;
  items: string;
  itemsAm?: string;
  total: number;
  method: string;
  time: string;
  payment: string;
  status: string;
  hasPrescription: boolean;
  driverHandoffAt?: string | null;
  deliveryAgentId?: string | null;
  prescriptionUploadMongoId?: string | null;
  prescriptionVerified?: boolean;
  paymentStatus?: string;
  needsRxReview?: boolean;
  awaitingPatientPaymentAfterRx?: boolean;
  patientId: string;
  deliveryAddress?: DeliveryAddressPayload;
  tripStartedAt?: string | null;
};

const ORDERS: OrderEntry[] = [];

const TRANSLATIONS = {
  en: {
    orderManagement: 'Order Management',
    orderSubtitle: 'Process and track incoming patient orders.',
    actionRequired: 'Action Required',
    urgentWarning: '3 orders have been waiting over 30 minutes. Please process them immediately.',
    viewOrders: 'View Orders',
    tabs: ['All Orders', 'New', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Prescription review'],
    searchPlaceholder: 'Search by Order ID or Patient Name...',
    allDeliveryMethods: 'All Delivery Methods',
    homeDelivery: 'Home Delivery',
    pickup: 'Pickup',
    deliveryMethod: 'Method',
    payment: 'Payment',
    paidChapa: 'Paid (Chapa)',
    pendingCash: 'Pending (Cash)',
    reject: 'Reject',
    accept: 'Accept',
    markReady: 'Mark Ready',
    assignDelivery: 'Assign Delivery',
    track: 'Track',
    statusNew: 'NEW',
    statusPreparing: 'PREPARING',
    statusAccepted: 'ACCEPTED',
    statusOutForDelivery: 'OUT FOR DELIVERY',
    colOrderId: 'ORDER ID',
    colDrug: 'DRUG',
    colStatus: 'STATUS',
    colAction: 'ACTION',
    awaitingPatient: 'AWAITING PATIENT',
    awaitingRxVerification: 'Awaiting Rx verification',
    awaitingPatientPayment: 'Awaiting patient payment',
    attachedRxFile: 'Attached file',
    rxModalIntro: 'Review the prescription file below, then accept or reject.'
  },
  am: {
    orderManagement: 'የእዘዛ አስተዳደር',
    orderSubtitle: 'የታካሚዎችን ትዕዛዞች ያካሂዱ እና ይከታተሉ።',
    actionRequired: 'አስቸኳይ እርምጃ ይፈልጋል',
    urgentWarning: '3 ትዕዛዞች ከ30 ደቂቃ በላይ እየጠበቁ ናቸው። እባክዎ ወዲያውኑ ያስተናግዷቸው።',
    viewOrders: 'ትዕዛዞችን ይመልከቱ',
    tabs: ['ሁሉም ትዕዛዞች', 'አዲስ', 'ተቀባይነት ያገኙ', 'በመዘጋጀት ላይ', 'በመንገድ ላይ', 'የደረሱ', 'የመድሃኒት ማረጋገጫ'],
    searchPlaceholder: 'በትዕዛዝ መለያ ወይም በታካሚ ስም ይፈልጉ...',
    allDeliveryMethods: 'ሁሉም የአቅርቦት ዘዴዎች',
    homeDelivery: 'የቤት አቅርቦት',
    pickup: 'በአካል መውሰድ',
    deliveryMethod: 'ዘዴ',
    payment: 'ክፍያ',
    paidChapa: 'የተከፈለ (Chapa)',
    pendingCash: 'በመጠባበቅ ላይ (ካሽ)',
    reject: 'ውድቅ አድርግ',
    accept: 'ተቀበል',
    markReady: 'ዝግጁ አድርግ',
    assignDelivery: 'አድራሽ መድብ',
    track: 'ተከታተል',
    statusNew: 'አዲስ',
    statusPreparing: 'በመዘጋጀት ላይ',
    statusAccepted: 'ተቀባይነት ያገኙ',
    statusOutForDelivery: 'በመንገድ ላይ',
    colOrderId: 'የትዕዛዝ መለያ',
    colDrug: 'መድሃኒት',
    colStatus: 'ሁኔታ',
    colAction: 'እርምጃ',
    awaitingPatient: 'ታካሚ እየተጠበቀ ነው',
    awaitingRxVerification: 'የመዛው ማረጋገጫ በመጠባበቅ ላይ',
    awaitingPatientPayment: 'የታካሚ ክፍያ በመጠባበቅ ላይ',
    attachedRxFile: 'የተያያዘ ፋይል',
    rxModalIntro: 'ከስር ያለውን የመድሃኒት የዶክተር ትዕዛዝ ተመልከት፣ ከዚያ ተቀበል ወይም ውድቅ።'
  }
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { language } = useLanguage();
const [searchQuery, setSearchQuery] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('All');
  
  const [orders, setOrders] = useState<OrderEntry[]>(ORDERS);
  const [acceptModalOrder, setAcceptModalOrder] = useState<string | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<string | null>(null);
  const [rxReviewModalOrder, setRxReviewModalOrder] = useState<string | null>(null);
  const [rxRejectNote, setRxRejectNote] = useState('');
  const [markReadyModalOrder, setMarkReadyModalOrder] = useState<string | null>(null);
  const [assignDeliveryModalOrder, setAssignDeliveryModalOrder] = useState<string | null>(null);
  const [codWarningModalOrder, setCodWarningModalOrder] = useState<string | null>(null);
  const [trackModalOrder, setTrackModalOrder] = useState<string | null>(null);
  const [chatModalOrder, setChatModalOrder] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [orderChatConversationId, setOrderChatConversationId] = useState<string | null>(null);
  const [orderChatMessages, setOrderChatMessages] = useState<ConversationMessage[]>([]);
  const [orderChatLoading, setOrderChatLoading] = useState(false);
  const [orderChatSending, setOrderChatSending] = useState(false);
  const orderChatMessagesRef = useRef<ConversationMessage[]>([]);
  const orderChatConvIdRef = useRef<string | null>(null);
  const chatEndAnchorRef = useRef<HTMLDivElement>(null);
  
  const [preparationTime, setPreparationTime] = useState('15');
  const [rejectReason, setRejectReason] = useState('');
  const [suggestAlternatives, setSuggestAlternatives] = useState(true);
  
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rxActionLoading, setRxActionLoading] = useState(false);
  const [rxModalFile, setRxModalFile] = useState<{ url: string; label: string } | null>(null);
  const [rxModalFileLoading, setRxModalFileLoading] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [deliveryAgents, setDeliveryAgents] = useState<PharmacyDeliveryAgent[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const [pharmacyProfile, setPharmacyProfile] = useState<MyPharmacyProfile | null>(null);

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const mapOrder = (order: any): OrderEntry => {
    const statusMap: Record<string, string> = {
      pending: 'new',
      confirmed: 'accepted',
      preparing: 'preparing',
      ready: 'preparing',
      dispatched: 'out_for_delivery',
      delivered: 'delivered',
      rejected: 'rejected',
      cancelled: 'rejected'
    };

    const method = order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Pickup';
    const awaitingPatientPaymentAfterRx =
      order.paymentStatus === 'pending_prescription_review' &&
      Boolean(order.prescriptionVerified) &&
      order.status !== 'cancelled' &&
      order.status !== 'rejected';

    const payment = awaitingPatientPaymentAfterRx
      ? 'Awaiting patient payment'
      : order.paymentStatus === 'pending_prescription_review' && !order.prescriptionVerified
        ? 'Awaiting Rx verification'
        : order.paymentMethod === 'cod' || order.paymentStatus?.includes('cod')
          ? 'Pending (Cash)'
          : order.paymentStatus === 'success'
            ? 'Paid (Chapa)'
            : 'Pending (Chapa)';

    const baseStatus = statusMap[order.status] || 'new';
    const awaitingPatient =
      order.status === 'dispatched' &&
      method === 'Home Delivery' &&
      order.deliveryAgentId &&
      order.driverHandoffAt;

    return {
      id: order.ref || order._id,
      backendId: order._id,
      patient: order.deliveryAddress?.recipientName || 'Patient',
      items: (order.items || []).map((item: any) => item.medicationName).join(', '),
      itemsAm: (order.items || []).map((item: any) => item.medicationName).join(', '),
      total: order.totalAmount || 0,
      method,
      time: order.createdAt ? new Date(order.createdAt).toLocaleString() : '',
      payment,
      status: awaitingPatient ? 'awaiting_patient' : baseStatus,
      hasPrescription: Boolean(order.prescriptionUploadId),
      driverHandoffAt: order.driverHandoffAt ? String(order.driverHandoffAt) : null,
      deliveryAgentId: order.deliveryAgentId ? String(order.deliveryAgentId) : null,
      prescriptionUploadMongoId: order.prescriptionUploadId ? String(order.prescriptionUploadId) : null,
      prescriptionVerified: Boolean(order.prescriptionVerified),
      paymentStatus: order.paymentStatus,
      needsRxReview: Boolean(
        order.prescriptionUploadId &&
          !order.prescriptionVerified &&
          order.paymentStatus === 'pending_prescription_review' &&
          order.status !== 'cancelled' &&
          order.status !== 'rejected'
      ),
      awaitingPatientPaymentAfterRx,
      patientId: order.patientId != null ? String(order.patientId) : '',
      deliveryAddress: order.deliveryAddress,
      tripStartedAt: order.tripStartedAt ? String(order.tripStartedAt) : null
    };
  };

  useEffect(() => {
    void getMyPharmacy()
      .then(setPharmacyProfile)
      .catch(() => setPharmacyProfile(null));
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await apiGet<any[]>('/pharmacy/me/orders');
        const mapped = (response.data || []).map(mapOrder);
        setOrders(mapped);
      } catch (error) {
        console.error(error);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    if (!assignDeliveryModalOrder) {
      return;
    }
    let cancelled = false;
    setSelectedAgent(null);
    setAgentsLoading(true);
    setAgentsError(null);
    (async () => {
      try {
        const agents = await getMyDeliveryAgents();
        if (!cancelled) setDeliveryAgents(agents);
      } catch (e) {
        if (!cancelled) {
          setAgentsError(e instanceof Error ? e.message : 'Failed to load drivers');
          setDeliveryAgents([]);
        }
      } finally {
        if (!cancelled) setAgentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assignDeliveryModalOrder]);

  function mergeConversationMessages(prev: ConversationMessage[], incoming: ConversationMessage[]) {
    if (!incoming.length) return prev;
    const map = new Map(prev.map((m) => [m._id, m]));
    for (const m of incoming) map.set(m._id, m);
    return [...map.values()].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }

  useEffect(() => {
    orderChatMessagesRef.current = orderChatMessages;
  }, [orderChatMessages]);

  useEffect(() => {
    orderChatConvIdRef.current = orderChatConversationId;
  }, [orderChatConversationId]);

  useEffect(() => {
    if (!chatModalOrder) {
      setOrderChatConversationId(null);
      setOrderChatMessages([]);
      orderChatConvIdRef.current = null;
      orderChatMessagesRef.current = [];
      setOrderChatLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      const orderRow = orders.find((o) => o.id === chatModalOrder);
      if (!orderRow?.patientId) {
        showToast('Cannot chat: missing patient reference on this order');
        setChatModalOrder(null);
        return;
      }

      setOrderChatLoading(true);
      setOrderChatMessages([]);
      setOrderChatConversationId(null);

      try {
        const conv = await ensureConversation({
          participantId: orderRow.patientId,
          orderId: orderRow.backendId,
        });
        if (cancelled) return;
        const cid = String(conv._id);
        setOrderChatConversationId(cid);
        orderChatConvIdRef.current = cid;

        await markConversationRead(cid).catch(() => {});

        const { messages: pageMessages } = await getConversationMessages(cid, { page: 1 });
        if (cancelled) return;
        const chronological = [...pageMessages].reverse();
        setOrderChatMessages(chronological);
      } catch (e) {
        if (!cancelled) {
          showToast(e instanceof Error ? e.message : 'Could not open chat');
        }
      } finally {
        if (!cancelled) setOrderChatLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
    // Intentionally only when opening/closing chat; avoid re-bootstrap on orders list refresh.
  }, [chatModalOrder]);

  useEffect(() => {
    if (!chatModalOrder || !orderChatConversationId) return;

    const POLL_MS = 8000;

    const poll = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      const cid = orderChatConvIdRef.current;
      if (!cid) return;
      try {
        const list = orderChatMessagesRef.current;
        if (list.length === 0) {
          const { messages } = await getConversationMessages(cid, { page: 1 });
          if (messages.length) {
            setOrderChatMessages([...messages].reverse());
          }
          return;
        }
        let latest = list[0];
        for (let i = 1; i < list.length; i++) {
          if (new Date(list[i].sentAt).getTime() > new Date(latest.sentAt).getTime()) latest = list[i];
        }
        const { messages: inc } = await getConversationMessages(cid, { since: latest.sentAt });
        if (inc.length) {
          setOrderChatMessages((prev) => mergeConversationMessages(prev, inc));
        }
      } catch {
        /* ignore transient poll failures */
      }
    };

    const interval = setInterval(poll, POLL_MS);
    poll();
    return () => clearInterval(interval);
  }, [chatModalOrder, orderChatConversationId]);

  useEffect(() => {
    chatEndAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [orderChatMessages, orderChatLoading]);

  const handleSendOrderChat = async () => {
    const trimmed = chatMessage.trim();
    if (!orderChatConversationId || !trimmed || orderChatSending) return;

    setOrderChatSending(true);
    try {
      const sent = await sendConversationMessage(orderChatConversationId, trimmed);
      setChatMessage('');
      setOrderChatMessages((prev) => mergeConversationMessages(prev, [sent]));
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not send message');
    } finally {
      setOrderChatSending(false);
    }
  };

  const applyStatusChange = async (
    order: OrderEntry,
    nextStatus: string,
    localStatus: string,
    extraBody?: Record<string, unknown>,
  ) => {
    try {
      await apiPatch(`/orders/${order.backendId}/status`, { status: nextStatus, ...(extraBody || {}) });
      await reloadOrders();
      return true;
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Could not update order');
      return false;
    }
  };

  const reloadOrders = async () => {
    try {
      const response = await apiGet<any[]>('/pharmacy/me/orders');
      const mapped = (response.data || []).map(mapOrder);
      setOrders(mapped);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async () => {
    if (!acceptModalOrder) return;
    const order = orders.find((o) => o.id === acceptModalOrder);
    if (!order) return;

    setIsAccepting(true);
    await applyStatusChange(order, 'confirmed', 'accepted');
    setAcceptModalOrder(null);
    setIsAccepting(false);
    showToast(`Order ${acceptModalOrder} accepted successfully.`);
  };

  const handleReject = async () => {
    if (!rejectModalOrder || rejectReason.length < 10) return;
    const order = orders.find((o) => o.id === rejectModalOrder);
    if (!order) return;

    setIsRejecting(true);
    await applyStatusChange(order, 'rejected', 'rejected');
    setRejectModalOrder(null);
    setIsRejecting(false);
    if (order.payment.includes('Chapa')) {
      showToast(`Order ${rejectModalOrder} has been rejected. A refund of ETB ${order.total} has been initiated.`);
    } else {
      showToast(`Order ${rejectModalOrder} has been rejected.`);
    }
  };

  const triggerMarkReady = (id: string) => {
    setMarkReadyModalOrder(id);
  };

  const confirmMarkReady = async () => {
    if (!markReadyModalOrder) return;
    const order = orders.find((o) => o.id === markReadyModalOrder);
    if (!order) return;

    await applyStatusChange(order, 'preparing', 'preparing');

    showToast(`Order ${markReadyModalOrder} marked as ready.`);
    setMarkReadyModalOrder(null);
  };

  const attemptAssignDelivery = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order?.payment.includes('Cash')) {
      setCodWarningModalOrder(id);
    } else {
      setAssignDeliveryModalOrder(id);
    }
  };

  const handleAssignDelivery = async () => {
    if (!assignDeliveryModalOrder || !selectedAgent) return;
    const agent = deliveryAgents.find((a) => a.id === selectedAgent);
    const order = orders.find((o) => o.id === assignDeliveryModalOrder);
    if (!order) return;

    const orderRef = assignDeliveryModalOrder;
    const label =
      agent?.username?.trim() || agent?.phone?.trim() || agent?.email?.trim() || selectedAgent;

    setAssignSubmitting(true);
    const ok = await applyStatusChange(order, 'dispatched', 'out_for_delivery', {
      deliveryAgentId: selectedAgent,
    });
    setAssignSubmitting(false);
    if (!ok) return;

    setAssignDeliveryModalOrder(null);
    setSelectedAgent(null);
    await reloadOrders();
    showToast(`Delivery assigned to ${label} for Order ${orderRef}.`);
  };

  const handleTrackDelivery = (id: string) => {
    setTrackModalOrder(id);
  };
const t = TRANSLATIONS[language];

  // Helper translations for dynamic row data
  const translateMethod = (method: string) => {
    if (method === 'Home Delivery') return t.homeDelivery;
    if (method === 'Pickup') return t.pickup;
    return method;
  };

  const translatePayment = (pmt: string) => {
    if (pmt === 'Paid (Chapa)') return t.paidChapa;
    if (pmt === 'Pending (Cash)') return t.pendingCash;
    if (pmt === 'Awaiting Rx verification') return t.awaitingRxVerification;
    if (pmt === 'Awaiting patient payment') return t.awaitingPatientPayment;
    return pmt;
  };

  const translateStatus = (st: string) => {
    if (st === 'new') return t.statusNew;
    if (st === 'preparing') return t.statusPreparing;
    if (st === 'accepted') return t.statusAccepted;
    if (st === 'out_for_delivery') return t.statusOutForDelivery;
    if (st === 'awaiting_patient') return t.awaitingPatient;
    if (st === 'ready_for_pickup') return 'READY FOR PICKUP';
    if (st === 'rejected') return 'REJECTED';
    return st.replace('_', ' ').toUpperCase();
  };

  const filteredOrders = orders.filter(order => {
    // text search
    const query = searchQuery.toLowerCase();
    const patientMatch = order.patient.toLowerCase().includes(query);
    const idMatch = order.id.toLowerCase().includes(query);
    const matchesSearch = patientMatch || idMatch || query === '';

    // delivery filter
    const matchesDelivery = deliveryFilter === 'All' || order.method === deliveryFilter;

    // tab filter
    let matchesTab = false;
    if (activeTab === 0) matchesTab = true; // All Orders
    else if (activeTab === 1) matchesTab = order.status === 'new';
    else if (activeTab === 2) matchesTab = order.status === 'accepted';
    else if (activeTab === 3) matchesTab = order.status === 'preparing';
    else if (activeTab === 4) matchesTab = order.status === 'out_for_delivery' || order.status === 'awaiting_patient';
    else if (activeTab === 5) matchesTab = order.status === 'delivered';
    else if (activeTab === 6) matchesTab = Boolean(order.needsRxReview);

    return matchesSearch && matchesDelivery && matchesTab;
  });

  const activeOrderForAccept = orders.find(o => o.id === acceptModalOrder);
  const activeOrderForReject = orders.find(o => o.id === rejectModalOrder);
  const activeOrderForMarkReady = orders.find(o => o.id === markReadyModalOrder);
  const activeOrderForAssign = orders.find(o => o.id === assignDeliveryModalOrder);
  const activeOrderForCodWarning = orders.find(o => o.id === codWarningModalOrder);
  const activeOrderForTrack = orders.find(o => o.id === trackModalOrder);
  const activeOrderForChat = orders.find(o => o.id === chatModalOrder);
  const activeOrderForRxReview = orders.find((o) => o.id === rxReviewModalOrder);
  const rxReviewQueueCount = orders.filter((o) => o.needsRxReview).length;

  useEffect(() => {
    const uploadId = activeOrderForRxReview?.prescriptionUploadMongoId;
    if (!rxReviewModalOrder || !uploadId) {
      setRxModalFile(null);
      setRxModalFileLoading(false);
      return;
    }

    let cancelled = false;
    setRxModalFile(null);
    setRxModalFileLoading(true);

    void (async () => {
      try {
        const doc = await getPrescriptionUpload(uploadId);
        if (!cancelled) {
          setRxModalFile({ url: doc.fileUrl, label: fileLabelFromUrl(doc.fileUrl) });
        }
      } catch {
        if (!cancelled) {
          setRxModalFile(null);
        }
      } finally {
        if (!cancelled) {
          setRxModalFileLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rxReviewModalOrder, activeOrderForRxReview?.prescriptionUploadMongoId]);

  const handleVerifyRx = async () => {
    const entry = activeOrderForRxReview;
    if (!entry?.prescriptionUploadMongoId) return;
    setRxActionLoading(true);
    try {
      await verifyPrescriptionUpload(entry.prescriptionUploadMongoId);
      await reloadOrders();
      setRxReviewModalOrder(null);
      setRxRejectNote('');
      showToast('Prescription verified');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Verify failed');
    } finally {
      setRxActionLoading(false);
    }
  };

  const handleRejectRx = async () => {
    const entry = activeOrderForRxReview;
    if (!entry?.prescriptionUploadMongoId) return;
    setRxActionLoading(true);
    try {
      await rejectPrescriptionUpload(entry.prescriptionUploadMongoId, rxRejectNote.trim() || undefined);
      await reloadOrders();
      setRxReviewModalOrder(null);
      setRxRejectNote('');
      showToast('Prescription rejected — order cancelled');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Reject failed');
    } finally {
      setRxActionLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.orderManagement}</h1>
          <p className="text-gray-500 font-medium">{t.orderSubtitle}</p>
        </div>
</div>

      {/* Urgent Alert Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-red-800">{t.actionRequired}</h3>
          <p className="text-sm text-red-700 mt-0.5">{t.urgentWarning}</p>
        </div>
        <button className="ml-auto text-sm font-bold text-red-700 hover:text-red-900 underline">{t.viewOrders}</button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
        {t.tabs.map((tab, idx) => {
          const count =
            idx === 1 ? orders.filter((o) => o.status === 'new').length : idx === 6 ? rxReviewQueueCount : 0;
          return (
            <button 
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === idx ? 'border-brand-600 text-brand-900' : 'border-transparent text-gray-500 hover:text-brand-700'
              }`}
            >
              {tab} {(idx === 1 || idx === 6) && count > 0 ? `(${count})` : ''}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder} 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="bg-white border border-gray-200 text-brand-950 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">{t.allDeliveryMethods}</option>
            <option value="Home Delivery">{t.homeDelivery}</option>
            <option value="Pickup">{t.pickup}</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-left overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider font-bold">
              <th className="p-4">{t.colOrderId || 'ORDER ID'}</th>
              <th className="p-4">{t.colDrug || 'DRUG'}</th>
              <th className="p-4">{t.colStatus || 'STATUS'}</th>
              <th className="p-4 text-right">{t.colAction || 'ACTION'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map(order => (
               <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                 <td className="p-4 align-top">
                    <div className="font-bold text-brand-950 mb-1 flex items-center gap-2">
                       {order.id}
                       {order.hasPrescription && <span title="Prescription attached"><ClipboardList className="w-4 h-4 text-brand-600" /></span>}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">{order.patient}</div>
                 </td>
                 <td className="p-4 align-top">
                    <div className="text-sm font-bold text-gray-900 line-clamp-2 max-w-xs">{language === 'am' ? order.itemsAm : order.items}</div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {translateMethod(order.method)}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" /> {order.time}</span>
                    </div>
                 </td>
                 <td className="p-4 align-top">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-block ${
                      order.status === 'new' ? 'bg-blue-50 text-blue-700' :
                      order.status === 'preparing' ? 'bg-amber-50 text-amber-700' :
                      order.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'awaiting_patient' ? 'bg-slate-100 text-slate-800' :
                      'bg-purple-50 text-purple-700'
                    }`}>
                      {translateStatus(order.status)}
                    </span>
                    <div className="mt-2 text-xs font-medium text-gray-700">
                       {order.total} ETB • {translatePayment(order.payment)}
                    </div>
                    {order.awaitingPatientPaymentAfterRx && (
                      <div className="mt-1.5">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500">
                          {t.awaitingPatientPayment}
                        </span>
                      </div>
                    )}
                 </td>
                 <td className="p-4 align-top text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => setChatModalOrder(order.id)}
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" 
                        title="Chat with Patient"
                      >
                         <MessageSquare className="w-5 h-5" />
                      </button>
                      
                      {order.status === 'new' && order.needsRxReview && (
                        <button
                          type="button"
                          onClick={() => {
                            setRxRejectNote('');
                            setRxReviewModalOrder(order.id);
                          }}
                          className="px-4 py-2 text-xs font-bold text-violet-800 bg-violet-100 hover:bg-violet-200 rounded-xl transition-colors"
                        >
                          Review Rx
                        </button>
                      )}
                      {order.status === 'new' && !order.needsRxReview && !order.awaitingPatientPaymentAfterRx && (
                        <>
                          <button onClick={() => setRejectModalOrder(order.id)} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">{t.reject}</button>
                          <button onClick={() => setAcceptModalOrder(order.id)} className="px-4 py-2 text-xs font-bold text-white bg-brand-900 hover:bg-brand-800 rounded-xl transition-colors shadow-sm">{t.accept}</button>
                        </>
                      )}
                      {order.status === 'accepted' && (
                        <button onClick={() => triggerMarkReady(order.id)} className="px-4 py-2 text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors">{t.markReady}</button>
                      )}
                      {order.status === 'preparing' && (
                        order.method === 'Pickup' ? (
                          <button
                            onClick={async () => {
                              await applyStatusChange(order, 'delivered', 'delivered');
                            }}
                            className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors whitespace-nowrap"
                          >
                            Mark Collected
                          </button>
                        ) : (
                          <button onClick={() => attemptAssignDelivery(order.id)} className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors whitespace-nowrap">{t.assignDelivery}</button>
                        )
                      )}
                      {(order.status === 'out_for_delivery' || order.status === 'awaiting_patient') && (
                        <button onClick={() => handleTrackDelivery(order.id)} className="px-4 py-2 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors">{t.track}</button>
                      )}
                      {order.status === 'ready_for_pickup' && (
                        <button
                          onClick={async () => {
                            await applyStatusChange(order, 'delivered', 'delivered');
                          }}
                          className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                          Complete Pickup
                        </button>
                      )}
                    </div>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-gray-500 font-medium">No orders found matching your criteria.</div>
        )}
      </div>

      {/* Prescription review modal */}
      {rxReviewModalOrder && activeOrderForRxReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-6 h-6 text-brand-600" />
                Prescription review
              </h3>
              <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                <div className="font-mono text-xs text-gray-500 mb-1">{activeOrderForRxReview.id}</div>
                <div className="font-bold text-gray-900">{activeOrderForRxReview.patient}</div>
                <p className="text-gray-600 mt-1 line-clamp-2">
                  {language === 'am' ? activeOrderForRxReview.itemsAm : activeOrderForRxReview.items}
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-3">{t.rxModalIntro}</p>
              <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                <div className="font-bold text-gray-700">{t.attachedRxFile}</div>
                {rxModalFileLoading && <p className="mt-1 text-gray-500">Loading…</p>}
                {!rxModalFileLoading && rxModalFile && (
                  <a
                    href={rxModalFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block break-all text-brand-700 underline underline-offset-2 hover:text-brand-900"
                  >
                    {rxModalFile.label}
                  </a>
                )}
                {!rxModalFileLoading && !rxModalFile && activeOrderForRxReview.prescriptionUploadMongoId && (
                  <p className="mt-1 text-xs text-gray-500">Could not load file.</p>
                )}
              </div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Rejection note (optional)</label>
              <textarea
                value={rxRejectNote}
                onChange={(e) => setRxRejectNote(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none mb-4 resize-none text-sm"
                placeholder="Reason if rejecting…"
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={rxActionLoading}
                  onClick={() => void handleRejectRx()}
                  className="sm:flex-initial flex-1 min-w-[120px] px-4 py-2.5 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  {t.reject}
                </button>
                <button
                  type="button"
                  disabled={rxActionLoading}
                  onClick={() => void handleVerifyRx()}
                  className="sm:flex-initial flex-1 min-w-[120px] px-4 py-2.5 text-sm font-bold text-white bg-brand-900 hover:bg-brand-800 rounded-xl transition-colors disabled:opacity-50"
                >
                  {rxActionLoading ? '…' : t.accept}
                </button>
              </div>
            </div>
            {!rxActionLoading && (
              <button
                type="button"
                onClick={() => setRxReviewModalOrder(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Accept Modal */}
      {acceptModalOrder && activeOrderForAccept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Accept this order?</h3>
              
              <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="font-mono text-xs text-gray-500 mb-1">{activeOrderForAccept.id}</div>
                <div className="font-bold text-gray-900 flex justify-between">
                  <span>{activeOrderForAccept.patient}</span>
                  <span className="text-brand-600">{activeOrderForAccept.total} ETB</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{language === 'am' ? activeOrderForAccept.itemsAm : activeOrderForAccept.items}</div>
                <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 inline-block px-2 py-1 rounded">
                  {activeOrderForAccept.payment}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">Set estimated preparation time so the patient knows when to expect it.</p>
              
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                Estimated Preparation Time <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-6">
                 <input 
                   type="number" 
                   value={preparationTime} 
                   onChange={e => setPreparationTime(e.target.value)}
                   className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none pr-16"
                 />
                 <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">minutes</span>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={() => setAcceptModalOrder(null)} disabled={isAccepting} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={handleAccept} disabled={isAccepting} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50">
                  {isAccepting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Accept'}
                </button>
              </div>
            </div>
            {!isAccepting && (
              <button onClick={() => setAcceptModalOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOrder && activeOrderForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Reject this order?</h3>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg flex items-start gap-2 mb-4">
                 <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                 <p>The patient will be notified of this rejection and shown alternative pharmacies.</p>
              </div>
              
              <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="font-mono text-xs text-gray-500 mb-1">{activeOrderForReject.id}</div>
                <div className="font-bold text-gray-900 flex justify-between">
                  <span>{activeOrderForReject.patient}</span>
                  <span className="text-brand-600">{activeOrderForReject.total} ETB</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">{language === 'am' ? activeOrderForReject.itemsAm : activeOrderForReject.items}</div>
                <div className="mt-2 text-xs font-bold text-purple-700 bg-purple-50 inline-block px-2 py-1 rounded">
                  {activeOrderForReject.payment}
                </div>
                {activeOrderForReject.payment.includes('Paid') && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    This order has already been paid. Rejecting it will trigger an automatic refund.
                  </div>
                )}
              </div>
              
              <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea 
                value={rejectReason} 
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Type reason here..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none mb-1 resize-none"
              />
              <p className="text-xs text-gray-500 mb-4">e.g., Medication out of stock, Prescription unclear, Outside delivery area</p>
              
              <label className="flex items-start gap-2 mb-6 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={suggestAlternatives}
                  onChange={(e) => setSuggestAlternatives(e.target.checked)}
                  className="mt-1 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700 font-medium">Suggest alternative pharmacies to patient</span>
              </label>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={() => setRejectModalOrder(null)} disabled={isRejecting} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors disabled:opacity-50">Cancel</button>
                <button 
                  onClick={handleReject} 
                  disabled={isRejecting || rejectReason.length < 10} 
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:bg-red-300"
                >
                  {isRejecting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Reject'}
                </button>
              </div>
            </div>
            {!isRejecting && (
              <button onClick={() => setRejectModalOrder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1">
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mark Ready Modal */}
      {markReadyModalOrder && activeOrderForMarkReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mark order as ready?</h3>
              
              <div className="mb-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="font-mono text-xs text-gray-500 mb-1">{activeOrderForMarkReady.id}</div>
                <div className="font-bold text-gray-900 mb-2">{activeOrderForMarkReady.patient}</div>
                <div className="text-sm text-gray-600 mb-3">{language === 'am' ? activeOrderForMarkReady.itemsAm : activeOrderForMarkReady.items}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 bg-gray-200 px-2 py-1 rounded inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {activeOrderForMarkReady.method}
                  </span>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 inline-block">
                    {activeOrderForMarkReady.payment}
                  </span>
                </div>
              </div>

              {activeOrderForMarkReady.method === 'Home Delivery' ? (
                <p className="text-sm text-gray-600 mb-4 font-medium">This will notify the patient that their order is ready and being prepared for dispatch. Please assign a delivery agent next.</p>
              ) : (
                <p className="text-sm text-gray-600 mb-4 font-medium">This will notify the patient that their order is ready for pickup at your pharmacy.</p>
              )}

              {activeOrderForMarkReady.payment.includes('Cash') && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3 rounded-lg flex items-start gap-2 mb-4 font-medium">
                   <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                   <p>This is a Cash on Delivery order. Remind your delivery agent to collect ETB {activeOrderForMarkReady.total} in cash upon delivery.</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4">
                <button onClick={() => setMarkReadyModalOrder(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors">Cancel</button>
                <button onClick={confirmMarkReady} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COD Warning Modal for Assign Delivery */}
      {codWarningModalOrder && activeOrderForCodWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cash on Delivery</h3>
              <p className="text-sm text-gray-600 mb-2 font-medium">This is a Cash on Delivery order.</p>
              <p className="text-sm text-gray-600 mb-4">Payment of <strong>ETB {activeOrderForCodWarning.total}</strong> must be collected by the delivery agent upon delivery. Make sure your delivery agent is aware they must collect cash before handing over the medications.</p>
              
              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setCodWarningModalOrder(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors">Cancel</button>
                <button 
                  onClick={() => {
                    setAssignDeliveryModalOrder(codWarningModalOrder);
                    setCodWarningModalOrder(null);
                  }} 
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Modal */}
      {assignDeliveryModalOrder && activeOrderForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Assign Delivery</h3>
                <p className="text-sm text-gray-500 font-medium">Order {activeOrderForAssign.id} • {activeOrderForAssign.patient}</p>
              </div>
              <button
                onClick={() => {
                  setAssignDeliveryModalOrder(null);
                  setSelectedAgent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Delivery Agent</h4>

                  {agentsLoading && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center text-sm text-gray-500">
                      Loading drivers…
                    </div>
                  )}
                  {agentsError && !agentsLoading && (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-sm text-red-700">{agentsError}</div>
                  )}
                  {!agentsLoading && !agentsError && deliveryAgents.length === 0 && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                      <p className="text-sm text-gray-500 mb-3">
                        No delivery drivers are linked to your pharmacy yet. Drivers must complete registration and select
                        your pharmacy as their employer.
                      </p>
                      <Link href="/pharmacy/deliveries" className="text-sm font-bold text-brand-600 hover:text-brand-800">
                        Go to Deliveries
                      </Link>
                    </div>
                  )}
                  {!agentsLoading && !agentsError && deliveryAgents.length > 0 && (
                    <div className="space-y-3">
                      {deliveryAgents.map((agent) => {
                        const displayName =
                          agent.username?.trim() || agent.phone?.trim() || agent.email?.trim() || agent.id;
                        const sub =
                          [agent.phone, agent.email].filter(Boolean).join(' · ') ||
                          (agent.vehicleType ? `Vehicle: ${agent.vehicleType}` : '');
                        return (
                          <div
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer bg-white ${
                              selectedAgent === agent.id
                                ? 'border-brand-500 shadow-sm bg-brand-50/10'
                                : 'border-gray-100 hover:border-gray-300'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0 text-sm">
                              {displayName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <span className="font-bold text-gray-900 truncate">{displayName}</span>
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                    agent.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                                  }`}
                                >
                                  {agent.isOnline ? 'Online' : 'Offline'}
                                </span>
                              </div>
                              {sub && <div className="text-xs text-gray-500 font-medium truncate">{sub}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Delivery Details</h4>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                    <div>
                      <div className="text-xs text-gray-500 font-medium mb-1">Destination</div>
                      <div className="text-sm font-bold text-gray-900 flex items-start gap-2">
                         <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                         {formatDeliveryAddressText(activeOrderForAssign.deliveryAddress)}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-gray-500 font-medium mb-1">Payment to Collect</div>
                      <div className="text-sm font-bold text-gray-900">
                         {activeOrderForAssign.payment.includes('Cash') ? `ETB ${activeOrderForAssign.total}` : 'Already paid (Chapa)'}
                      </div>
                    </div>

                                        <OrderRouteMapPanel
                      orderBackendId={activeOrderForAssign.backendId}
                      pharmacy={pharmacyProfile}
                      deliveryAddress={activeOrderForAssign.deliveryAddress}
                      className="h-40 w-full rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => {
                  setAssignDeliveryModalOrder(null);
                  setSelectedAgent(null);
                }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignDelivery}
                disabled={!selectedAgent || assignSubmitting || agentsLoading || deliveryAgents.length === 0}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignSubmitting ? 'Assigning…' : 'Assign Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track Delivery Panel */}
      {trackModalOrder && activeOrderForTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="flex-1 border-r border-gray-100 flex flex-col relative h-[50vh] md:h-auto min-h-[280px]">
               <OrderRouteMapPanel
                 orderBackendId={activeOrderForTrack.backendId}
                 pharmacy={pharmacyProfile}
                 deliveryAddress={activeOrderForTrack.deliveryAddress}
                 pollDriver={Boolean(activeOrderForTrack.tripStartedAt && !activeOrderForTrack.driverHandoffAt)}
                 className="absolute inset-0 h-full w-full rounded-none"
               />
               <button onClick={() => setTrackModalOrder(null)} className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-xl text-gray-500 hover:text-gray-900 md:hidden z-10">
                 <XCircle className="w-6 h-6" />
               </button>
            </div>
            
            <div className="w-full md:w-[400px] flex flex-col h-full bg-white max-h-[60vh] md:max-h-full overflow-y-auto">
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10 flex justify-between items-start">
                 <div>
                   <h3 className="text-xl font-bold text-gray-900 mb-1">Live Tracking</h3>
                   <div className="text-sm font-mono text-gray-500">{activeOrderForTrack.id}</div>
                 </div>
                 <button onClick={() => setTrackModalOrder(null)} className="text-gray-400 hover:text-gray-600 hidden md:block">
                   <XCircle className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-6 space-y-6 flex-1">
                 {/* Identity Bar */}
                 <div className="bg-brand-50 border border-brand-100 p-4 rounded-xl">
                   <div className="font-bold text-gray-900 mb-1">{activeOrderForTrack.patient}</div>
                   <div className="text-sm text-gray-600 line-clamp-1 mb-2">{language === 'am' ? activeOrderForTrack.itemsAm : activeOrderForTrack.items}</div>
                   <div className="flex justify-between items-center text-sm font-medium">
                     <span className="text-gray-500">Total: ETB {activeOrderForTrack.total}</span>
                     <span className={activeOrderForTrack.payment.includes('Cash') ? 'text-amber-600' : 'text-emerald-600'}>
                       {activeOrderForTrack.payment}
                     </span>
                   </div>
                 </div>

                 {/* Delivery Agent Info */}
                 <div className="border border-gray-200 p-4 rounded-xl flex items-center gap-4">
                   <img src="https://i.pravatar.cc/150?u=amanuel" alt="Agent" className="w-12 h-12 rounded-full object-cover bg-gray-100" />
                   <div className="flex-1">
                     <div className="font-bold text-gray-900">Amanuel Tesfaye</div>
                     <div className="text-xs text-gray-500">Delivery Agent • +251 911 234 567</div>
                   </div>
                   <a href="tel:+251911234567" className="w-10 h-10 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-full flex items-center justify-center transition-colors">
                     📞
                   </a>
                 </div>

                 {activeOrderForTrack.payment.includes('Cash') && (
                   <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 text-sm font-medium flex items-start gap-2 rounded-xl">
                     <AlertTriangle className="w-5 h-5 shrink-0" />
                     <div>
                       <div className="font-bold mb-1">Cash Collection Status: Pending</div>
                       <div className="opacity-90">Wait for agent to confirm collection of ETB {activeOrderForTrack.total}.</div>
                     </div>
                   </div>
                 )}

                 {/* Timeline */}
                 <div>
                   <h4 className="font-bold text-gray-900 mb-4 px-1">Delivery Timeline</h4>
                   <div className="space-y-4 px-2">
                     {[
                       { title: 'Order Placed', time: '14:20 PM', done: true },
                       { title: 'Order Accepted', time: '14:25 PM', done: true },
                       { title: 'Preparing', time: '14:35 PM', done: true },
                       { title: 'Agent Assigned', time: '14:40 PM', done: true, sub: 'Amanuel Tesfaye' },
                       { title: 'Out for Delivery', time: '14:45 PM', done: true },
                       { title: 'Delivered', time: 'Pending', done: false }
                     ].map((step, idx, arr) => (
                       <div key={idx} className="flex gap-4 relative">
                         {idx !== arr.length - 1 && (
                           <div className={`absolute top-6 left-[11px] w-0.5 h-full -translate-x-[1px] ${step.done ? 'bg-brand-500' : 'bg-gray-200'}`} />
                         )}
                         <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center bg-white z-10 ${step.done ? 'border-brand-500' : 'border-gray-300'}`}>
                           {step.done && <div className="w-2.5 h-2.5 bg-brand-500 rounded-full" />}
                         </div>
                         <div className="flex-1 pb-4">
                           <div className={`text-sm font-bold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</div>
                           <div className={`text-xs ${step.done ? 'text-brand-600 font-medium' : 'text-gray-400'}`}>{step.time}</div>
                           {step.sub && <div className="text-xs text-gray-500 mt-0.5">{step.sub}</div>}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2">
                 <button onClick={() => { setTrackModalOrder(null); setChatModalOrder(activeOrderForTrack.id); }} className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                   <MessageSquare className="w-4 h-4" /> Contact Patient
                 </button>
                 <button className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-colors">
                   Report Delivery Issue
                 </button>
                 <button className="w-full py-2.5 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 text-sm font-bold rounded-xl transition-colors lg:hidden">
                   Mark as Delivered (Override)
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Sub-Panel */}
      {chatModalOrder && activeOrderForChat && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setChatModalOrder(null)}></div>
          <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[400px] bg-white shadow-2xl flex flex-col min-h-0 animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-brand-900 text-white">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white/20 flex flex-col items-center justify-center font-bold text-sm">
                   {activeOrderForChat.patient.charAt(0)}
                 </div>
                 <div>
                   <h3 className="font-bold text-sm">{activeOrderForChat.patient}</h3>
                   <p className="text-xs text-brand-200 font-mono">Order {activeOrderForChat.id}</p>
                 </div>
              </div>
              <button onClick={() => setChatModalOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-3 bg-brand-50 text-xs text-brand-800 font-medium border-b border-brand-100">
              <strong className="block mb-0.5">Order Details:</strong>
              {language === 'am' ? activeOrderForChat.itemsAm : activeOrderForChat.items} • {activeOrderForChat.status.toUpperCase()}
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gray-50/50 min-h-0">
              {orderChatLoading && (
                <div className="text-center text-xs text-gray-500 py-8">Loading messages…</div>
              )}
              {!orderChatLoading && orderChatMessages.length === 0 && (
                <div className="text-center text-xs text-gray-500 py-8">No messages yet. Say hello!</div>
              )}
              {!orderChatLoading &&
                orderChatMessages.map((msg) => {
                  const isSystem = msg.senderRole === 'system' || msg.kind === 'system';
                  if (isSystem) {
                    return (
                      <div key={msg._id} className="flex justify-center w-full shrink-0">
                        <div className="rounded-2xl bg-gray-100 text-gray-600 text-xs px-3 py-2 max-w-[95%] text-center break-words border border-gray-200">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }
                  const mine = msg.senderRole === 'pharmacy';
                  const timeLabel =
                    msg.sentAt != null
                      ? new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';
                  return (
                    <div
                      key={msg._id}
                      className={`p-3 rounded-2xl text-sm shadow-sm max-w-[85%] ${
                        mine
                          ? 'bg-brand-600 text-white rounded-tr-sm self-end'
                          : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm self-start'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1.5 ${mine ? 'text-brand-100' : 'text-gray-400'}`}>{timeLabel}</p>
                    </div>
                  );
                })}
              <div ref={chatEndAnchorRef} className="h-px shrink-0" aria-hidden />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
               <div className="flex items-end gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-brand-500 transition-shadow">
                 <button type="button" className="p-2.5 text-gray-400 hover:text-brand-600 transition-colors shrink-0" aria-hidden>
                   <ClipboardList className="w-5 h-5" />
                 </button>
                 <textarea 
                   rows={1}
                   placeholder="Message the patient..." 
                   className="flex-1 max-h-32 bg-transparent border-none outline-none resize-none py-2.5 text-sm"
                   value={chatMessage}
                   disabled={orderChatLoading || !orderChatConversationId}
                   onChange={e => setChatMessage(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       void handleSendOrderChat();
                     }
                   }}
                 />
                 <button 
                   type="button"
                   disabled={!chatMessage.trim() || orderChatSending || orderChatLoading || !orderChatConversationId}
                   onClick={() => void handleSendOrderChat()}
                   className={`p-2.5 rounded-xl text-white font-bold text-sm transition-colors shrink-0 mb-0.5 mr-0.5 ${
                     chatMessage.trim() && !orderChatSending && orderChatConversationId && !orderChatLoading
                       ? 'bg-brand-600 hover:bg-brand-700'
                       : 'bg-gray-300 pointer-events-none'
                   }`}
                 >
                   {orderChatSending ? '…' : 'Send'}
                 </button>
               </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 inset-x-0 mx-auto w-max z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        </div>
      )}

    </div>
  );
}