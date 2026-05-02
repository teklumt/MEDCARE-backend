'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { 
  User, Phone, Store, LogOut, ChevronRight, Bell, Shield, MapPin, 
  Search, Camera, Lock, CheckCircle, AlertTriangle, X, ChevronDown, Check,
  Smartphone, Laptop
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

// Mocks & Types
type VehicleType = 'Motorcycle' | 'Bicycle' | 'On Foot' | 'Three-Wheeler (Bajaj)' | 'Car';
type AgentProfile = {
  fullName: string;
  phoneNumber: string;
  nationalId: string;
  vehicleType: VehicleType;
  licensePlate: string;
  pharmacyName: string;
  pharmacyAddress: string;
  avatarUrl: string;
};
type NotificationPrefs = {
  newAssignment: boolean; // always true
  deliveryReminder: boolean;
  reminderChannel: 'Push' | 'SMS' | 'Both';
  pharmacyMessages: boolean;
  messagesChannel: 'Push' | 'SMS' | 'Both';
};

const MOCK_PROFILE: AgentProfile = {
  fullName: 'Abebe Bekele',
  phoneNumber: '911234567',
  nationalId: 'ET-12345678',
  vehicleType: 'Motorcycle',
  licensePlate: 'AA 12345',
  pharmacyName: 'Kenema Pharmacy #4',
  pharmacyAddress: 'Bole Road, Dembel',
  avatarUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&q=80',
};

const MOCK_NOTIFS: NotificationPrefs = {
  newAssignment: true,
  deliveryReminder: true,
  reminderChannel: 'Both',
  pharmacyMessages: true,
  messagesChannel: 'Push'
};

const SESSIONS = [
  { id: '1', device: 'Android Phone', active: 'This device', isCurrent: true },
  { id: '2', device: 'Chrome on Desktop', active: 'Active 2 hours ago', isCurrent: false },
];

export default function DeliveryProfile() {
  const { language } = useLanguage();
  const router = useRouter();

  // Loading State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data State
  const [profile, setProfile] = useState<AgentProfile>(MOCK_PROFILE);
  const [notifs, setNotifs] = useState<NotificationPrefs>(MOCK_NOTIFS);
  const [sessions, setSessions] = useState(SESSIONS);
  const [activeDelivery, setActiveDelivery] = useState(false);

  // UI States
  const [expandedSection, setExpandedSection] = useState<'info' | 'security' | 'notifs' | null>(null);
  
  // Edit Form States (Personal Info)
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState<AgentProfile>(MOCK_PROFILE);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Phone Edit States
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneStep, setPhoneStep] = useState(1);
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState(['','','','','','']);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  
  // Password States
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [isPwdUpdaing, setIsPwdUpdating] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  // Avatar states
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    // Initial fetch mock
    setTimeout(() => {
      const storedName = localStorage.getItem('medcare_user_name');
      const storedPhone = localStorage.getItem('medcare_delivery_phone');
      const storedPharmacy = localStorage.getItem('medcare_delivery_pharmacy');
      setActiveDelivery(localStorage.getItem('medcare_active_delivery') === 'true');

      const merged = { ...MOCK_PROFILE };
      if (storedName) merged.fullName = storedName;
      if (storedPhone) merged.phoneNumber = storedPhone.replace('+251 ', '');
      if (storedPharmacy) merged.pharmacyName = storedPharmacy;
      
      setProfile(merged);
      setEditForm(merged);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setShowAvatarMenu(false);
      setIsUploadingAvatar(true);
      // simulate upload
      setTimeout(() => {
        setProfile(prev => ({...prev, avatarUrl: URL.createObjectURL(e.target.files![0])}));
        setIsUploadingAvatar(false);
        showToast('Profile photo updated.');
      }, 1500);
    }
  };

  const handleSaveInfo = async () => {
    // Validate
    const errors: Record<string, string> = {};
    if (editForm.fullName.trim().length < 3) errors.fullName = 'Full name must be at least 3 characters.';
    if (editForm.nationalId.trim().length === 0) errors.nationalId = 'National ID is required.';
    if (['Motorcycle', 'Three-Wheeler (Bajaj)', 'Car'].includes(editForm.vehicleType) && editForm.licensePlate.trim().length === 0) {
      errors.licensePlate = 'License plate is required for this vehicle type.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setProfile(editForm);
      setIsSaving(false);
      setIsEditingInfo(false);
      showToast('Personal information updated successfully.');
      localStorage.setItem('medcare_user_name', editForm.fullName);
    }, 1000);
  };

  const handleCancelEdit = () => {
    setEditForm(profile);
    setFormErrors({});
    setIsEditingInfo(false);
  };

  const handleSendPhoneCode = () => {
    if (newPhone.length < 8) {
      setFormErrors({ newPhone: 'Enter a valid phone number.' });
      return;
    }
    setFormErrors({});
    setIsPhoneLoading(true);
    setTimeout(() => {
      setIsPhoneLoading(false);
      setPhoneStep(2);
    }, 1000);
  };

  const handleVerifyPhone = () => {
    if (phoneOtp.join('').length < 6) return;
    if (phoneOtp.join('') === '000000') {
      setFormErrors({ otp: 'Incorrect code. 2 attempts remaining.' });
      return;
    }
    
    // Success
    setProfile(prev => ({...prev, phoneNumber: newPhone }));
    localStorage.setItem('medcare_delivery_phone', '+251 ' + newPhone);
    setShowPhoneModal(false);
    setPhoneStep(1);
    setPhoneOtp(['','','','','','']);
    setNewPhone('');
    setIsEditingInfo(false); // Reset edit mode if active
    showToast('Phone number updated successfully. Signed out of other devices.');
  };

  const updatePassword = () => {
    if (currentPwd === 'wrong') {
      setPwdError('Current password is incorrect.');
      return;
    }
    setIsPwdUpdating(true);
    setTimeout(() => {
      setIsPwdUpdating(false);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setPwdError('');
      showToast('Password updated. You have been signed out of other devices.');
    }, 1000);
  };

  const getPwdStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: 'bg-gray-200' };
    if (pwd.length < 8) return { label: 'Weak', color: 'bg-red-500' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return { label: 'Very Strong', color: 'bg-green-600' };
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { label: 'Strong', color: 'bg-green-500' };
    return { label: 'Fair', color: 'bg-yellow-500' };
  };

  const handleNotificationChange = (key: keyof NotificationPrefs, val: any) => {
    setNotifs(prev => ({...prev, [key]: val}));
    // Auto-saves mock
    // Show tiny silent toast if desired, but prompt says "subtle Saved micro-confirmation fades in and out" next to control
  };

  const handleSignOut = () => {
    if (activeDelivery) {
      alert("Cannot Sign Out\n\nYou have an active delivery in progress. You must complete or report this delivery before signing out. Contact your pharmacy if you need assistance.");
      return;
    }
    
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.removeItem('medcare_role');
      localStorage.removeItem('medcare_active_delivery');
      router.push('/login');
    }
  };

  const removeSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast('Device signed out.');
  };

  const signOutAllOther = () => {
    if (window.confirm("Sign out all other devices? You will remain signed in on this device.")) {
      setSessions(prev => prev.filter(s => s.isCurrent));
      showToast('Signed out of all other devices.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-24 animate-pulse">
        <div className="bg-white border-b border-gray-200 p-6 pt-8 flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          </div>
        </div>
        <div className="p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-6 mt-4">
          <div className="h-40 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-40 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-40 bg-gray-200 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col pb-24 relative">
      {/* Generic Error Banner Mock (Hidden usually) */}
      {/* <div className="bg-red-50 text-red-600 px-4 py-2 text-sm font-medium text-center">Could not load your profile. Please check your connection.</div> */}

      {/* Profile Header Block */}
      <div className="bg-white border-b border-gray-200 p-6 pt-8 flex items-center gap-4 shadow-sm z-20 sticky top-0">
        <div className="relative">
          <button 
            onClick={() => setShowAvatarMenu(true)}
            className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-sm relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Profile"
                width={80}
                height={80}
                unoptimized
                className={`object-cover w-full h-full transition-opacity ${isUploadingAvatar ? 'opacity-50' : 'group-hover:opacity-80'}`}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-700">
                <User className="w-8 h-8" />
              </div>
            )}
            {isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {!isUploadingAvatar && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </button>
        </div>
        
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{profile.fullName}</h1>
          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <Phone className="w-3.5 h-3.5" /> +251 {profile.phoneNumber}
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mt-1">
            {profile.vehicleType} • {profile.licensePlate || 'No plate'}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-6">
        
        {/* SECTION 1: PERSONAL INFORMATION */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Personal Information</h2>
            {!isEditingInfo ? (
              <button onClick={() => setIsEditingInfo(true)} className="text-brand-600 text-sm font-bold hover:text-brand-800">Edit</button>
            ) : null}
          </div>
          
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {isEditingInfo ? (
              <div className="p-5 space-y-4">
                {formErrors.general && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{formErrors.general}</div>}
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                  {formErrors.fullName && <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle Type</label>
                  <select value={editForm.vehicleType} onChange={e => setEditForm({...editForm, vehicleType: e.target.value as VehicleType, licensePlate: ['Bicycle', 'On Foot'].includes(e.target.value) ? '' : editForm.licensePlate})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none">
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Bicycle">Bicycle</option>
                    <option value="On Foot">On Foot</option>
                    <option value="Three-Wheeler (Bajaj)">Three-Wheeler (Bajaj)</option>
                    <option value="Car">Car</option>
                  </select>
                </div>

                {!['Bicycle', 'On Foot'].includes(editForm.vehicleType) && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">License Plate</label>
                    <input type="text" value={editForm.licensePlate} onChange={e => setEditForm({...editForm, licensePlate: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none uppercase" />
                    {formErrors.licensePlate && <p className="text-xs text-red-500 mt-1">{formErrors.licensePlate}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">National ID</label>
                  <input type="text" value={editForm.nationalId} onChange={e => setEditForm({...editForm, nationalId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                  {formErrors.nationalId && <p className="text-xs text-red-500 mt-1">{formErrors.nationalId}</p>}
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <span className="text-gray-600 text-sm font-medium">+251 {profile.phoneNumber}</span>
                    <button type="button" onClick={() => setShowPhoneModal(true)} className="text-sm font-bold text-brand-600 hover:text-brand-800">Change</button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={handleCancelEdit} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                  <button onClick={handleSaveInfo} disabled={isSaving} className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white font-bold rounded-xl transition-colors shadow-md">
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                <div className="px-5 py-3 flex justify-between items-center"><span className="text-sm text-gray-500">Full Name</span><span className="text-sm font-medium text-gray-900">{profile.fullName}</span></div>
                <div className="px-5 py-3 flex justify-between items-center"><span className="text-sm text-gray-500">Vehicle Type</span><span className="text-sm font-medium text-gray-900">{profile.vehicleType}</span></div>
                {['Motorcycle', 'Three-Wheeler (Bajaj)', 'Car'].includes(profile.vehicleType) && <div className="px-5 py-3 flex justify-between items-center"><span className="text-sm text-gray-500">License Plate</span><span className="text-sm font-medium text-gray-900">{profile.licensePlate || '-'}</span></div>}
                <div className="px-5 py-3 flex justify-between items-center"><span className="text-sm text-gray-500">National ID</span><span className="text-sm font-medium text-gray-900">{profile.nationalId}</span></div>
                <div className="px-5 py-3 flex justify-between items-center"><span className="text-sm text-gray-500">Phone Number</span><span className="text-sm font-medium text-gray-900">+251 {profile.phoneNumber}</span></div>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: PASSWORD AND SECURITY */}
        <section>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'security' ? null : 'security')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-amber-600" />
                </div>
                <span className="font-medium text-gray-900 text-sm">Password & Security</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'security' ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {expandedSection === 'security' && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100">
                  <div className="p-5 space-y-6">
                    {/* Password Change */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Current Password</label>
                          <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="••••••••" />
                          {pwdError && <p className="text-xs text-red-500 mt-1">{pwdError}</p>}
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">New Password</label>
                          <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="••••••••" />
                          {newPwd.length > 0 && (
                            <div className="mt-1 flex items-center justify-between">
                              <span className={`text-[10px] font-bold uppercase ${getPwdStrength(newPwd).color.replace('bg-', 'text-')}`}>{getPwdStrength(newPwd).label}</span>
                            </div>
                          )}
                          <p className="text-[10px] text-gray-500 mt-1">Minimum 8 characters, at least one number, one uppercase letter</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Confirm New Password</label>
                          <div className="relative">
                            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none pr-10" placeholder="••••••••" />
                            {confirmPwd.length > 0 && (
                              <div className="absolute right-3 top-2.5">
                                {confirmPwd === newPwd ? <CheckCircle className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-red-500" />}
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={updatePassword}
                          disabled={!currentPwd || !newPwd || confirmPwd !== newPwd || getPwdStrength(newPwd).label === 'Weak' || isPwdUpdaing}
                          className="w-full py-2.5 bg-gray-900 text-white font-bold rounded-xl disabled:bg-gray-300 transition-colors"
                        >
                          {isPwdUpdaing ? 'Updating...' : 'Update Password'}
                        </button>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Active Sessions */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <AnimatePresence>
                          {sessions.map(s => (
                            <motion.div key={s.id} initial={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                {s.device.includes('Phone') ? <Smartphone className="w-5 h-5 text-gray-400" /> : <Laptop className="w-5 h-5 text-gray-400"/>}
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{s.device} {s.isCurrent && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1 font-bold">This device</span>}</p>
                                  <p className="text-xs text-gray-500">{s.active}</p>
                                </div>
                              </div>
                              {!s.isCurrent && (
                                <button onClick={() => removeSession(s.id)} className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-2 py-1 rounded">Log Out</button>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      {sessions.length > 1 && (
                        <button onClick={signOutAllOther} className="mt-4 w-full py-2 border border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
                          Sign Out All Other Devices
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* SECTION 3: NOTIFICATIONS */}
        <section>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setExpandedSection(expandedSection === 'notifs' ? null : 'notifs')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900 text-sm">Notifications</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'notifs' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'notifs' && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100">
                  <div className="p-5 space-y-6">
                    {/* Item 1: New Assignment (Locked) */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900">New Delivery Assigned</h4>
                          <Lock className="w-3 h-3 text-gray-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">This notification cannot be turned off. You must be notified of new assignments.</p>
                      </div>
                      <div className="w-11 h-6 bg-brand-500 rounded-full relative opacity-50 cursor-not-allowed shrink-0" title="Required — cannot be disabled">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                      </div>
                    </div>

                    <hr className="border-gray-50" />

                    {/* Item 2: Delivery Reminder */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex-1 pr-4">
                          <h4 className="text-sm font-bold text-gray-900">Delivery Reminder</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Reminders if you haven't updated your delivery status in a while.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input type="checkbox" className="sr-only peer" checked={notifs.deliveryReminder} onChange={(e) => handleNotificationChange('deliveryReminder', e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                        </label>
                      </div>
                      {notifs.deliveryReminder && (
                        <div className="bg-gray-50 p-2 rounded-lg flex items-center justify-between mt-2 max-w-xs">
                          {['Push', 'SMS', 'Both'].map(type => (
                            <button 
                              key={type} 
                              onClick={() => handleNotificationChange('reminderChannel', type)}
                              className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${notifs.reminderChannel === type ? 'bg-white text-brand-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <hr className="border-gray-50" />

                    {/* Item 3: Pharmacy Messages */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex-1 pr-4">
                          <h4 className="text-sm font-bold text-gray-900">Messages from Pharmacy</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Notifications when your pharmacy sends you a message.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input type="checkbox" className="sr-only peer" checked={notifs.pharmacyMessages} onChange={(e) => handleNotificationChange('pharmacyMessages', e.target.checked)} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                        </label>
                      </div>
                      {notifs.pharmacyMessages && (
                        <div className="bg-gray-50 p-2 rounded-lg flex items-center justify-between mt-2 max-w-xs relative">
                          {['Push', 'SMS', 'Both'].map(type => (
                            <button 
                              key={type} 
                              onClick={() => handleNotificationChange('messagesChannel', type)}
                              className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${notifs.messagesChannel === type ? 'bg-white text-brand-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Linked Pharmacy */}
        <section>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Linked Pharmacy</h2>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{profile.pharmacyName}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1 mb-1"><MapPin className="w-3 h-3"/> {profile.pharmacyAddress}</p>
              </div>
              <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Verified</div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">To change your linked pharmacy, your new employer must register your phone number, and you must verify it through support.</p>
            </div>
          </div>
        </section>

        {/* Sign Out */}
        <section className="pt-2">
          <button 
            onClick={handleSignOut}
            className="w-full py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors shadow-sm"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </section>
      </div>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none w-full max-w-sm px-4"
          >
            <div className="bg-gray-900 text-white text-sm font-medium py-3 px-4 rounded-xl shadow-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              {toastMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AVATAR UPLOAD MENU */}
      <AnimatePresence>
        {showAvatarMenu && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60" onClick={() => setShowAvatarMenu(false)} />
            <motion.div initial={{y: '100%'}} animate={{y:0}} exit={{y:'100%'}} className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative z-10">
              <h3 className="text-lg font-bold text-gray-900 mb-4 whitespace-nowrap overflow-hidden text-ellipsis">Update Profile Photo</h3>
              <div className="space-y-3">
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl border border-gray-200 flex justify-center items-center gap-2">
                  <Camera className="w-5 h-5" /> Take Photo
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold rounded-xl border border-gray-200 flex justify-center items-center gap-2">
                  <Store className="w-5 h-5" /> Choose from Gallery
                </button>
                {profile.avatarUrl && (
                  <button 
                    onClick={() => {
                      setProfile(prev => ({...prev, avatarUrl: ''}));
                      setShowAvatarMenu(false);
                      setToastMsg('Profile photo removed');
                    }} 
                    className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl flex justify-center items-center gap-2"
                  >
                    <X className="w-5 h-5" /> Remove Photo
                  </button>
                )}
                <button onClick={() => setShowAvatarMenu(false)} className="w-full py-3 text-gray-500 font-bold mt-2">Cancel</button>
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleAvatarSelect} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHONE CHANGE MODAL */}
      <AnimatePresence>
        {showPhoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60" onClick={() => setShowPhoneModal(false)} />
            <motion.div initial={{scale: 0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} className="bg-white w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {phoneStep === 1 ? 'Change Phone Number' : 'Verify Phone Number'}
              </h3>
              
              {phoneStep === 1 && (
                <>
                  <p className="text-sm text-gray-600 mb-6">Current number: <span className="font-bold">+251 9{(profile.phoneNumber).substring(1, 4).replace(/./g, '×')} {(profile.phoneNumber).substring(4, 7).replace(/./g, '×')} {(profile.phoneNumber).substring(7)}</span></p>
                  <label className="block text-xs font-bold text-gray-700 mb-1">New phone number</label>
                  <div className="flex flex-col gap-1 mb-6">
                    <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500">
                      <span className="bg-gray-50 border-r border-gray-300 px-3 py-3 text-gray-500 font-bold text-sm">+251</span>
                      <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value.replace(/[^0-9]/g, ''))} className="flex-1 px-3 py-3 outline-none w-full" placeholder="9XX XXX XXX" />
                    </div>
                    {formErrors.newPhone && <p className="text-xs text-red-500">{formErrors.newPhone}</p>}
                    <p className="text-[10px] text-gray-500 mt-1">A verification code will be sent to your new number.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={() => setShowPhoneModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleSendPhoneCode} disabled={isPhoneLoading} className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl disabled:opacity-70 transition-colors shadow-md">
                      {isPhoneLoading ? 'Sending...' : 'Send Code'}
                    </button>
                  </div>
                </>
              )}

              {phoneStep === 2 && (
                <>
                  <p className="text-sm text-gray-600 mb-6">Enter the 6-digit code sent to +251 {newPhone}</p>
                  <div className="flex gap-2 justify-between mb-4">
                    {phoneOtp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-profile-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          let val = e.target.value;
                          if (val.length > 1) val = val.substring(0, 1);
                          if (!/^\d*$/.test(val)) return;
                          const newOtp = [...phoneOtp];
                          newOtp[index] = val;
                          setPhoneOtp(newOtp);
                          if (val && index < 5) document.getElementById(`otp-profile-${index + 1}`)?.focus();
                        }}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                      />
                    ))}
                  </div>
                  {formErrors.otp && <p className="text-xs text-red-500 mb-4">{formErrors.otp}</p>}
                  
                  <p className="text-xs font-bold text-gray-400 text-center mb-6">10:00 <span className="font-normal">— Resend Code</span></p>

                  <div className="flex gap-3">
                    <button onClick={() => setPhoneStep(1)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">Back</button>
                    <button onClick={handleVerifyPhone} disabled={phoneOtp.join('').length < 6} className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white font-bold rounded-xl transition-colors shadow-md">
                      Verify
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
