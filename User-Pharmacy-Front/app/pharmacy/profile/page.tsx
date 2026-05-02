'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import { 
  Store, MapPin, ShieldCheck, Truck, Bell, Shield, LogOut, Camera, X, Check, 
  Map as MapIcon, ChevronRight, AlertTriangle, FileText, CheckCircle2, Clock, Smartphone, Lock
} from 'lucide-react';

type Tab = 'profile' | 'location' | 'license' | 'delivery' | 'notifications' | 'security' | 'signout';

export default function PharmacyProfilePage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [pharmacyName, setPharmacyName] = useState('Pharmacy Name');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Custom states for verification files
  const [businessLicense, setBusinessLicense] = useState<string | null>(null);
  const [professionalLicense, setProfessionalLicense] = useState<string | null>(null);
  const [businessExpiryDate, setBusinessExpiryDate] = useState<string | null>(null);
  const [profExpiryDate, setProfExpiryDate] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const fileReplaceRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<'business' | 'professional' | null>(null);
  
  // States for verification
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'expiring' | 'expired' | 'suspended'>('verified');
  
  // Form states - Profile
  const [engName, setEngName] = useState('');
  const [amhName, setAmhName] = useState('');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  
  // Setup data on mount
  useEffect(() => {
    const role = localStorage.getItem('medcare_role');
    if (role !== 'pharmacy') {
      router.push('/signup');
      return;
    }
    const name = localStorage.getItem('medcare_user_name') || localStorage.getItem('medcare_username');
    if (name) {
      setPharmacyName(name);
      setEngName(name);
    }
    
    // Check local storage for phone (draft from signup)
    try {
      const draft = localStorage.getItem('pharmacy_signup_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.phone) setPrimaryPhone(parsed.phone);
      } else {
        setPrimaryPhone('+251 911 123 456'); // fallback
      }
    } catch(e) {
      setPrimaryPhone('+251 911 123 456');
    }
    
    const photo = localStorage.getItem('medcare_pharmacy_avatar');
    if (photo) setProfilePhoto(photo);
    
    setBusinessLicense(localStorage.getItem('medcare_business_license'));
    setProfessionalLicense(localStorage.getItem('medcare_professional_license'));
    setBusinessExpiryDate(localStorage.getItem('medcare_pharmacy_expiry_date'));
    setProfExpiryDate(localStorage.getItem('medcare_pharmacy_prof_expiry_date'));
  }, [router]);
  
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('File must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setProfilePhoto(dataUrl);
      localStorage.setItem('medcare_pharmacy_avatar', dataUrl);
      window.dispatchEvent(new Event('avatar-changed'));
    };
    reader.readAsDataURL(file);
  };
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = () => {
    localStorage.setItem('medcare_user_name', engName);
    localStorage.setItem('medcare_user_email', email);
    localStorage.setItem('medcare_user_phone', primaryPhone);
    setPharmacyName(engName);
    window.dispatchEvent(new Event('auth-changed'));
    showToast('Profile changes saved successfully.');
  };

  const handleSaveLocation = () => {
    showToast('Location details saved successfully.');
  };

  const handleSaveDelivery = () => {
    showToast('Delivery options saved successfully.');
  };

  const handleDocumentReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadType) return;
    
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (uploadType === 'business') {
        setBusinessLicense(dataUrl);
        localStorage.setItem('medcare_business_license', dataUrl);
      } else {
        setProfessionalLicense(dataUrl);
        localStorage.setItem('medcare_professional_license', dataUrl);
      }
      setUploadType(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerDocumentReplace = (type: 'business' | 'professional') => {
    setUploadType(type);
    setTimeout(() => {
      fileReplaceRef.current?.click();
    }, 10);
  };

  // Multiple phone numbers logic
  const [additionalPhones, setAdditionalPhones] = useState<string[]>([]);
  
  const handleAddPhone = () => {
    if (additionalPhones.length < 2) {
      setAdditionalPhones([...additionalPhones, '']);
    }
  };
  
  const updateAdditionalPhone = (index: number, val: string) => {
    const newList = [...additionalPhones];
    newList[index] = val;
    setAdditionalPhones(newList);
  };

  const handleLogout = () => {
    localStorage.removeItem('medcare_role');
    localStorage.removeItem('medcare_user_name');
    localStorage.removeItem('medcare_username');
    router.push('/');
  };

  const translatedTabs = {
    profile: language === 'am' ? 'የፋርማሲ ፕሮፋይል' : 'Pharmacy Profile',
    location: language === 'am' ? 'አድራሻ እና የስራ ሰዓት' : 'Location & Hours',
    license: language === 'am' ? 'ፈቃድ እና ማረጋገጫ' : 'License & Verification',
    delivery: language === 'am' ? 'የአቅርቦት ማስተካከያዎች' : 'Delivery Settings',
    notifications: language === 'am' ? 'ማሳወቂያዎች' : 'Notifications',
    security: language === 'am' ? 'መለያ እና ደህንነት' : 'Account & Security',
    signout: language === 'am' ? 'ውጣ' : 'Sign Out'
  };

  const renderVerificationBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-200"><CheckCircle2 className="w-3.5 h-3.5" /> {language === 'am' ? 'የተረጋገጠ' : 'Verified ✓'}</span>;
      case 'pending':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200"><Clock className="w-3.5 h-3.5" /> {language === 'am' ? 'በሂደት ላይ' : 'Pending ⏳'}</span>;
      case 'expiring':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-200"><AlertTriangle className="w-3.5 h-3.5" /> {language === 'am' ? '15 ቀናት ይቀሩታል' : 'Expiring in 15 days ⚠'}</span>;
      case 'expired':
      case 'suspended':
        return <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200"><X className="w-3.5 h-3.5" /> {language === 'am' ? (verificationStatus === 'expired' ? 'ጊዜው አልፎበታል' : 'ታግዷል') : (verificationStatus === 'expired' ? 'Expired ❌' : 'Suspended ❌')}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
           <h2 className="text-xl font-serif font-bold text-gray-900 truncate">{pharmacyName}</h2>
           <div className="mt-3">
             {renderVerificationBadge()}
           </div>
           <button className="w-full mt-4 py-2 px-3 bg-brand-50 text-brand-700 rounded-lg text-sm font-bold hover:bg-brand-100 transition-colors">
              {language === 'am' ? 'የህዝብ ፕሮፋይልን ይመልከቱ' : 'View Public Profile'}
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {([
            { id: 'profile', icon: Store },
            { id: 'location', icon: MapPin },
            { id: 'license', icon: ShieldCheck },
            { id: 'delivery', icon: Truck },
            { id: 'notifications', icon: Bell },
            { id: 'security', icon: Shield }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${activeTab === tab.id ? 'bg-brand-50 text-brand-700 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'}`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-brand-600' : 'text-gray-400'}`} />
              <span className="text-sm">{translatedTabs[tab.id]}</span>
            </button>
          ))}
          <div className="my-4 border-t border-gray-100"></div>
          <button
            onClick={() => setActiveTab('signout')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${activeTab === 'signout' ? 'bg-red-50 text-red-700 font-bold' : 'text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium'}`}
          >
            <LogOut className={`w-5 h-5 ${activeTab === 'signout' ? 'text-red-600' : 'text-gray-400'}`} />
            <span className="text-sm">{translatedTabs.signout}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
           {activeTab === 'profile' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-100">
                 <h2 className="text-2xl font-serif font-bold text-gray-900">{translatedTabs.profile}</h2>
                 <p className="text-gray-500 text-sm mt-1">Manage your basic pharmacy information and how it appears to patients.</p>
               </div>
               <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Profile Photo (Max 5MB)</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex flex-col items-center gap-3">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden relative shrink-0 group"
                        >
                          {profilePhoto ? (
                            <>
                              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                              </div>
                            </>
                          ) : (
                            <>
                              <Camera className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
                              <span className="text-[10px] text-gray-500 font-medium mt-1">Tap to Replace</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/jpeg,image/png" 
                            onChange={handlePhotoUpload} 
                          />
                        </div>
                        {profilePhoto && (
                          <button 
                            onClick={() => {
                              setProfilePhoto(null);
                              localStorage.removeItem('medcare_pharmacy_avatar');
                              window.dispatchEvent(new Event('avatar-changed'));
                            }}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                          >
                            {language === 'am' ? 'ፎቶ አጥፋ' : 'Remove Photo'}
                          </button>
                        )}
                      </div>
                      <div className="flex-1 max-w-sm">
                        <p className="text-xs text-gray-500 leading-relaxed">This is the main image shown in patient search results and on their orders. We recommend a clear, well-lit photo of your storefront.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Pharmacy Name (English) *</label>
                      <input type="text" value={engName} onChange={e => setEngName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Pharmacy Name (Amharic) *</label>
                      <input type="text" value={amhName} onChange={e => setAmhName(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Primary Phone * <span className="text-emerald-600 text-xs font-normal bg-emerald-50 px-2 rounded-full py-0.5 ml-1">Verified</span></label>
                      <input type="tel" value={primaryPhone} onChange={e => setPrimaryPhone(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address *</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Operating Category (Multi-select)</label>
                     <div className="flex flex-wrap gap-2">
                       {['General Pharmacy', 'Hospital Pharmacy', '24-Hour Pharmacy', 'Delivery-Only'].map(cat => (
                         <button key={cat} onClick={() => setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])} className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${categories.includes(cat) ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                           {cat}
                         </button>
                       ))}
                     </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button onClick={handleSaveProfile} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                      Save Profile Changes
                    </button>
                  </div>
               </div>
             </motion.div>
           )}

           {activeTab === 'location' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                 <h2 className="text-2xl font-serif font-bold text-gray-900">{translatedTabs.location}</h2>
                 <p className="text-gray-500 text-sm mt-1">Set your exact location and operating hours.</p>
               </div>
               <div className="p-6 space-y-6">
                 <div>
                   <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><MapIcon className="w-5 h-5 text-brand-600" /> Map Pin (CRITICAL)</h3>
                   <p className="text-xs text-gray-500 mb-3">This interactive map defines your exact location. The GPS coordinates from this pin are used for patient search results and deliveries. Ensure it is perfectly accurate.</p>
                   <div className="w-full h-64 bg-gray-100 rounded-xl border border-gray-200 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 opacity-40 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=9.0222,38.7468&zoom=14&size=800x400&sensor=false')] bg-cover bg-center"></div>
                      <div className="relative z-10 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg transform -translate-y-4 animate-bounce cursor-pointer border-2 border-white">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <div className="absolute -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500"></div>
                      </div>
                      <button className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-sm font-bold text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Use Current Location
                      </button>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Free Text Landmark Description *</label>
                      <input type="text" placeholder="e.g. Near Bole Medhanealem Church, behind Dashen Bank" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Sub-city *</label>
                      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none">
                        <option>Bole</option>
                        <option>Yeka</option>
                        <option>Kirkos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Woreda *</label>
                      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none">
                        <option>Woreda 03</option>
                        <option>Woreda 04</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">Neighborhood / Special area</label>
                      <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1.5">House / Building Number</label>
                      <input type="text" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                    </div>
                 </div>

                 <div>
                   <h3 className="text-base font-bold text-gray-900 mb-3 border-b border-gray-100 pb-2">Weekly Operating Hours</h3>
                   <div className="space-y-3">
                     {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-28 font-bold text-gray-700 text-sm">{day}</div>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" defaultChecked />
                              <span className="text-sm font-medium text-gray-700">Open</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                              <span className="text-sm font-medium text-gray-700">24 Hours</span>
                            </label>
                          </div>
                          <div className="flex items-center gap-2 ml-auto">
                            <input type="time" defaultValue="08:00" className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white" />
                            <span className="text-gray-400">-</span>
                            <input type="time" defaultValue="20:00" className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white" />
                          </div>
                        </div>
                     ))}
                   </div>
                 </div>

                 <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button onClick={handleSaveLocation} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                      Save Location Details
                    </button>
                  </div>
               </div>
             </motion.div>
           )}

           {activeTab === 'license' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                 <h2 className="text-2xl font-serif font-bold text-gray-900">{translatedTabs.license}</h2>
                 <p className="text-gray-500 text-sm mt-1">Manage your official verification documents.</p>
               </div>
               <div className="p-6 space-y-6">
                  {/* Status Banner */}
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
                    <ShieldCheck className="w-8 h-8 text-green-600 shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-bold text-green-900">Your Pharmacy is Verified</h3>
                      <p className="text-green-700 text-sm mt-1 mb-3">You are fully operational and visible to patients worldwide. Your license number is <strong>EFDA-LIC-12345</strong>.</p>
                      
                      <div className="space-y-3">
                        <div className="bg-white/60 p-3 rounded-xl border border-green-200/50">
                          <div className="flex justify-between items-center text-sm font-bold mb-1">
                            <span className="text-gray-700">Business License Expiry</span>
                            <span className="text-green-600">{businessExpiryDate ? new Date(businessExpiryDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          {businessExpiryDate && (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, (new Date(businessExpiryDate).getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000) * 100))}%` }}></div>
                              </div>
                              <p className="text-xs font-bold mt-2 text-right">
                                {Math.max(0, Math.floor((new Date(businessExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days remaining
                              </p>
                            </>
                          )}
                          <p className="text-xs text-gray-500 mt-2">You will be notified at 60, 30, and 7 days before expiration.</p>
                        </div>
                        
                        <div className="bg-white/60 p-3 rounded-xl border border-green-200/50">
                          <div className="flex justify-between items-center text-sm font-bold mb-1">
                            <span className="text-gray-700">Professional License Expiry</span>
                            <span className="text-green-600">{profExpiryDate ? new Date(profExpiryDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          {profExpiryDate && (
                            <>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, (new Date(profExpiryDate).getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000) * 100))}%` }}></div>
                              </div>
                              <p className="text-xs font-bold mt-2 text-right">
                                {Math.max(0, Math.floor((new Date(profExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Days remaining
                              </p>
                            </>
                          )}
                          <p className="text-xs text-gray-500 mt-2">You will be notified at 60, 30, and 7 days before expiration.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-4">Required Documents Checklist</h3>
                    <input type="file" ref={fileReplaceRef} className="hidden" accept="image/jpeg,image/png,application/pdf" onChange={handleDocumentReplace} />
                    <div className="space-y-4">
                      {/* Business License */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${businessLicense ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'} rounded-lg flex items-center justify-center`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Business License Certificate</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {businessLicense ? (
                                <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><Check className="w-3 h-3 mr-1" /> Uploaded</span>
                              ) : (
                                <span className="flex items-center text-[11px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">Not Uploaded</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            disabled={!businessLicense}
                            onClick={() => businessLicense && setFullscreenImage(businessLicense)}
                            className="px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => triggerDocumentReplace('business')}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {businessLicense ? 'Replace' : 'Upload'}
                          </button>
                        </div>
                      </div>

                      {/* Professional License */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${professionalLicense ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'} rounded-lg flex items-center justify-center`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Professional License Certificate</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {professionalLicense ? (
                                <span className="flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><Check className="w-3 h-3 mr-1" /> Uploaded</span>
                              ) : (
                                <span className="flex items-center text-[11px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">Not Uploaded</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            disabled={!professionalLicense}
                            onClick={() => professionalLicense && setFullscreenImage(professionalLicense)}
                            className="px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => triggerDocumentReplace('professional')}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {professionalLicense ? 'Replace' : 'Upload'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button 
                      disabled={!businessLicense || !professionalLicense} 
                      className={`w-full py-3 font-bold rounded-xl ${businessLicense && professionalLicense ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      Submit for Verification (All uploaded)
                    </button>
                  </div>
               </div>
             </motion.div>
           )}

           {activeTab === 'delivery' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                 <div>
                   <h2 className="text-2xl font-serif font-bold text-gray-900">{translatedTabs.delivery}</h2>
                   <p className="text-gray-500 text-sm mt-1">Manage delivery options and patient reach.</p>
                 </div>
                 <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" defaultChecked />
                      <div className="block bg-brand-500 w-14 h-8 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform translate-x-6"></div>
                    </div>
                 </label>
               </div>
               
               <div className="p-6 space-y-6">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-1.5">Delivery Radius (km)</label>
                   <input type="number" defaultValue="5" className="w-1/3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                   <div className="mt-4 w-full h-40 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center p-4">
                     <p className="text-blue-600 text-sm font-medium text-center">Interactive map showing coverage circle goes here.</p>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-gray-700 mb-3">Delivery Fee Structure</label>
                     <div className="space-y-2">
                       <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                         <input type="radio" name="fee" className="w-4 h-4 text-brand-600 focus:ring-brand-500" />
                         <span className="text-sm font-bold text-gray-900">Free on all orders</span>
                       </label>
                       <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer bg-brand-50 border-brand-200">
                         <input type="radio" name="fee" defaultChecked className="w-4 h-4 text-brand-600 focus:ring-brand-500 border-brand-500" />
                         <span className="text-sm font-bold text-brand-900">Flat fee (ETB)</span>
                         <input type="number" defaultValue="50" className="ml-auto w-24 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg outline-none focus:border-brand-500" />
                       </label>
                       <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                         <input type="radio" name="fee" className="w-4 h-4 text-brand-600 focus:ring-brand-500" />
                         <span className="text-sm font-bold text-gray-900">Condition based</span>
                       </label>
                     </div>
                   </div>

                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Minimum Order Value (ETB)</label>
                     <p className="text-xs text-gray-500 mb-2">Orders below this cannot be delivered.</p>
                     <input type="number" defaultValue="100" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                   </div>

                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Estimated Delivery Time (mins)</label>
                     <p className="text-xs text-gray-500 mb-2">Shown to patients before ordering.</p>
                     <input type="number" defaultValue="30" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                   </div>

                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-1.5">Max Concurrent Deliveries per Agent</label>
                     <p className="text-xs text-gray-500 mb-2">Enforced by the system.</p>
                     <input type="number" defaultValue="5" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" />
                   </div>
                 </div>

                 <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button onClick={handleSaveDelivery} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                      Save Delivery Options
                    </button>
                  </div>
               </div>
             </motion.div>
           )}

           {activeTab === 'notifications' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                 <h2 className="text-2xl font-serif font-bold text-gray-900">{translatedTabs.notifications}</h2>
                 <p className="text-gray-500 text-sm mt-1">Configure who receives what alerts.</p>
               </div>
               
               <div className="p-6 space-y-8">
                 <div>
                   <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">Notification Recipients</h3>
                   <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <input 
                        type="tel" 
                        value={primaryPhone}
                        onChange={e => setPrimaryPhone(e.target.value)}
                        className="font-medium text-gray-700 text-sm bg-transparent outline-none w-full border-b border-transparent focus:border-brand-500" 
                      />
                       <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Primary</span>
                     </div>
                     
                     {additionalPhones.map((phone, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 mt-3">
                         <input 
                           type="tel" 
                           value={phone}
                           onChange={e => updateAdditionalPhone(i, e.target.value)}
                           placeholder="+251 ..."
                           className="font-medium text-gray-700 text-sm bg-transparent outline-none w-full border-b border-transparent focus:border-brand-500" 
                         />
                         <button onClick={() => setAdditionalPhones(additionalPhones.filter((_, idx) => idx !== i))}>
                            <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                         </button>
                       </div>
                     ))}

                     {additionalPhones.length < 1 && (
                       <button onClick={handleAddPhone} className="w-full py-2 mt-3 border-2 border-dashed border-gray-300 text-gray-500 text-sm font-bold hover:bg-gray-50 rounded-xl transition-colors">
                         + Add another number (Max 2 total)
                       </button>
                     )}
                   </div>
                 </div>

                 {/* Notification Modules */}
                 {[
                   { title: 'Orders', events: [ { name: 'New order received', push: true, sms: false, locked: true }, { name: 'Order waiting 30+ minutes', push: true, sms: true, locked: true }, { name: 'Order cancelled by patient', push: true, sms: false, locked: false } ] },
                   { title: 'Inventory', events: [ { name: 'Low stock alert', push: true, sms: false, locked: false }, { name: 'Item expiring within 30 days', push: true, sms: false, locked: false } ] },
                   { title: 'License', events: [ { name: 'License expiry reminders (60, 30, 7 days)', push: true, sms: true, locked: true } ] }
                 ].map(module => (
                   <div key={module.title}>
                     <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">{module.title}</h3>
                     <div className="space-y-4">
                       {module.events.map((ev, i) => (
                         <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                           <div className="flex-1">
                             <p className={`text-sm font-medium ${ev.locked ? 'text-gray-900' : 'text-gray-700'}`}>{ev.name} {ev.locked && <Lock className="inline w-3 h-3 text-red-400 ml-1" />}</p>
                           </div>
                           <div className="flex items-center gap-4">
                             <label className="flex items-center gap-2 cursor-pointer opacity-80">
                               <input type="checkbox" defaultChecked={ev.push} disabled={ev.locked} className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                               <span className="text-xs font-bold text-gray-600">Push</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer opacity-80">
                               <input type="checkbox" defaultChecked={ev.sms} disabled={ev.locked} className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500" />
                               <span className="text-xs font-bold text-gray-600">SMS</span>
                             </label>
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
               
             </motion.div>
           )}

           {activeTab === 'security' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-gray-100">
                 <h2 className="text-2xl font-serif font-bold text-gray-900">{translatedTabs.security}</h2>
                 <p className="text-gray-500 text-sm mt-1">Manage staff, authentication, and platform availability.</p>
               </div>
               
               <div className="p-6 space-y-8">
                 {/* Multi-Factor Authentication */}
                 <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5">
                   <div className="flex items-start gap-4">
                     <Smartphone className="w-6 h-6 text-purple-600 mt-1 shrink-0" />
                     <div>
                       <h3 className="text-base font-bold text-purple-900 mb-1">Multi-Factor Authentication (MFA)</h3>
                       <p className="text-sm text-purple-700/80 mb-3">Mandatory for all pharmacy accounts to protect patient data and inventory controls.</p>
                       <div className="flex items-center gap-2 text-sm font-bold text-purple-800 bg-white border border-purple-200 w-fit px-3 py-1.5 rounded-lg">
                         <CheckCircle2 className="w-4 h-4 text-green-500" /> Configured & Active
                       </div>
                       <div className="flex items-center gap-3 mt-4">
                         <button className="text-xs font-bold text-purple-700 hover:text-purple-900 underline">Generate Backup Codes</button>
                         <span className="text-xs text-purple-400">|</span>
                         <button className="text-xs font-bold text-purple-700 hover:text-purple-900 underline">Reconfigure Device</button>
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Staff Accounts */}
                 <div>
                   <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                     <h3 className="text-lg font-bold text-gray-900">Staff Accounts</h3>
                     <button className="text-sm font-bold text-brand-600 hover:text-brand-800">+ Add Staff Member</button>
                   </div>
                   <div className="space-y-3">
                     {[
                       { name: 'Dr. Abebe Bekele', role: 'Manager', access: 'Full Access', status: 'Active' },
                       { name: 'Helen Tadesse', role: 'Pharmacist', access: 'Orders, Inventory', status: 'Active' }
                     ].map((staff, i) => (
                       <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl gap-4">
                         <div>
                           <p className="font-bold text-gray-900 text-sm flex items-center gap-2">{staff.name} <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] uppercase rounded-full">{staff.role}</span></p>
                           <p className="text-xs text-gray-500 mt-1">Access: {staff.access}</p>
                         </div>
                         <button className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Deactivate</button>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Temporarily Close Pharmacy */}
                 <div className="pt-4 border-t border-gray-100">
                   <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start justify-between gap-4">
                     <div>
                       <h3 className="text-base font-bold text-orange-900 mb-1">Temporarily Close Pharmacy</h3>
                       <p className="text-sm text-orange-700/80 mb-2">Hide from patient search during holidays or restocking. You will not receive any new orders.</p>
                     </div>
                     <label className="flex items-center cursor-pointer shrink-0">
                        <div className="relative">
                          <input type="checkbox" className="sr-only" />
                          <div className="block bg-gray-300 w-12 h-7 rounded-full"></div>
                          <div className="dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition"></div>
                        </div>
                     </label>
                   </div>
                 </div>

               </div>
               
             </motion.div>
           )}

           {activeTab === 'signout' && (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden p-8 text-center max-w-sm mx-auto mt-10">
               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <LogOut className="w-8 h-8 text-red-600" />
               </div>
               <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">Confirm Sign Out</h2>
               <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out of the pharmacy dashboard? You will need your MFA device to log back in.</p>
               <div className="space-y-3">
                 <button onClick={handleLogout} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm">
                   Yes, Sign Out Now
                 </button>
                 <button onClick={() => setActiveTab('profile')} className="w-full py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl transition-colors">
                   Cancel
                 </button>
               </div>
             </motion.div>
           )}
        </div>
      </div>
      
      {/* Fullscreen Image Overlay */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button 
            onClick={() => setFullscreenImage(null)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Document Preview" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
          />
        </div>
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
