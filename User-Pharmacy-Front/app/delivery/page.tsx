'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle, AlertTriangle, Truck, MapPin, Search, Phone, ExternalLink, Calendar, ChevronRight, Camera, Store, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';

type DeliveryState = 'no_assignment' | 'new_assignment' | 'in_progress';
type activeStepType = 1 | 2 | 3 | 4;

const MOCK_ORDER = {
  id: 'ORD-20847',
  pharmacyName: 'Kenema Pharmacy #4',
  pharmacyAddress: 'Bole Road, near Dembel, Addis Ababa',
  patientArea: 'Gerji, Addis Ababa',
  patientAddress: 'Gerji Condominium, Block 4, Door 12',
  patientName: 'Abebe Bekele',
  patientPhone: '+251 91 123 4567',
  medications: ['Amoxicillin 500mg (x2)', 'Paracetamol (x1)', 'Vitamin C (x1)'],
  distance: '~2.3 km',
  paymentMethod: 'cod', // 'cod' or 'chapa'
  amount: 850,
  assignedAt: '2 mins ago',
  instructions: 'Green gate, second floor on the right. Call when you arrive.',
};

export default function DeliveryHome() {
  const { language } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [agentName, setAgentName] = useState('Delivery Agent');
  const [pharmacyName, setPharmacyName] = useState('Pharmacy');

  const [deliveryState, setDeliveryState] = useState<DeliveryState>('no_assignment');
  const [activeStep, setActiveStep] = useState<activeStepType>(1);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false]);
  const [cashCollected, setCashCollected] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  
  // Simulation timeout
  useEffect(() => {
    // Read names from local storage
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('medcare_user_name');
      const storedPharmacy = localStorage.getItem('medcare_delivery_pharmacy');
      if (storedName) setAgentName(storedName);
      if (storedPharmacy) setPharmacyName(storedPharmacy);
    }
  }, []);

  const handleToggleOnline = () => {
    if (deliveryState === 'in_progress') {
      alert("You have an active delivery in progress. You cannot go offline until it is completed or reassigned.");
      return;
    }
    setIsOnline(!isOnline);
  };

  const simulateNewAssignment = () => {
    if (isOnline && deliveryState === 'no_assignment') {
      setDeliveryState('new_assignment');
    }
  };

  const acceptDelivery = () => {
    setDeliveryState('in_progress');
    setActiveStep(1);
    localStorage.setItem('medcare_active_delivery', 'true');
  };

  const declineDelivery = () => {
    setShowDeclineModal(true);
  };

  const confirmDecline = () => {
    setShowDeclineModal(false);
    setDeliveryState('no_assignment');
  };

  const openMaps = (address: string) => {
    // Generic approach to open map
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  };

  const callPhone = (phoneNum: string) => {
    window.open(`tel:${phoneNum}`);
  };

  const allItemsChecked = checkedItems.every(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 sm:p-6 lg:p-8 max-w-lg mx-auto w-full relative sm:mt-0">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-gray-200">
            <Image
              src="https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&q=80"
              alt="Profile"
              width={48}
              height={48}
              unoptimized
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">{agentName}</h1>
            <p className="text-xs text-gray-500 font-medium">{pharmacyName}</p>
          </div>
        </div>
      </div>

      {deliveryState === 'no_assignment' && (
        <div className="flex-1 flex flex-col">
          {/* Online Toggle */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 mt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">
                  {isOnline ? 'You are Online' : 'You are Offline'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isOnline ? 'Available for deliveries' : 'Toggle online to receive deliveries'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={handleToggleOnline} />
                <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center -mt-10">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-colors duration-500 ${isOnline ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>
              <Truck className="w-16 h-16" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {isOnline ? 'Looking for assignments...' : 'You are currently offline'}
            </h2>
            <p className="text-gray-500 text-center max-w-xs text-sm">
              {isOnline 
                ? 'You will be notified when a new delivery is assigned to you.' 
                : 'Go online to start receiving delivery assignments from your pharmacy.'}
            </p>

            {/* Hidden button to simulate assignment for demonstration */}
            {isOnline && (
              <button onClick={simulateNewAssignment} className="mt-8 px-4 py-2 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                Simulate New Assignment
              </button>
            )}
          </div>
        </div>
      )}

      {/* STATE B: NEW ASSIGNMENT (Full Screen Overlay) */}
      <AnimatePresence>
        {deliveryState === 'new_assignment' && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-[60] bg-white flex flex-col sm:max-w-lg mx-auto sm:left-1/2 sm:-translate-x-1/2 shadow-2xl overflow-y-auto"
          >
            <div className="flex-1 p-6 flex flex-col pb-24 relative z-10">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 mx-auto animate-pulse">
                <Truck className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">New Delivery Assigned</h1>
              <p className="text-center text-gray-500 text-sm mb-6">{MOCK_ORDER.assignedAt}</p>

              <div className="space-y-4 flex-1">
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2 tracking-wider">PICKUP FROM:</p>
                  <h3 className="font-bold text-gray-900 text-sm">{MOCK_ORDER.pharmacyName}</h3>
                  <p className="text-sm text-gray-600 mb-2">{MOCK_ORDER.pharmacyAddress}</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 relative">
                  <div className="absolute right-4 top-5 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                    {MOCK_ORDER.distance}
                  </div>
                  <p className="text-xs font-bold text-gray-500 mb-2 tracking-wider">DELIVER TO:</p>
                  <h3 className="font-bold text-gray-900 text-sm">{MOCK_ORDER.patientArea}</h3>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 mb-2 tracking-wider">ORDER CONTENTS:</p>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc pl-4">
                    {MOCK_ORDER.medications.map(med => <li key={med}>{med}</li>)}
                  </ul>
                </div>

                <div className={`rounded-2xl p-5 border ${MOCK_ORDER.paymentMethod === 'cod' ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-xs font-bold mb-2 tracking-wider ${MOCK_ORDER.paymentMethod === 'cod' ? 'text-amber-700' : 'text-green-700'}`}>PAYMENT:</p>
                  <div className="flex items-start gap-2">
                    {MOCK_ORDER.paymentMethod === 'cod' ? (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-sm text-amber-900 font-bold">Collect ETB {MOCK_ORDER.amount.toFixed(2)} in cash upon delivery.</p>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                        <p className="text-sm text-green-800 font-bold">Already paid via Chapa — no cash collection required.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button 
                  onClick={acceptDelivery}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold h-14 rounded-xl text-lg shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Accept Delivery
                </button>
                <button 
                  onClick={declineDelivery}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold h-14 rounded-xl transition-all"
                >
                  Decline
                </button>
              </div>
            </div>
            {/* Background texture slightly visible */}
            <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1543881525-455bc3d84da4?auto=format&fit=crop&q=80')] opacity-5 pointer-events-none"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decline modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Decline Assignment</h3>
            <p className="text-sm text-gray-600 mb-4">Please select a reason for declining:</p>
            <select className="w-full p-3 border border-gray-200 rounded-xl mb-4 bg-gray-50 focus:ring-brand-500 outline-none">
              <option>I am currently unavailable</option>
              <option>I cannot reach the delivery location</option>
              <option>Vehicle issue</option>
              <option>Other</option>
            </select>
            <textarea 
              className="w-full p-3 border border-gray-200 rounded-xl mb-6 bg-gray-50 focus:ring-brand-500 outline-none min-h-[80px]"
              placeholder="Provide details..."
            ></textarea>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDecline}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE C: ACTIVE DELIVERY */}
      {deliveryState === 'in_progress' && (
        <div className="flex-1 flex flex-col -mt-4 pb-12">
          {/* Sticky Header info */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Active</span>
                <h2 className="font-bold text-gray-900 mt-1">{MOCK_ORDER.id}</h2>
              </div>
              <span className="text-xs text-gray-500 font-medium">Accepted just now</span>
            </div>

            {/* Stepper tracking */}
            <div className="flex justify-between items-center relative z-0">
              <div className="absolute left-0 top-1/2 -mt-[1px] w-full h-[2px] bg-gray-100 -z-10"></div>
              {[1, 2, 3, 4].map(step => (
                <div key={step} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold outline outline-4 outline-white
                  ${step < activeStep ? 'bg-green-500 text-white' : 
                    step === activeStep ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-500'}
                `}>
                  {step < activeStep ? <CheckCircle className="w-3 h-3" /> : step}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
              <span className={activeStep >= 1 ? "text-gray-900" : ""}>Go Info</span>
              <span className={activeStep >= 2 ? "text-gray-900 ml-2" : ""}>Pickup</span>
              <span className={activeStep >= 3 ? "text-gray-900 ml-4" : ""}>Deliver</span>
              <span className={activeStep >= 4 ? "text-gray-900 -mr-2" : ""}>Confirm</span>
            </div>
          </div>

          <div className="flex justify-center shrink-0">
            <Link href="/delivery/messages" className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm inline-flex items-center gap-2 w-full justify-center">
              <MessageSquare className="w-5 h-5" /> Message Pharmacy
            </Link>
          </div>

          {/* STEP 1: GO TO PHARMACY */}
          {activeStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Go to Pharmacy</h3>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-4">
                <p className="text-xs font-bold text-gray-500 mb-1 tracking-wider">PICKUP LOCATION</p>
                <div className="flex items-start gap-3 mt-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{MOCK_ORDER.pharmacyName}</h4>
                    <p className="text-sm text-gray-600">{MOCK_ORDER.pharmacyAddress}</p>
                  </div>
                </div>

                <button 
                  onClick={() => openMaps(MOCK_ORDER.pharmacyAddress)}
                  className="mt-6 w-full py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  Get Directions to Pharmacy
                </button>
              </div>

              <div className="mt-auto pt-4">
                <button 
                  onClick={() => setActiveStep(2)}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold h-14 rounded-xl text-lg shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
                >
                  I Have Arrived at Pharmacy
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PICK UP ORDER */}
          {activeStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Pickup Order</h3>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-4">
                <p className="text-xs font-bold text-gray-500 mb-4 tracking-wider">VERIFY ITEMS</p>
                <div className="space-y-3">
                  {MOCK_ORDER.medications.map((med, idx) => (
                    <label key={idx} className="flex gap-3 items-start cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-0.5">
                        <input
                          type="checkbox"
                          checked={checkedItems[idx]}
                          onChange={() => {
                            const newArr = [...checkedItems];
                            newArr[idx] = !newArr[idx];
                            setCheckedItems(newArr);
                          }}
                          className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-brand-500 checked:bg-brand-600 checked:border-brand-600 focus:outline-none transition-all"
                        />
                        <CheckCircle className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" />
                      </div>
                      <span className={`text-sm ${checkedItems[idx] ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}>
                        {med}
                      </span>
                    </label>
                  ))}
                </div>

                {MOCK_ORDER.paymentMethod === 'cod' && (
                  <div className="mt-6 bg-amber-50 rounded-xl p-3 border border-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-900">
                      <strong>Remind Patient:</strong> They need to have ETB {MOCK_ORDER.amount.toFixed(2)} ready.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4">
                <button 
                  onClick={() => setActiveStep(3)}
                  disabled={!allItemsChecked}
                  className="w-full disabled:bg-gray-300 disabled:shadow-none bg-brand-600 hover:bg-brand-700 text-white font-bold h-14 rounded-xl text-lg shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Confirm Pickup
                </button>
                {!allItemsChecked && <p className="text-center text-xs text-brand-600 font-medium mt-2">Check all items to proceed</p>}
              </div>
            </motion.div>
          )}

          {/* STEP 3: DELIVER TO PATIENT */}
          {activeStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Deliver Order</h3>
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-4">
                <p className="text-xs font-bold text-gray-500 mb-3 tracking-wider">DELIVERY LOCATION</p>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{MOCK_ORDER.patientName}</h4>
                    <p className="text-sm text-gray-600 mt-1">{MOCK_ORDER.patientAddress}</p>
                  </div>
                  <button onClick={() => callPhone(MOCK_ORDER.patientPhone)} className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-1">INSTRUCTIONS</p>
                  <p className="text-sm text-gray-800 italic">"{MOCK_ORDER.instructions}"</p>
                </div>

                <button 
                  onClick={() => openMaps(MOCK_ORDER.patientAddress)}
                  className="w-full py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Get Directions
                </button>

                <div className="mt-4 flex justify-between">
                  <button className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors">
                    Report Issue
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-4 relative">
                <button 
                  onClick={() => setActiveStep(4)}
                  className="w-full bg-brand-600 shadow-brand-500/30 hover:bg-brand-700 text-white font-bold h-14 rounded-xl text-lg shadow-lg transition-all flex items-center justify-center gap-2"
                >
                   Arrived at Location
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CONFIRM DELIVERY */}
          {activeStep === 4 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col justify-center">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xl mb-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-brand-500"></div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2 mt-2">Confirm Delivery</h3>
                <p className="text-center text-sm text-gray-600 mb-6">Confirm handing over order {MOCK_ORDER.id} to {MOCK_ORDER.patientName}.</p>

                {MOCK_ORDER.paymentMethod === 'cod' && (
                  <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 mb-6 text-center">
                    <p className="text-xs font-bold text-amber-700 mb-2 tracking-wider">COLLECT CASH</p>
                    <div className="text-4xl font-bold text-amber-900 mb-4">
                      ETB {MOCK_ORDER.amount.toFixed(2)}
                    </div>
                    <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={cashCollected}
                        onChange={(e) => setCashCollected(e.target.checked)}
                        className="w-6 h-6 border-2 border-gray-300 rounded focus:ring-amber-500 checked:bg-amber-600 checked:border-amber-600"
                      />
                      <span className="text-sm font-bold text-gray-900">I have collected the exact amount</span>
                    </label>
                  </div>
                )}

                <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-brand-600 bg-brand-50/50 mb-6 cursor-pointer">
                  <Camera className="w-6 h-6 mb-2" />
                  <span className="text-sm font-bold">Take photo proof (Optional)</span>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      alert("Delivery Completed Successfully!");
                      setDeliveryState('no_assignment');
                      setActiveStep(1);
                      setCheckedItems([false,false,false]);
                      setCashCollected(false);
                      localStorage.setItem('medcare_active_delivery', 'false');
                    }}
                    disabled={MOCK_ORDER.paymentMethod === 'cod' && !cashCollected}
                    className="w-full disabled:bg-gray-300 bg-brand-600 hover:bg-brand-700 text-white font-bold h-14 rounded-xl text-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    Confirm Delivery
                  </button>
                  <button 
                    onClick={() => setActiveStep(3)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold h-14 rounded-xl transition-all"
                  >
                    Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}
