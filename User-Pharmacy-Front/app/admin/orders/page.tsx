'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  Search, AlertTriangle, Filter, Globe, ChevronDown, 
  ArrowLeft, User, Phone, MapPin, Store, FileText, 
  CreditCard, Clock, MessageSquare, Flag, RefreshCw, XCircle 
} from 'lucide-react';
import Image from 'next/image';
import { adminApi, type OrdersTodayKpis } from '@/lib/admin-api';

function formatEtbRevenueCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

const TRANSLATIONS = {
  en: {
    platformOrders: 'Platform Orders',
    platformOrdersSub: 'Monitor all orders across the platform and resolve disputes.',
    totalOrdersToday: 'Total Orders Today',
    revenueToday: 'Revenue Today',
    avgFulfillment: 'Avg Fulfillment',
    stuckOrders: 'Stuck Orders (>30m)',
    searchPlaceholder: 'Search by Order ID, Patient, or Pharmacy...',
    filters: 'Filters',
    orderId: 'Order ID',
    patient: 'Patient',
    pharmacy: 'Pharmacy',
    totalETB: 'Total (ETB)',
    status: 'Status',
    time: 'Time',
    actions: 'Actions',
    viewDetails: 'View Details',
    backToOrders: 'Back to Orders',
    orderDetailTitle: 'Order Details',
    identitySection: 'Order Identity & Status',
    patientSection: 'Patient Information',
    pharmacySection: 'Pharmacy Information',
    itemsSection: 'Order Items',
    deliverySection: 'Delivery Information',
    paymentSection: 'Payment Information',
    timelineSection: 'Order Status Timeline',
    notificationsSection: 'Notifications Sent',
    chatSection: 'Linked Chat Conversation',
    complaintsSection: 'Complaints',
    adminActions: 'Admin Actions',
    flagOrder: 'Flag This Order',
    contactPatient: 'Contact Patient',
    contactPharmacy: 'Contact Pharmacy',
    suspendPharmacy: 'Suspend Pharmacy (From this order)',
    issueRefund: 'Issue Refund Instruction',
    markResolved: 'Mark Order as Resolved'
  },
  am: {
    platformOrders: 'የመድረክ ትዕዛዞች',
    platformOrdersSub: 'ሁሉንም ትዕዛዞች ይቆጣጠሩ እና ክርክሮችን ይፍቱ።',
    totalOrdersToday: 'የዛሬ አጠቃላይ ትዕዛዞች',
    revenueToday: 'የዛሬ ገቢ',
    avgFulfillment: 'አማካይ አቅርቦት ጊዜ',
    stuckOrders: 'የተስተጓጎሉ ትዕዛዞች (>30 ደቂቃ)',
    searchPlaceholder: 'በመታወቂያ፣ ታካሚ፣ ወይም ፋርማሲ ይፈልጉ...',
    filters: 'ማጣሪያዎች',
    orderId: 'የትዕዛዝ መታወቂያ',
    patient: 'ታካሚ',
    pharmacy: 'ፋርማሲ',
    totalETB: 'ጠቅላላ (ብር)',
    status: 'ሁኔታ',
    time: 'ጊዜ',
    actions: 'ድርጊቶች',
    viewDetails: 'ዝርዝሮችን ይመልከቱ',
    backToOrders: 'ወደ ትዕዛዞች ተመለስ',
    orderDetailTitle: 'የትዕዛዝ ዝርዝሮች',
    identitySection: 'የትዕዛዝ ማንነት እና ሁኔታ',
    patientSection: 'የታካሚ መረጃ',
    pharmacySection: 'የፋርማሲ መረጃ',
    itemsSection: 'የትዕዛዝ ዕቃዎች',
    deliverySection: 'የማድረስ መረጃ',
    paymentSection: 'የክፍያ መረጃ',
    timelineSection: 'የትዕዛዝ ሁኔታ የጊዜ መስመር',
    notificationsSection: 'የተላኩ ማሳወቂያዎች',
    chatSection: 'የታሰረ ውይይት',
    complaintsSection: 'ቅሬታዎች',
    adminActions: 'የአስተዳዳሪ እርምጃዎች',
    flagOrder: 'ይህን ትዕዛዝ ጠቁም',
    contactPatient: 'ታካሚን ያነጋግሩ',
    contactPharmacy: 'ፋርማሲን ያነጋግሩ',
    suspendPharmacy: 'ፋርማሲን አግድ (ከዚህ ትዕዛዝ)',
    issueRefund: 'የገንዘብ ተመላሽ መመሪያ ይስጡ',
    markResolved: 'ትዕዛዙን እንደተፈታ ምልክት ያድርጉ'
  }
};

const INITIAL_ORDERS = [
  { 
    id: 'ORD-20847', 
    patient: { name: 'Abebe K.', phone: '+251 911 234 567', id: 'USR-892', status: 'Active', orderCount: 4 },
    pharmacy: { name: 'Selam Pharmacy', phone: '+251 922 334 455', address: 'Bole, Addis Ababa', id: 'PH-101', status: 'Verified', rating: 4.8 },
    items: [
      { name: 'Amoxicillin 500mg', nameAm: 'አሞክሲሲሊን 500mg', quantity: 2, unitPrice: 120.00, subtotal: 240.00, requiresPrescription: true, rxImage: 'https://picsum.photos/seed/rx/800/600' },
      { name: 'Ibuprofen 400mg', nameAm: 'አይቡፕሮፌን 400mg', quantity: 1, unitPrice: 45.00, subtotal: 45.00, requiresPrescription: false, rxImage: null }
    ],
    delivery: {
      method: 'Home Delivery',
      address: 'Bole Medhanialem, Block 4, House 12',
      instructions: 'Call when near the roundabout',
      agent: { name: 'Dawit T.', phone: '+251 933 445 566', activeCount: 2 },
      estimatedTime: '45 mins',
      actualTime: null
    },
    payment: { method: 'Chapa (Telebirr)', status: 'Paid', refId: 'CHAP-92837492', timestamp: 'April 7, 2026, 2:15 PM' },
    timeline: [
      { status: 'Placed', timestamp: 'April 7, 2:15 PM', actor: 'Patient', notes: '' },
      { status: 'Reminder Sent', timestamp: 'April 7, 2:45 PM', actor: 'System', notes: 'Triggered because order sat in Placed status for 30 minutes' },
      { status: 'Accepted', timestamp: 'April 7, 2:52 PM', actor: 'Selam Pharmacy', notes: '' },
      { status: 'Preparing', timestamp: 'April 7, 3:00 PM', actor: 'Selam Pharmacy', notes: '' },
    ],
    notifications: [
      { type: 'Order Accepted', recipient: 'Patient', channel: 'Push', timestamp: 'April 7, 2:52 PM', status: 'Delivered successfully' },
      { type: 'Agent Assigned', recipient: 'Pharmacy', channel: 'SMS', timestamp: 'April 7, 3:05 PM', status: 'Delivered successfully' }
    ],
    chat: { count: 3, firstMessage: 'April 7, 2:35 PM', lastMessage: 'April 7, 2:40 PM' },
    complaints: [],
    
    // Summary Fields
    total: 335.00, 
    subtotal: 285.00, 
    deliveryFee: 50.00,
    status: 'Preparing', 
    time: '14 mins ago', 
    placedAt: 'April 7, 2:15 PM',
    stuck: false,
    flag: null
  },
  { 
    id: 'ORD-20848', 
    patient: { name: 'Sara M.', phone: '+251 933 112 233', id: 'USR-893', status: 'Active', orderCount: 1 },
    pharmacy: { name: 'Kidus Pharmacy', phone: '+251 944 556 677', address: 'Piasa, Addis Ababa', id: 'PH-102', status: 'Verified', rating: 4.2 },
    items: [
      { name: 'Cetirizine 10mg', nameAm: 'ሴቲሪዚን 10mg', quantity: 1, unitPrice: 45.00, subtotal: 45.00, requiresPrescription: false, rxImage: null }
    ],
    delivery: {
      method: 'Pickup',
      address: null,
      instructions: null,
      agent: null,
      estimatedTime: null,
      actualTime: null
    },
    payment: { method: 'Cash on Delivery', status: 'Pending', refId: null, timestamp: null },
    timeline: [
      { status: 'Placed', timestamp: 'April 7, 1:30 PM', actor: 'Patient', notes: '' }
    ],
    notifications: [
      { type: 'New Order', recipient: 'Pharmacy', channel: 'Push', timestamp: 'April 7, 1:30 PM', status: 'Delivered successfully' }
    ],
    chat: { count: 0, firstMessage: null, lastMessage: null },
    complaints: [
      { id: 'CMP-002', reporter: 'Pharmacy', type: 'Delayed Payment', status: 'Open', date: '10 mins ago' }
    ],
    
    // Summary Fields
    total: 45.00, 
    subtotal: 45.00, 
    deliveryFee: 0.00,
    status: 'Placed', 
    time: '45 mins ago', 
    placedAt: 'April 7, 1:30 PM',
    stuck: true,
    flag: 'Unusually long delay in acceptance'
  },
];

type AdminOrderRow = (typeof INITIAL_ORDERS)[number];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const { language } = useLanguage();
const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rxImageModal, setRxImageModal] = useState<string | null>(null);
  const [ordersTodayKpis, setOrdersTodayKpis] = useState<OrdersTodayKpis | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState<string | null>(null);
const t = TRANSLATIONS[language];

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await adminApi.getOrders();
        const mapped = data.map((order: any) => {
          const placedAt = order.createdAt ? new Date(order.createdAt) : null;
          const deliveryAddress = order.deliveryAddress || {};
          const deliveryMethod = order.deliveryMethod === 'delivery' ? 'Home Delivery' : 'Pickup';
          const timeline = (order.statusHistory || []).map((entry: any) => ({
            status: entry.status,
            timestamp: entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '-',
            actor: entry.actorId ? 'User' : 'System',
            notes: entry.note || '',
          }));

          return {
            id: order.ref || order._id,
            patient: {
              name: deliveryAddress.recipientName || 'Unknown',
              phone: deliveryAddress.phone || '-',
              id: order.patientId || '-',
              status: 'Active',
              orderCount: 0,
            },
            pharmacy: {
              name: order.pharmacyId || 'Unknown Pharmacy',
              phone: '-',
              address: order.deliveryAddress?.city || '-',
              id: order.pharmacyId || '-',
              status: 'Verified',
              rating: 0,
            },
            items: (order.items || []).map((item: any) => ({
              name: item.medicationName,
              nameAm: item.medicationName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              requiresPrescription: item.requiresPrescription,
              rxImage: null,
            })),
            delivery: {
              method: deliveryMethod,
              address: [deliveryAddress.street, deliveryAddress.subCity, deliveryAddress.city].filter(Boolean).join(', '),
              instructions: order.deliveryInstructions || null,
              agent: order.deliveryAgentId
                ? { name: String(order.deliveryAgentId), phone: '-', activeCount: 0 }
                : null,
              estimatedTime: order.estimatedDeliveryAt
                ? new Date(order.estimatedDeliveryAt).toLocaleString()
                : null,
              actualTime: order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : null,
            },
            payment: {
              method: order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Chapa',
              status: order.paymentStatus,
              refId: order.paymentId || null,
              timestamp: placedAt ? placedAt.toLocaleString() : null,
            },
            timeline,
            notifications: [],
            chat: { count: 0, firstMessage: null, lastMessage: null },
            complaints: [],
            total: order.totalAmount,
            subtotal: order.subtotal,
            deliveryFee: order.deliveryFee,
            status: order.status,
            time: placedAt ? `${Math.max(1, Math.floor((Date.now() - placedAt.getTime()) / 60000))} mins ago` : '-',
            placedAt: placedAt ? placedAt.toLocaleString() : '-',
            stuck: false,
            flag: null,
          };
        });
        if (mapped.length) setOrders(mapped as unknown as AdminOrderRow[]);
      } catch (error) {
        console.error('Failed to load orders', error);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminApi.getOrdersTodayKpis();
        if (!cancelled) {
          setOrdersTodayKpis(data);
          setKpisError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setKpisError(e instanceof Error ? e.message : 'Failed to load KPIs');
          setOrdersTodayKpis(null);
        }
      } finally {
        if (!cancelled) setKpisLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Admin Actions
  const handleFlagOrder = () => {
    const reason = prompt("Enter reason to flag this order:");
    if (reason) {
      setOrders((prev: any) => prev.map((o: any) => o.id === selectedOrder.id ? { ...o, flag: reason } : o));
      setSelectedOrder((prev: any) => ({...prev, flag: reason}));
      alert("Order flagged successfully.");
    }
  };

  const handleContactPatient = () => {
    const msg = prompt(`Send message to Patient ${selectedOrder.patient.name}:`, `Re: Order ${selectedOrder.id}`);
    if (msg) alert("Message sent via Push & SMS to patient.");
  };

  const handleContactPharmacy = () => {
    const msg = prompt(`Send message to Pharmacy ${selectedOrder.pharmacy.name}:`, `Re: Order ${selectedOrder.id}`);
    if (msg) alert("Message sent to pharmacy notification system.");
  };

  const handleSuspendPharmacy = () => {
    const confirmSuspension = prompt("WARNING: Suspending this pharmacy will hide them from all searches and cancel active orders. Type SUSPEND to confirm.");
    if (confirmSuspension === 'SUSPEND') {
      alert(`Pharmacy ${selectedOrder.pharmacy.name} suspended. Operations halted.`);
    }
  };

  const handleIssueRefund = () => {
    const amount = prompt("Enter amount to refund ETB:", selectedOrder.total);
    const reason = prompt("Enter reason for refund:");
    if (amount && reason) {
      alert(`Refund instruction for ETB ${amount} sent to Chapa.`);
    }
  };

  const handleMarkResolved = () => {
    const summary = prompt("Enter resolution summary:");
    if (summary) {
      setOrders((prev: any) => prev.map((o: any) => o.id === selectedOrder.id ? { ...o, flag: null } : o));
      setSelectedOrder((prev: any) => ({...prev, flag: null}));
      alert("Order marked as resolved. Flags cleared.");
    }
  };


  if (selectedOrder) {
    return (
      <div className="p-6 md:p-8 max-w-[1200px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <button 
            onClick={() => setSelectedOrder(null)} 
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-brand-950">{t.orderDetailTitle}: {selectedOrder.id}</h1>
            <p className="text-sm text-gray-500">Read-only oversight view for administration and dispute resolution.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sec 1: Order Identity */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-950 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-700" /> {t.identitySection}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="font-bold text-brand-950">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Status</p>
                  <p className="font-bold text-blue-600">{selectedOrder.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <p className="font-bold text-emerald-600">{selectedOrder.payment.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Time Placed</p>
                  <p className="font-bold text-gray-900">{selectedOrder.placedAt}</p>
                  <p className="text-[10px] text-gray-500">{selectedOrder.time}</p>
                </div>
              </div>
              {selectedOrder.flag && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <Flag className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-900">Flagged for Review</p>
                    <p className="text-xs text-red-700">{selectedOrder.flag}</p>
                  </div>
                </div>
              )}
            </section>

            {/* Sec 4: Order Items */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-950 mb-4">{t.itemsSection}</h2>
              <div className="space-y-4">
                {selectedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start border-b border-gray-100 pb-4">
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.nameAm}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">Qty: {item.quantity}</span>
                        <span className="text-gray-500">@ {item.unitPrice.toFixed(2)} ETB</span>
                        {item.requiresPrescription && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">Rx Required</span>}
                      </div>
                      {item.rxImage && (
                        <button 
                          onClick={() => setRxImageModal(item.rxImage)}
                          className="mt-2 text-xs text-brand-600 font-bold hover:underline"
                        >
                          View Prescription Image
                        </button>
                      )}
                    </div>
                    <p className="font-bold text-brand-950">{item.subtotal.toFixed(2)} ETB</p>
                  </div>
                ))}
                
                <div className="pt-2 text-sm">
                  <div className="flex justify-between text-gray-600 mb-1"><span>Subtotal:</span><span>{selectedOrder.subtotal.toFixed(2)} ETB</span></div>
                  <div className="flex justify-between text-gray-600 mb-2"><span>Delivery Fee:</span><span>{selectedOrder.deliveryFee.toFixed(2)} ETB</span></div>
                  <div className="flex justify-between font-bold text-lg text-brand-900 border-t border-gray-200 pt-2">
                    <span>Grand Total:</span><span>{selectedOrder.total.toFixed(2)} ETB</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Sec 7: Timeline */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-950 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-700" /> {t.timelineSection}
              </h2>
              <div className="space-y-4">
                {selectedOrder.timeline.map((event: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1.5"></div>
                      {idx !== selectedOrder.timeline.length - 1 && <div className="w-px h-full bg-gray-200 my-1"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="font-bold text-gray-900">{event.status}</p>
                      <p className="text-xs text-gray-500">{event.timestamp} • Triggered by: <span className="font-medium">{event.actor}</span></p>
                      {event.notes && <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{event.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

             {/* Sec 8: Notifications Sent */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-950 mb-4">{t.notificationsSection}</h2>
              <div className="space-y-3">
                {selectedOrder.notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">No notifications sent yet.</p>
                ) : (
                  selectedOrder.notifications.map((notif: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{notif.type} <span className="text-xs font-normal text-gray-500">to {notif.recipient} via {notif.channel}</span></p>
                        <p className="text-xs text-gray-500">{notif.timestamp}</p>
                      </div>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium">{notif.status}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

          </div>

          {/* Sidebar / Columns */}
          <div className="space-y-6">
            
            {/* Sec 2: Patient Info */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-950 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-700" /> {t.patientSection}
              </h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">Name:</span> <p className="font-bold text-gray-900">{selectedOrder.patient.name}</p></div>
                <div><span className="text-gray-500">Phone:</span> <a href={`tel:${selectedOrder.patient.phone}`} className="font-bold text-brand-600 hover:underline block">{selectedOrder.patient.phone}</a></div>
                <div><span className="text-gray-500">Account ID:</span> <a href="#" className="font-bold text-brand-600 hover:underline block">{selectedOrder.patient.id}</a></div>
                <div><span className="text-gray-500">Status:</span> <p className="font-medium text-emerald-600">{selectedOrder.patient.status}</p></div>
                <div><span className="text-gray-500">Previous Orders:</span> <p className="font-medium text-gray-900">{selectedOrder.patient.orderCount}</p></div>
                <Link
                  href="/admin/coming-soon?feature=Patient%20profile"
                  className="block w-full mt-2 py-2 bg-brand-50 text-brand-700 font-bold rounded-xl hover:bg-brand-100 transition-colors text-center"
                >
                  View Patient Profile
                </Link>
              </div>
            </section>

            {/* Sec 3: Pharmacy Info */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-950 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-brand-700" /> {t.pharmacySection}
              </h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">Name:</span> <p className="font-bold text-gray-900">{selectedOrder.pharmacy.name}</p></div>
                <div><span className="text-gray-500">Status:</span> <p className="font-medium text-emerald-600">{selectedOrder.pharmacy.status}</p></div>
                <div><span className="text-gray-500">Phone:</span> <a href={`tel:${selectedOrder.pharmacy.phone}`} className="font-bold text-brand-600 hover:underline block">{selectedOrder.pharmacy.phone}</a></div>
                <div><span className="text-gray-500">Address:</span> <p className="font-medium text-gray-900">{selectedOrder.pharmacy.address}</p></div>
                <Link
                  href="/admin/coming-soon?feature=Pharmacy%20profile"
                  className="block w-full mt-2 py-2 bg-brand-50 text-brand-700 font-bold rounded-xl hover:bg-brand-100 transition-colors text-center"
                >
                  View Pharmacy Profile
                </Link>
              </div>
            </section>

            {/* Sec 5: Delivery Info */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-950 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-700" /> {t.deliverySection}
              </h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">Method:</span> <p className="font-bold text-gray-900">{selectedOrder.delivery.method}</p></div>
                {selectedOrder.delivery.method === 'Home Delivery' && (
                  <>
                    <div><span className="text-gray-500">Address:</span> <p className="font-medium text-gray-900">{selectedOrder.delivery.address}</p></div>
                    {selectedOrder.delivery.instructions && (
                      <div><span className="text-gray-500">Instructions:</span> <p className="font-medium text-gray-600 italic">&quot;{selectedOrder.delivery.instructions}&quot;</p></div>
                    )}
                    <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                      [Static Map Thumbnail]
                    </div>
                    <div className="border-t border-gray-100 pt-2 mt-2">
                      <span className="text-gray-500 block mb-1">Assigned Agent:</span>
                      {selectedOrder.delivery.agent ? (
                        <>
                          <p className="font-bold text-gray-900">{selectedOrder.delivery.agent.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{selectedOrder.delivery.agent.phone}</p>
                        </>
                      ) : (
                        <p className="font-medium text-gray-600">Not assigned yet</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Sec 6: Payment Info */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-brand-950 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-700" /> {t.paymentSection}
              </h2>
              <div className="space-y-3 text-sm">
                <div><span className="text-gray-500">Method:</span> <p className="font-bold text-gray-900">{selectedOrder.payment.method}</p></div>
                <div>
                  <span className="text-gray-500">Status:</span> 
                  <p className={`font-bold ${selectedOrder.payment.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedOrder.payment.status}
                  </p>
                </div>
                {selectedOrder.payment.refId && (
                  <div><span className="text-gray-500">Chapa Ref ID:</span> <p className="font-mono text-xs text-gray-600 bg-gray-100 p-1 rounded">{selectedOrder.payment.refId}</p></div>
                )}
                {selectedOrder.payment.timestamp && (
                  <div><span className="text-gray-500">Confirmed At:</span> <p className="font-medium text-gray-900">{selectedOrder.payment.timestamp}</p></div>
                )}
                <Link
                  href="/admin/coming-soon?feature=Payment%20receipt"
                  className="w-full mt-2 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> View Payment Receipt
                </Link>
              </div>
            </section>

            {/* Sec 9 & 10: Chat & Complaints */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
               <div>
                  <h2 className="text-lg font-bold text-brand-950 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-700" /> {t.chatSection}
                  </h2>
                  <p className="text-[10px] text-gray-500 mb-3 bg-gray-50 p-2 rounded">
                    This conversation is end-to-end encrypted. Message content cannot be accessed by administrators.
                  </p>
                  {selectedOrder.chat.count > 0 ? (
                    <div className="bg-accent-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{selectedOrder.chat.count} messages exchanged</p>
                      <Link
                        href="/admin/coming-soon?feature=Chat%20metadata"
                        className="text-xs font-bold text-brand-600 hover:underline mt-1 inline-block"
                      >
                        View Conversation Metadata
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No chat initiated.</p>
                  )}
               </div>

               <div className="border-t border-gray-100 pt-4">
                  <h2 className="text-lg font-bold text-brand-950 mb-2">{t.complaintsSection}</h2>
                  {selectedOrder.complaints.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {selectedOrder.complaints.map((cmp: any) => (
                        <div key={cmp.id} className="bg-red-50 border border-red-100 p-3 rounded-xl">
                           <p className="text-sm font-bold text-red-900">{cmp.id} • {cmp.type}</p>
                           <p className="text-xs text-red-700">Filed by {cmp.reporter} • {cmp.status}</p>
                           <Link
                             href="/admin/coming-soon?feature=Complaint%20details"
                             className="text-xs font-bold text-red-600 hover:underline mt-1 inline-block"
                           >
                             View Complaint
                           </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-3">No complaints filed.</p>
                  )}
                  <Link
                    href="/admin/coming-soon?feature=File%20a%20complaint"
                    className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors inline-block"
                  >
                    + File New Complaint for This Order
                  </Link>
               </div>
            </section>

             {/* Sec 11: Admin Actions Panel */}
            <section className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" /> {t.adminActions}
              </h2>
              <div className="space-y-3">
                <button onClick={handleFlagOrder} className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-sm transition-colors text-left px-4 border border-gray-700">
                  {t.flagOrder}
                </button>
                <div className="flex gap-2">
                   <button onClick={handleContactPatient} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-sm transition-colors text-center border border-gray-700">
                     Contact Patient
                   </button>
                   <button onClick={handleContactPharmacy} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-sm transition-colors text-center border border-gray-700">
                     Contact Pharmacy
                   </button>
                </div>
                {selectedOrder.status !== 'Delivered' && (
                  <button onClick={handleSuspendPharmacy} className="w-full py-2.5 bg-red-900/40 hover:bg-red-900/60 text-red-400 font-bold rounded-xl text-sm transition-colors text-left px-4 border border-red-900/50">
                    {t.suspendPharmacy}
                  </button>
                )}
                {selectedOrder.payment.status === 'Paid' && (
                  <button onClick={handleIssueRefund} className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-sm transition-colors text-left px-4 border border-gray-700">
                    {t.issueRefund}
                  </button>
                )}
                {(selectedOrder.flag || selectedOrder.complaints.length > 0) && (
                  <button onClick={handleMarkResolved} className="w-full py-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 font-bold rounded-xl text-sm transition-colors text-left px-4 border border-emerald-900/50 mt-4">
                    {t.markResolved}
                  </button>
                )}
              </div>
            </section>

          </div>
        </div>

        {/* Prescription Image Modal */}
        {rxImageModal && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full">
               <button onClick={() => setRxImageModal(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300">
                 <XCircle className="w-8 h-8" />
               </button>
               <img src={rxImageModal} alt="Prescription" className="w-full h-auto rounded-lg shadow-2xl" />
            </div>
          </div>
        )}

      </div>
    );
  }

  // --- STANDARD TABLE VIEW ---

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-brand-950 mb-1">{t.platformOrders}</h1>
          <p className="text-gray-500 text-sm">{t.platformOrdersSub}</p>
        </div>
</div>

      {/* Stats Strip */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex-1 min-w-[200px]">
            <p className="text-sm text-gray-500 font-medium mb-1">{t.totalOrdersToday}</p>
            <p
              className={`text-2xl font-bold text-brand-950 ${kpisLoading ? 'animate-pulse text-gray-400' : ''}`}
            >
              {kpisLoading ? '—' : (ordersTodayKpis?.ordersToday ?? '—').toLocaleString()}
            </p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex-1 min-w-[200px]">
            <p className="text-sm text-gray-500 font-medium mb-1">{t.revenueToday}</p>
            <p
              className={`text-2xl font-bold text-brand-950 ${kpisLoading ? 'animate-pulse text-gray-400' : ''}`}
            >
              {kpisLoading ? (
                '—'
              ) : ordersTodayKpis ? (
                <>
                  {formatEtbRevenueCompact(ordersTodayKpis.revenueTodayEt)}{' '}
                  <span className="text-sm text-gray-500 font-normal">ETB</span>
                </>
              ) : (
                '—'
              )}
            </p>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm flex-1 min-w-[200px]">
            <p className="text-sm text-gray-500 font-medium mb-1">{t.avgFulfillment}</p>
            <p
              className={`text-2xl font-bold text-brand-950 ${kpisLoading ? 'animate-pulse text-gray-400' : ''}`}
            >
              {kpisLoading
                ? '—'
                : ordersTodayKpis?.avgFulfillmentMinutes == null
                  ? '—'
                  : `${ordersTodayKpis.avgFulfillmentMinutes}m`}
            </p>
          </div>
          <div className="bg-amber-50 px-6 py-4 rounded-2xl border border-amber-200 shadow-sm flex-1 min-w-[200px] cursor-pointer hover:bg-amber-100 transition-colors">
            <p className="text-sm text-amber-700 font-medium mb-1">{t.stuckOrders}</p>
            <p
              className={`text-2xl font-bold text-amber-800 flex items-center gap-2 ${kpisLoading ? 'animate-pulse text-amber-600/70' : ''}`}
            >
              {kpisLoading ? '—' : (ordersTodayKpis?.stuckOrders ?? '—').toLocaleString()}{' '}
              {!kpisLoading && ordersTodayKpis != null && <AlertTriangle className="w-5 h-5" />}
            </p>
          </div>
        </div>
        {kpisError && <p className="text-xs text-red-600 px-1">{kpisError}</p>}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-accent-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> {t.filters}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-accent-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-medium">{t.orderId}</th>
                <th className="p-4 font-medium">{t.patient}</th>
                <th className="p-4 font-medium">{t.pharmacy}</th>
                <th className="p-4 font-medium">{t.totalETB}</th>
                <th className="p-4 font-medium">{t.status}</th>
                <th className="p-4 font-medium">{t.time}</th>
                <th className="p-4 font-medium text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className={`hover:bg-accent-50/50 transition-colors ${order.stuck ? 'bg-amber-50/30' : ''}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-950 text-sm">{order.id}</span>
                      {order.stuck && <span title="Stuck Order"><AlertTriangle className="w-4 h-4 text-amber-500" /></span>}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{order.patient.name}</td>
                  <td className="p-4 text-sm font-medium text-brand-900">{order.pharmacy.name}</td>
                  <td className="p-4 text-sm text-gray-700">{order.total.toFixed(2)} <span className="text-xs text-gray-500">({order.payment.status})</span></td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      order.status.toLowerCase() === 'new' ? 'bg-blue-50 text-blue-700' :
                      order.status.toLowerCase() === 'preparing' ? 'bg-amber-50 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{order.time}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {t.viewDetails}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
