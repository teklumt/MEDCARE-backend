'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import { 
  User, Phone, Lock, LogOut, MapPin, Package, Bell, MessageSquare, 
  Trash2, ChevronRight, CheckCircle2, Shield, Edit2, ShieldAlert, X, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userName, setUserName] = useState('Guest User');
  const [userInitial, setUserInitial] = useState('G');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  
  // Section toggle states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('1988-05-12');
  const [sex, setSex] = useState('Prefer not to say');
  
  const [phone, setPhone] = useState('+251 911 234 567');
  
  const [addressState, setAddressState] = useState<{title: string, isDefault: boolean, details: string, hint: string} | null>({
      title: 'Home',
      isDefault: true,
      details: 'House 404, CMC Area\nBole Subcity, Woreda 11',
      hint: 'Green gate, second house right'
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressForm, setEditAddressForm] = useState({title: 'Home', isDefault: true, details: '', hint: ''});
  
  // Modals state
  const [showSignOutAlert, setShowSignOutAlert] = useState(false);
  const [showDeleteAddressAlert, setShowDeleteAddressAlert] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem('medcare_user_name');
    const fName = localStorage.getItem('medcare_first_name');
    const lName = localStorage.getItem('medcare_last_name');

    if (username) {
      setUserName(username);
    }
    
    if (fName) {
      setFirstName(fName);
    } else if (username) {
      const parts = username.split(' ');
      setFirstName(parts[0] || '');
    }
    
    if (lName) {
      setLastName(lName);
    } else if (username) {
      const parts = username.split(' ');
      setLastName(parts.slice(1).join(' ') || '');
    }
    
    let display = (fName || lName) ? `${fName || ''} ${lName || ''}`.trim() : username || 'Guest';
    setUserInitial(display.charAt(0).toUpperCase());
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(t('profile.photoUploadLimit'));
        return;
      }
      const url = URL.createObjectURL(file);
      setProfilePhotoUrl(url);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('medcare_user_name');
    localStorage.removeItem('medcare_role');
    window.location.href = '/';
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <main className="min-h-screen flex flex-col bg-accent-50 pb-20 md:pb-0 relative">
      <DashboardNavbar />
      
      {/* Sign Out Modal */}
      <AnimatePresence>
        {showSignOutAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSignOutAlert(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-5 border border-rose-100 shadow-sm mx-auto">
                <LogOut className="w-8 h-8 ml-1" />
              </div>
              
              <h3 className="text-xl font-serif font-bold text-gray-900 text-center mb-2">{t('profile.signOut')}</h3>
              <p className="text-sm text-gray-500 text-center mb-8">
                {t('profile.signOutConfirm')}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowSignOutAlert(false)}
                  className="py-3 px-4 rounded-xl font-bold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {t('profile.cancel')}
                </button>
                <button 
                  onClick={handleSignOut}
                  className="py-3 px-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors border border-rose-700 shadow-sm"
                >
                  {t('profile.yesSignOut')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Address Modal */}
      <AnimatePresence>
        {showDeleteAddressAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowDeleteAddressAlert(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-5 border border-rose-100 shadow-sm mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-serif font-bold text-gray-900 text-center mb-2">{t('profile.deleteAddress')}</h3>
              <p className="text-sm text-gray-500 text-center mb-8">
                {t('profile.deleteAddressConfirm')}
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowDeleteAddressAlert(false)}
                  className="py-3 px-4 rounded-xl font-bold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {t('profile.cancel')}
                </button>
                <button 
                  onClick={() => { setAddressState(null); setShowDeleteAddressAlert(false); }}
                  className="py-3 px-4 rounded-xl font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors border border-rose-700 shadow-sm"
                >
                  {t('profile.yesDelete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4 }}
           className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Profile Header */}
          <div className="px-6 py-8 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-5 sm:px-10 text-center sm:text-left">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {profilePhotoUrl ? (
                  <img src={profilePhotoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-brand-200" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-brand-200 flex items-center justify-center text-brand-800 font-bold font-heading text-3xl">
                    {userInitial}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="w-6 h-6 text-white mb-1" />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png" onChange={handlePhotoUpload} />
              </div>
              {profilePhotoUrl && (
                <button 
                  onClick={() => {
                    setProfilePhotoUrl(null);
                    localStorage.removeItem('medcare_user_photo');
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  {language === 'am' ? 'ፎቶ አጥፋ' : 'Remove Photo'}
                </button>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gray-900">
                {(firstName || lastName) ? `${firstName} ${lastName}`.trim() : userName || 'Guest'}
              </h1>
              <p className="text-gray-500 font-medium">{phone}</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Section 1: Personal Information */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
               <button 
                 onClick={() => toggleSection('personal')}
                 className="flex items-center justify-between w-full group"
               >
                 <div className="flex items-center gap-2 text-brand-900">
                    <User className="w-5 h-5" />
                    <h3 className="font-bold text-base">{t('profile.personalInfo')}</h3>
                 </div>
                 <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-transform ${openSections['personal'] ? 'rotate-90' : ''}`} />
               </button>

               <AnimatePresence mode="wait">
                 {openSections['personal'] ? (
                    <motion.div
                      key="personal-edit"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-6"
                    >
                       <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.firstName')}</label>
                               <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                             </div>
                             <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.lastName')}</label>
                               <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                             </div>
                          </div>
                          
                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.username')}</label>
                             <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.dob')}</label>
                               <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm" />
                             </div>
                             <div>
                               <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.sex')}</label>
                               <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm bg-white">
                                  <option value={t('profile.male')}>{t('profile.male')}</option>
                                  <option value={t('profile.female')}>{t('profile.female')}</option>
                                  <option value={t('profile.preferNotToSay')}>{t('profile.preferNotToSay')}</option>
                               </select>
                             </div>
                          </div>

                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.allergies')}</label>
                             <div className="flex flex-wrap gap-2 mb-2">
                               <span className="bg-rose-50 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-100 flex items-center gap-1.5">Penicillin <X className="w-3 h-3 cursor-pointer" /></span>
                               <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 flex items-center gap-1.5">Peanuts <X className="w-3 h-3 cursor-pointer" /></span>
                             </div>
                             <input type="text" placeholder={t('profile.addAllergy')} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm placeholder:text-gray-400" />
                          </div>

                          <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.chronic')}</label>
                             <input type="text" placeholder={t('profile.chronicHint')} className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm placeholder:text-gray-400" />
                          </div>

                          <div className="pt-2">
                             <button 
                               onClick={() => {
                                 localStorage.setItem('medcare_user_name', userName);
                                 localStorage.setItem('medcare_first_name', firstName);
                                 localStorage.setItem('medcare_last_name', lastName);
                                 window.dispatchEvent(new Event('medcare_profile_updated'));
                                 
                                 let newDisplay = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : userName || 'Guest';
                                 setUserInitial(newDisplay.charAt(0).toUpperCase());
                                 setOpenSections(prev => ({ ...prev, personal: false }));
                               }}
                               className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                             >
                               {t('profile.save')}
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 ) : (
                    <motion.div
                      key="personal-view"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-2 gap-4 mt-4 overflow-hidden mb-1"
                    >
                       <div>
                          <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('profile.dob')}</span>
                          <span className="text-sm font-medium text-gray-900">May 12, 1988</span>
                       </div>
                       <div>
                          <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('profile.sex')}</span>
                          <span className="text-sm font-medium text-gray-900">{sex}</span>
                       </div>
                       <div className="col-span-2">
                          <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{t('profile.allergies')}</span>
                          <div className="flex gap-2 mt-1.5">
                             <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md text-xs font-bold border border-rose-100">Penicillin</span>
                             <span className="bg-gray-50 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold border border-gray-200">Peanuts</span>
                          </div>
                       </div>
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Section 2: Contact and Login */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
               <button 
                 onClick={() => toggleSection('contact')}
                 className="flex items-center justify-between w-full group"
               >
                 <div className="flex items-center gap-2 text-brand-900">
                    <Shield className="w-5 h-5" />
                    <h3 className="font-bold text-base">{t('profile.contactLogin')}</h3>
                 </div>
                 <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-transform ${openSections['contact'] ? 'rotate-90' : ''}`} />
               </button>

               <AnimatePresence mode="wait">
                 {openSections['contact'] ? (
                    <motion.div
                      key="contact-edit"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-6"
                    >
                       <div className="space-y-6">
                          {/* Phone Edit */}
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                             <h4 className="text-sm font-bold text-gray-900 mb-3">{t('profile.changePhone')}</h4>
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.newPhone')}</label>
                             <div className="flex gap-2">
                               <input type="tel" placeholder="+251 9XX XXX XXX" className="flex-1 px-3 py-2 min-w-0 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm" />
                               <button className="px-4 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors text-sm whitespace-nowrap">
                                  {t('profile.sendOTP')}
                               </button>
                             </div>
                             <p className="text-xs text-gray-500 mt-2">{t('profile.otpDesc')}</p>
                          </div>

                          {/* Password Edit */}
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                             <h4 className="text-sm font-bold text-gray-900 mb-3">{t('profile.changePassword')}</h4>
                             <div className="space-y-3">
                               <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.currentPassword')}</label>
                                 <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm" />
                               </div>
                               <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.newPassword')}</label>
                                 <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm" />
                               </div>
                               <div>
                                 <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('profile.confirmPassword')}</label>
                                 <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm" />
                               </div>
                             </div>
                             <div className="pt-4">
                                <button className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors shadow-sm text-sm">
                                  {t('profile.updatePassword')}
                                </button>
                             </div>
                          </div>

                          {/* Active Sessions */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-3 ml-1">{t('profile.activeSessions')}</h4>
                            <div className="p-3 bg-white border border-brand-100 rounded-xl flex items-center justify-between mb-2 shadow-sm">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                                     <Lock className="w-4 h-4" />
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-gray-900">Chrome on iPhone</p>
                                     <p className="text-xs text-emerald-600 font-medium">Current device</p>
                                  </div>
                               </div>
                            </div>
                            <button className="w-full py-2 text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition-colors text-sm border border-transparent hover:border-rose-100">
                               {t('profile.logoutOther')}
                            </button>
                          </div>
                          
                          <div className="pt-2 flex justify-end">
                             <button onClick={() => setOpenSections(prev => ({ ...prev, contact: false }))} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                               {t('profile.close')}
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 ) : (
                    <motion.div
                      key="contact-view"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 mt-4 overflow-hidden mb-1"
                    >
                        <div className="flex items-center justify-between group">
                            <div>
                                <p className="text-sm font-bold text-gray-900">{t('profile.phone')}</p>
                                <p className="text-sm text-gray-500">{phone}</p>
                            </div>
                        </div>
                        <div className="h-px bg-gray-50"></div>
                        <div className="flex items-center justify-between group">
                            <div>
                                <p className="text-sm font-bold text-gray-900">{t('profile.password')}</p>
                                <p className="text-sm text-gray-500">Updated 2 months ago</p>
                            </div>
                        </div>
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Section 3: Saved Addresses */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
               <button 
                 onClick={() => toggleSection('address')}
                 className="flex items-center justify-between w-full group"
               >
                 <div className="flex items-center gap-2 text-brand-900">
                    <MapPin className="w-5 h-5" />
                    <h3 className="font-bold text-base">{t('profile.savedAddresses')}</h3>
                 </div>
                 <ChevronRight className={`w-5 h-5 text-gray-400 group-hover:text-brand-600 transition-transform ${openSections['address'] ? 'rotate-90' : ''}`} />
               </button>

               <AnimatePresence mode="wait">
                 {openSections['address'] ? (
                    <motion.div
                      key="address-edit"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-6"
                    >
                       <div className="space-y-4">
                           {isEditingAddress ? (
                              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3">
                                  <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.addressTitle')}</label>
                                    <input value={editAddressForm.title} onChange={e => setEditAddressForm({...editAddressForm, title: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.addressDetails')}</label>
                                    <textarea value={editAddressForm.details} rows={2} onChange={e => setEditAddressForm({...editAddressForm, details: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">{t('profile.addressHint')}</label>
                                    <input value={editAddressForm.hint} onChange={e => setEditAddressForm({...editAddressForm, hint: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                                  </div>
                                  <div className="flex gap-2 justify-end mt-3">
                                     <button onClick={() => setIsEditingAddress(false)} className="px-4 py-2 border border-gray-200 text-gray-600 bg-white hover:bg-gray-100 rounded-lg text-sm font-bold transition-colors">{t('profile.cancel')}</button>
                                     <button onClick={() => { setAddressState(editAddressForm); setIsEditingAddress(false); }} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 transition-colors text-white rounded-lg text-sm font-bold">{t('profile.saveAddress')}</button>
                                  </div>
                              </div>
                           ) : (
                              addressState ? (
                                <div className="bg-brand-50 border border-brand-200 p-4 rounded-xl flex items-start gap-3 relative">
                                    <MapPin className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                           <h4 className="text-sm font-bold text-brand-900">{addressState.title}</h4>
                                           {addressState.isDefault && (
                                              <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{t('profile.default')}</span>
                                           )}
                                        </div>
                                        <p className="text-sm text-brand-700/80 whitespace-pre-wrap">
                                           {addressState.details}
                                        </p>
                                        {addressState.hint && (
                                            <p className="text-xs text-brand-600 mt-2 font-medium">"{addressState.hint}"</p>
                                        )}
                                    </div>
                                    <div className="absolute top-4 right-4 flex gap-2">
                                       <button onClick={() => {setEditAddressForm(addressState); setIsEditingAddress(true);}} className="text-brand-600 hover:text-brand-800 p-1"><Edit2 className="w-4 h-4" /></button>
                                       <button onClick={() => setShowDeleteAddressAlert(true)} className="text-rose-500 hover:text-rose-700 p-1"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                              ) : null
                           )}
                           
                           {(!isEditingAddress && !addressState) && (
                               <button onClick={() => {setEditAddressForm({title: '', isDefault: false, details: '', hint: ''}); setIsEditingAddress(true);}} className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                                   <MapPin className="w-4 h-4" /> {t('profile.addNewAddress')}
                               </button>
                           )}
                           
                          <div className="pt-2 flex justify-end">
                             <button onClick={() => setOpenSections(prev => ({ ...prev, address: false }))} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                               {t('profile.close')}
                             </button>
                          </div>
                       </div>
                    </motion.div>
                 ) : (
                    <motion.div
                      key="address-view"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3 mt-4 overflow-hidden mb-1"
                    >
                        {addressState ? (
                          <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                              <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                     <h4 className="text-sm font-bold text-gray-800">{addressState.title}</h4>
                                     {addressState.isDefault && (
                                         <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">{t('profile.default')}</span>
                                     )}
                                  </div>
                                  <p className="text-sm text-gray-500 whitespace-pre-wrap">
                                     {addressState.details}
                                  </p>
                              </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                            <p className="text-sm text-gray-500 font-medium">No saved addresses</p>
                          </div>
                        )}
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Section 4: Order History */}
            <ProfileSection 
              title={t('profile.orderHistory')} 
              icon={<Package className="w-5 h-5" />}
              href="/dashboard/orders"
            >
              <p className="text-sm text-gray-500 mt-1">{t('profile.orderHistoryDesc')}</p>
            </ProfileSection>

            {/* Section 5: Notifications */}
            <ProfileSection 
              title={t('profile.notifications')} 
              icon={<Bell className="w-5 h-5" />}
              href="#"
            >
              <div className="flex items-center justify-between mt-2">
                 <span className="text-sm font-bold text-gray-900">{t('profile.pushNotifications')}</span>
                 <div className="w-10 h-6 bg-brand-600 text-white rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                 </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                 <span className="text-sm font-bold text-gray-900">{t('profile.smsAlerts')}</span>
                 <div className="w-10 h-6 bg-brand-600 text-white rounded-full flex items-center px-1">
                    <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                 </div>
              </div>
            </ProfileSection>

            {/* Section 8: Sign Out */}
            <button 
              onClick={() => setShowSignOutAlert(true)}
              className="w-full mt-4 flex items-center justify-between p-4 bg-gray-50 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-2xl transition-colors group"
            >
               <div className="flex items-center gap-3 text-gray-700 font-bold group-hover:text-rose-700 transition-colors">
                  <LogOut className="w-5 h-5" />
                  {t('profile.signOut')}
               </div>
            </button>
            
            <div className="text-center mt-6 mb-2">
               <span className="text-xs text-gray-400 font-medium">{t('profile.version')} 1.0.0</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function ProfileSection({ title, icon, href, children }: { title: string, icon: React.ReactNode, href: string, children: React.ReactNode }) {
    if (href !== "#") {
        return (
            <Link href={href} className="block group">
                <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left w-full">
                    <div className="flex items-center justify-between mb-3 border-b border-transparent pb-0 group-hover:border-gray-50 transition-colors">
                        <div className="flex items-center gap-2 text-brand-900">
                            {icon}
                            <h3 className="font-bold">{title}</h3>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                    {children}
                </div>
            </Link>
        )
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 text-brand-900 mb-3">
                {icon}
                <h3 className="font-bold">{title}</h3>
            </div>
            {children}
        </div>
    )
}

function CameraIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
