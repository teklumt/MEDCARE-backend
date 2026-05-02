'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, User, Store, ArrowLeft, Mail, Lock, Phone, UserCircle, FileText, ChevronRight, Eye, EyeOff, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import PharmacySignupForm from '@/components/auth/PharmacySignupForm';

type SignupStep = 'role' | 'patient' | 'pharmacy' | 'admin';

export default function SignupPage() {
  const [step, setStep] = useState<SignupStep>('role');
  const [showPatientPassword, setShowPatientPassword] = useState(false);
  const [showPharmacyPassword, setShowPharmacyPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [patientUsername, setPatientUsername] = useState('');
  const [pharmacyUsername, setPharmacyUsername] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = (lang: 'en' | 'am') => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientUsername) {
      localStorage.setItem('medcare_user_name', patientUsername);
    }
    localStorage.setItem('medcare_role', 'patient');
    // In a real app, handle registration logic here
    router.push('/dashboard');
  };

  const handlePharmacySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pharmacyUsername) {
      localStorage.setItem('medcare_username', pharmacyUsername);
    }
    localStorage.setItem('medcare_role', 'pharmacy');
    // In a real app, handle registration logic here
    router.push('/pharmacy'); // Or a specific pharmacy dashboard
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername) {
      localStorage.setItem('medcare_username', adminUsername);
    }
    localStorage.setItem('medcare_role', 'admin');
    // In a real app, handle registration logic here
    router.push('/admin');
  };

  return (
    <main className="min-h-screen flex bg-accent-50">
      {/* Left Side - Form Area */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12">
        <div className="mx-auto w-full max-w-md">
          
          {/* Header Area */}
          <div className="flex items-center justify-between mb-12">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-900 rounded-full flex items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">M</span>
              </div>
              <span className="font-heading font-bold text-xl text-brand-900 tracking-tight">
                MED-CARE
              </span>
            </Link>

            {/* Language Dropdown */}
            <div className="relative z-50">
              <button 
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <Globe className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-bold text-brand-950">{language === 'en' ? 'EN' : 'አማ'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <button 
                    onClick={() => toggleLanguage('en')}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === 'en' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => toggleLanguage('am')}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === 'am' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'}`}
                  >
                    አማርኛ
                  </button>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* STEP 1: ROLE SELECTION */}
            {step === 'role' && (
              <motion.div
                key="role"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Link 
                  href="/"
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                </Link>
                <h1 className="text-3xl md:text-4xl font-serif text-brand-950 mb-3">{t('signup.title')}</h1>
                <p className="text-gray-500 mb-8">{t('signup.subtitle')}</p>

                <div className="space-y-4">
                  <button
                    onClick={() => setStep('patient')}
                    className="w-full group flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{t('signup.role.patient.title')}</h3>
                      <p className="text-sm text-gray-500">{t('signup.role.patient.desc')}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                  </button>

                  <button
                    onClick={() => setStep('pharmacy')}
                    className="w-full group flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{t('signup.role.pharmacy.title')}</h3>
                      <p className="text-sm text-gray-500">{t('signup.role.pharmacy.desc')}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                  </button>

                  <button
                    onClick={() => setStep('admin')}
                    className="w-full group flex items-center p-6 bg-white border-2 border-gray-100 rounded-2xl hover:border-brand-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{t('signup.role.admin.title')}</h3>
                      <p className="text-sm text-gray-500">{t('signup.role.admin.desc')}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 transition-colors" />
                  </button>
                </div>

                <p className="mt-8 text-center text-sm text-gray-500">
                  {t('signup.alreadyHaveAccount')}{' '}
                  <Link href="/login" className="font-bold text-brand-700 hover:text-brand-900 transition-colors">
                    {t('signup.login')}
                  </Link>
                </p>
              </motion.div>
            )}

            {/* STEP 2: PATIENT FORM */}
            {step === 'patient' && (
              <motion.div
                key="patient"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => setStep('role')}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> {t('signup.patient.back')}
                </button>
                
                <h1 className="text-3xl font-serif text-brand-950 mb-2">{t('signup.patient.title')}</h1>
                <p className="text-gray-500 mb-8">{t('signup.patient.subtitle')}</p>

                <form onSubmit={handlePatientSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.patient.username')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        name="patientUsername"
                        autoComplete="username"
                        required 
                        value={patientUsername}
                        onChange={(e) => setPatientUsername(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" 
                        placeholder="johndoe" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.patient.email')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input type="email" name="patientEmail" autoComplete="email" required className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="john@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.patient.phone')}</label>
                    <div className="flex items-center border border-gray-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500 rounded-xl bg-white overflow-hidden transition-colors h-[50px]">
                      <div className="flex items-center gap-2 pl-4 pr-3 border-r border-gray-100 bg-gray-50 h-[50px] shrink-0">
                        <span className="text-lg leading-none" role="img" aria-label="Ethiopia flag">🇪🇹</span>
                        <span className="text-sm font-bold text-gray-500">+251</span>
                      </div>
                      <input 
                        type="tel"
                        name="patientPhone" 
                        autoComplete="tel" 
                        required 
                        placeholder="91 234 5678"
                        className="w-full h-full px-4 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.patient.password')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type={showPatientPassword ? "text" : "password"} 
                        name="patientPassword"
                        autoComplete="new-password"
                        required 
                        className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" 
                        placeholder="••••••••" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPatientPassword(!showPatientPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPatientPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-brand-900 hover:bg-brand-800 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md mt-4">
                    {t('signup.patient.submit')}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STEP 2: PHARMACY FORM */}
            {step === 'pharmacy' && (
              <motion.div
                key="pharmacy"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <PharmacySignupForm onBack={() => setStep('role')} />
              </motion.div>
            )}
            {/* STEP 3: ADMIN FORM */}
            {step === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <button 
                  onClick={() => setStep('role')}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> {t('signup.admin.back')}
                </button>
                
                <h1 className="text-3xl font-serif text-brand-950 mb-2">{t('signup.admin.title')}</h1>
                <p className="text-gray-500 mb-8">{t('signup.admin.subtitle')}</p>

                <form onSubmit={handleAdminSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.admin.username')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" 
                        placeholder="admin_user" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.admin.email')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input type="email" required className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="admin@medcare.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.admin.key')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Shield className="h-5 w-5 text-gray-400" />
                      </div>
                      <input type="text" required className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="Enter authorization key" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.admin.password')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type={showAdminPassword ? "text" : "password"} 
                        required 
                        className="block w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" 
                        placeholder="••••••••" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showAdminPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md mt-4">
                    {t('signup.admin.submit')}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side - Image/Branding Area (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 bg-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-900/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-16 text-white">
          <h2 className="text-4xl font-serif mb-4 leading-tight" dangerouslySetInnerHTML={{ __html: t('signup.banner.title') }}></h2>
          <p className="text-brand-200 text-lg max-w-md">
            {t('signup.banner.desc')}
          </p>
        </div>
      </div>
    </main>
  );
}
