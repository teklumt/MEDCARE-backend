'use client';

import { useEffect, useState } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2, Plus, Minus, Upload, MapPin, Store, CheckCircle2, AlertCircle, CreditCard, Clock, ShoppingCart, Pill, FileText, Loader2, X } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  apiPost,
  submitOrderForPrescriptionReview,
  getUserAddresses,
  getPharmacyById,
  type UserAddress
} from '@/lib/api';
import DeliveryAddressEditor, {
  addressToFormValue,
  emptyDeliveryAddressForm,
  formValueToPayload,
  type DeliveryAddressFormValue
} from '@/components/dashboard/DeliveryAddressEditor';
import { formatDeliveryAddressForDisplay, toGeoJsonPoint } from '@/lib/mapGeo';
import { haversineKm, mapPharmacyToCard, formatDistanceKm } from '@/lib/pharmacyGeo';
import { useUserLocation } from '@/lib/useUserLocation';

export default function CartPage() {
  const { t } = useLanguage();
  const { items, updateQuantity, removeFromCart, cartTotal, itemCount, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'chapa' | 'cod'>('chapa');
  const [deliveryForm, setDeliveryForm] = useState<DeliveryAddressFormValue>(emptyDeliveryAddressForm);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [pharmacyDistance, setPharmacyDistance] = useState<string | null>(null);
  const router = useRouter();
  const { position, usingFallback } = useUserLocation();

  const deliveryFee = deliveryMethod === 'delivery' ? 50.00 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const requiresPrescription = items.some(item => item.requiresPrescription);

  // Get pharmacy ID from cart items (all items should be from same pharmacy)
  const selectedPharmacyId = items.length > 0 ? items[0].pharmacyId : null;
  const selectedPharmacyName = items.length > 0 ? items[0].pharmacyName : 'Pharmacy';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoadingAddresses(true);
      try {
        const list = await getUserAddresses();
        if (cancelled) return;
        setSavedAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setDeliveryForm(addressToFormValue(def));
      } catch {
        if (!cancelled) setSavedAddresses([]);
      } finally {
        if (!cancelled) setLoadingAddresses(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPharmacyId || usingFallback) return;
    let cancelled = false;
    void getPharmacyById(selectedPharmacyId).then((pharm) => {
      if (cancelled) return;
      const card = mapPharmacyToCard(pharm);
      if (!card.position) return;
      const km = haversineKm(position, card.position);
      setPharmacyDistance(formatDistanceKm(km));
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedPharmacyId, position, usingFallback]);

  const resolveDeliveryPayload = () => {
    if (deliveryMethod !== 'delivery') return undefined;
    const payload = formValueToPayload(deliveryForm);
    if (!payload) throw new Error('Please set your delivery address and map pin.');
    return payload;
  };

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
      setPrescriptionUploaded(true);
    }
  };

  const handleSendForReview = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!selectedPharmacyId) {
        throw new Error('Unable to determine pharmacy. Please try adding items to cart again.');
      }

      let prescriptionUploadId: string | null = null;
      if (requiresPrescription && prescriptionFile) {
        const formData = new FormData();
        formData.append('file', prescriptionFile);
        try {
          const uploadRes = await apiPost<{ _id: string }>('/prescriptions/upload', formData);
          prescriptionUploadId = uploadRes.data?._id ?? null;
        } catch {
          throw new Error('Failed to upload prescription. Please try again.');
        }
      }

      const deliveryAddress = resolveDeliveryPayload();

      const orderPayload = {
        pharmacyId: selectedPharmacyId,
        deliveryMethod,
        deliveryAddress,
        deliveryInstructions: '',
        items: items.map((item) => ({
          medicationId: item.id,
          quantity: item.quantity
        })),
        paymentMethod,
        deliveryFee,
        discount: 0,
        prescriptionUploadId
      };

      const data = await submitOrderForPrescriptionReview(orderPayload);
      clearCart();

      const created = data.order;
      const nextId = created._id;
      if (nextId) {
        router.push(`/dashboard/orders/${nextId}`);
      }
    } catch (err: unknown) {
      console.error('Send for review error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate pharmacy ID
      if (!selectedPharmacyId) {
        throw new Error('Unable to determine pharmacy. Please try adding items to cart again.');
      }

      // Non–prescription cart: payment starts immediately (Chapa or COD).
      const deliveryAddress = resolveDeliveryPayload();

      const orderData = {
        pharmacyId: selectedPharmacyId,
        deliveryMethod,
        deliveryAddress,
        deliveryInstructions: '',
        items: items.map(item => ({
          medicationId: item.id,
          quantity: item.quantity
        })),
        paymentMethod,
        deliveryFee,
        discount: 0,
        prescriptionUploadId: null as string | null
      };

      const response = await apiPost<{ order: { _id: string }; payment: { checkoutUrl?: string } | null }>('/orders', orderData);
      const { order, payment } = response.data || {};

      clearCart();

      if (paymentMethod === 'chapa' && payment?.checkoutUrl) {
        window.location.href = payment.checkoutUrl;
      } else if (order?._id) {
        router.push(`/dashboard/orders/${order._id}`);
      }
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0">
      <DashboardNavbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <Link href="/dashboard/search" className="inline-flex items-center text-brand-700 font-medium hover:text-brand-900 transition-colors mb-8">
          <ChevronLeft className="w-4 h-4 mr-1" /> {t('cart.continue')}
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-brand-950 mb-2">{t('cart.title')}</h1>
          <p className="text-gray-500 font-medium">{t('cart.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900 mb-1">Checkout Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-10 h-10 text-brand-300" />
            </div>
            <h2 className="text-2xl font-serif text-brand-950 mb-2">{t('cart.empty')}</h2>
            <p className="text-gray-500 mb-8">{t('cart.emptyDesc')}</p>
            <Link 
              href="/dashboard/search"
              className="inline-flex bg-brand-900 hover:bg-brand-800 text-white px-8 py-3 rounded-xl font-bold transition-colors"
            >
              {t('cart.browse')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Cart Items & Details */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Pharmacy Context */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                        {selectedPharmacyName}
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {items[0]?.pharmacyName ? 'Pharmacy order' : 'Addis Ababa'}
                        {pharmacyDistance && (
                          <span className="ml-1 font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full text-xs">
                            {pharmacyDistance} away
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg text-sm font-bold mb-1">
                      ★ 4.8
                    </div>
                    <p className="text-xs text-gray-500 flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> Ready in 15 mins
                    </p>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-serif font-bold text-xl text-gray-900 mb-6">{t('cart.orderItems').replace('{count}', itemCount.toString())}</h3>
                
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-24 h-24 bg-gray-100 rounded-2xl relative overflow-hidden shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Pill className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                            {item.requiresPrescription && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-1">
                                <AlertCircle className="w-3 h-3" /> {t('cart.prescriptionReq')}
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-brand-900 text-lg">ETB {item.price.toFixed(2)}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1 border border-gray-200">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-2 transition-colors flex items-center gap-1 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Link href="/dashboard/search" className="text-brand-700 font-bold hover:text-brand-900 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add more items from this pharmacy
                  </Link>
                </div>
              </div>

              {/* Prescription Upload (Conditional) */}
              {requiresPrescription && (
                <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{t('cart.prescriptionReq')}</h3>
                      <p className="text-sm text-gray-600 mb-4">{t('cart.prescriptionDesc')}</p>
                      
                      {!prescriptionUploaded ? (
                        <div className="flex flex-wrap gap-3">
                          <label className="flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-500 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer">
                            <Upload className="w-4 h-4" /> {t('cart.uploadFile')}
                            <input 
                              type="file" 
                              accept="image/*,.pdf" 
                              onChange={handlePrescriptionUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium text-sm">{prescriptionFile?.name || 'prescription_doc.jpg'} uploaded</span>
                          </div>
                          <button 
                            onClick={() => {
                              setPrescriptionUploaded(false);
                              setPrescriptionFile(null);
                            }}
                            className="text-sm font-bold text-emerald-700 hover:text-emerald-900 underline"
                          >
                            {t('cart.replace')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Method */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-serif font-bold text-xl text-gray-900 mb-4">{t('cart.deliveryMethod')}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <label className={`cursor-pointer rounded-2xl border-2 p-4 flex items-start gap-3 transition-all ${deliveryMethod === 'pickup' ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="deliveryMethod" 
                      value="pickup" 
                      checked={deliveryMethod === 'pickup'} 
                      onChange={() => setDeliveryMethod('pickup')}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <div className="font-bold text-gray-900">{t('cart.pickup')}</div>
                      <div className="text-sm text-gray-500 mt-1">{t('cart.pickupDesc')}</div>
                    </div>
                  </label>
                  
                  <label className={`cursor-pointer rounded-2xl border-2 p-4 flex items-start gap-3 transition-all ${deliveryMethod === 'delivery' ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input 
                      type="radio" 
                      name="deliveryMethod" 
                      value="delivery" 
                      checked={deliveryMethod === 'delivery'} 
                      onChange={() => setDeliveryMethod('delivery')}
                      className="mt-1 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <div className="font-bold text-gray-900">{t('cart.delivery')}</div>
                      <div className="text-sm text-gray-500 mt-1">{t('cart.deliveryDesc')}</div>
                    </div>
                  </label>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900 text-sm">{t('cart.deliveryAddress')}</h4>
                      <button
                        type="button"
                        onClick={() => setAddressModalOpen(true)}
                        className="text-brand-700 text-sm font-bold hover:underline"
                      >
                        {t('cart.edit')}
                      </button>
                    </div>
                    <p className="text-gray-600 text-sm whitespace-pre-line">
                      {deliveryForm.pin
                        ? formatDeliveryAddressForDisplay(
                            { ...deliveryForm, coordinates: toGeoJsonPoint(deliveryForm.pin) },
                            { multiline: true }
                          )
                        : 'No delivery address set. Tap Edit to add your address and map pin.'}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-28">
                <h3 className="font-serif font-bold text-xl text-gray-900 mb-6">{t('cart.summary')}</h3>
                
                <div className="space-y-4 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('cart.subtotal').replace('{count}', itemCount.toString())}</span>
                    <span className="font-medium text-gray-900">ETB {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t('cart.deliveryFee')}</span>
                    <span className="font-medium text-gray-900">
                      {deliveryFee === 0 ? t('cart.free') : `ETB ${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">{t('cart.total')}</span>
                    <span className="font-bold text-brand-900 text-2xl">ETB {finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 text-sm mb-3">Payment Method</h4>
                  <div className="space-y-2">
                    <label className={`cursor-pointer rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${paymentMethod === 'chapa' ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="chapa" 
                        checked={paymentMethod === 'chapa'} 
                        onChange={() => setPaymentMethod('chapa')}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">Online Payment (Chapa)</div>
                        <div className="text-xs text-gray-500 mt-0.5">Telebirr, CBE Birr, M-Pesa</div>
                      </div>
                    </label>
                    
                    <label className={`cursor-pointer rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${paymentMethod === 'cod' ? 'border-brand-500 bg-brand-50/50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod" 
                        checked={paymentMethod === 'cod'} 
                        onChange={() => setPaymentMethod('cod')}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">Cash on Delivery</div>
                        <div className="text-xs text-gray-500 mt-0.5">Pay when you receive</div>
                      </div>
                    </label>
                  </div>
                </div>

                <button 
                  disabled={(requiresPrescription && !prescriptionUploaded) || isProcessing}
                  onClick={requiresPrescription ? handleSendForReview : handleCheckout}
                  className="w-full bg-brand-900 hover:bg-brand-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm mb-4"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : requiresPrescription ? (
                    'Send for prescription verification'
                  ) : paymentMethod === 'chapa' ? (
                    'Proceed to Payment'
                  ) : (
                    'Place Order'
                  )}
                </button>

                {requiresPrescription && prescriptionUploaded && (
                  <p className="text-xs text-gray-500 text-center mb-4">
                    Payment starts after the pharmacy accepts your prescription. You will complete payment from your order page.
                  </p>
                )}
                
                {requiresPrescription && !prescriptionUploaded && (
                  <p className="text-xs text-red-500 text-center mb-4">
                    {t('cart.uploadReq')}
                  </p>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4 text-gray-400" /> Secure Payment
                  </div>
                  <p className="text-xs text-gray-500">Your payment information is encrypted and secure</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Delivery address</h3>
              <button type="button" onClick={() => setAddressModalOpen(false)} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <DeliveryAddressEditor
                value={deliveryForm}
                onChange={setDeliveryForm}
                savedAddresses={savedAddresses}
                loadingAddresses={loadingAddresses}
                onPickSaved={(addr) => setDeliveryForm(addressToFormValue(addr))}
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
