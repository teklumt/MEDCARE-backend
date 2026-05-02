'use client';

import { useState } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2, Plus, Minus, Upload, Camera, MapPin, Store, CheckCircle2, AlertCircle, CreditCard, Clock, ShoppingCart, Pill, FileText, Search } from 'lucide-react';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CartPage() {
  const { t } = useLanguage();
  const { items, updateQuantity, removeFromCart, cartTotal, itemCount, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [prescriptionUploaded, setPrescriptionUploaded] = useState(false);
  const router = useRouter();

  const deliveryFee = deliveryMethod === 'delivery' ? 50.00 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const requiresPrescription = items.some(item => item.requiresPrescription);

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
                        Aksum Pharmacy
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Bole, Addis Ababa <span className="ml-1 font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full text-xs">1.2 km away</span>
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
                          <button 
                            onClick={() => setPrescriptionUploaded(true)}
                            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-500 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                          >
                            <Upload className="w-4 h-4" /> {t('cart.uploadFile')}
                          </button>
                          <button 
                            onClick={() => setPrescriptionUploaded(true)}
                            className="flex items-center gap-2 bg-white border border-gray-200 hover:border-brand-500 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                          >
                            <Camera className="w-4 h-4" /> {t('cart.takePhoto')}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium text-sm">prescription_doc.jpg uploaded</span>
                          </div>
                          <button 
                            onClick={() => setPrescriptionUploaded(false)}
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
                      <button className="text-brand-700 text-sm font-bold hover:underline">{t('cart.edit')}</button>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Abebe Kebede<br/>
                      Bole Road, Dembel City Center<br/>
                      Addis Ababa, Ethiopia<br/>
                      +251 911 000000
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

                <button 
                  disabled={requiresPrescription && !prescriptionUploaded}
                  onClick={() => {
                    clearCart();
                    const mockOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
                    router.push(`/dashboard/orders/${mockOrderId}`);
                  }}
                  className="w-full bg-brand-900 hover:bg-brand-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-sm mb-4"
                >
                  {t('cart.payNow')}
                </button>
                
                {requiresPrescription && !prescriptionUploaded && (
                  <p className="text-xs text-red-500 text-center mb-4">
                    {t('cart.uploadReq')}
                  </p>
                )}

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4 text-gray-400" /> {t('cart.paymentMethods')}
                  </div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 font-medium">Telebirr</span>
                    <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 font-medium">CBE Birr</span>
                    <span className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 font-medium">{t('cart.cashOnDelivery')}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
