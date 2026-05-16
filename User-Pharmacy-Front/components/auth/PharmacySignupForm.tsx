'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, Mail, Phone, Lock, Eye, EyeOff, ArrowLeft, FileText, Upload, Calendar, Building, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useRouter } from 'next/navigation';
import { authApi, setupTokenRefresh } from '@/lib/auth-api';

function normalizeSignupPhone(localPart: string): string {
  const d = localPart.replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('251')) return `+${d.slice(0, 12)}`;
  if (d.length === 9 && d.startsWith('9')) return `+251${d}`;
  if (d.length === 10 && d.startsWith('0')) return `+251${d.slice(1)}`;
  return `+251${d}`;
}

export default function PharmacySignupForm({ onBack }: { onBack: () => void }) {
  const { t, language } = useLanguage();
  const router = useRouter();

  // Field states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    license: '',
    expiryDate: '',
    profExpiryDate: '',
    issuingAuthority: '',
    password: ''
  });
  
  // File states
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [professionalLicenseFile, setProfessionalLicenseFile] = useState<File | null>(null);
  const [uploadedDocUrls, setUploadedDocUrls] = useState<{ business?: string; professional?: string }>({});

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState('');
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);

  // Load drafted form data on mount
  useEffect(() => {
    const draft = localStorage.getItem('pharmacy_signup_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Exclude password from restoration
        setFormData(prev => ({ ...prev, ...parsed, password: '' }));
      } catch (e) {}
    }
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.name || formData.email || formData.phone) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Save draft when form data changes
  useEffect(() => {
    const { password, ...draftContent } = formData;
    localStorage.setItem('pharmacy_signup_draft', JSON.stringify(draftContent));
  }, [formData]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const validateField = (name: string, value: string) => {
    let error = '';
    switch (name) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (!/^\+?[0-9\s-]{9,15}$/.test(value)) error = 'Invalid phone number format';
        break;
      case 'license':
        if (value.length < 5) error = 'License must be at least 5 characters';
        break;
      case 'password':
        if (value.length < 8) error = 'Password must be at least 8 characters';
        else if (!/[A-Z]/.test(value)) error = 'Must contain an uppercase letter';
        else if (!/[0-9]/.test(value)) error = 'Must contain a number';
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Auto-format phone number loosely as user types (example)
    if (name === 'phone' && value.length > 0 && !value.startsWith('+')) {
       // Just a simple format example, user can override
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) validateField(name, formattedValue);
  };

  const calculatePasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'license' | 'professionalLicense') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setGlobalError('File must be less than 5MB');
      return;
    }
    
    // Save to localStorage as Base64 so it can be previewed in the Profile section
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'license') {
        localStorage.setItem('medcare_business_license', dataUrl);
      } else if (type === 'professionalLicense') {
        localStorage.setItem('medcare_professional_license', dataUrl);
      }
    };
    reader.readAsDataURL(file);
    
    if (type === 'license') {
      setLicenseFile(file);
    } else {
      setProfessionalLicenseFile(file);
    }
    setGlobalError('');
  };

  const removeFile = (type: 'license' | 'professionalLicense') => {
    if (type === 'license') {
      setLicenseFile(null);
      localStorage.removeItem('medcare_business_license');
    } else {
      setProfessionalLicenseFile(null);
      localStorage.removeItem('medcare_professional_license');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    
    const fieldsToValidate = ['name', 'email', 'phone', 'license', 'password'];
    let isValid = true;
    fieldsToValidate.forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData])) {
        isValid = false;
      }
    });

    if (!isValid) {
      setGlobalError('Please fix the errors in the form before submitting.');
      return;
    }

    if (formData.license && !licenseFile) {
      setGlobalError('Please upload a copy of your Business License.');
      return;
    }
    
    if (formData.license && !professionalLicenseFile) {
      setGlobalError('Please upload a copy of your Professional License.');
      return;
    }

    setIsSubmitting(true);

    try {
      let businessUrl: string | undefined;
      let professionalUrl: string | undefined;
      if (licenseFile) {
        businessUrl = await authApi.uploadPharmacyLicenseFile(licenseFile, 'business');
      }
      if (professionalLicenseFile) {
        professionalUrl = await authApi.uploadPharmacyLicenseFile(professionalLicenseFile, 'professional');
      }
      await authApi.sendPharmacySignupVerification(formData.email.trim());
      setUploadedDocUrls({ business: businessUrl, professional: professionalUrl });
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.substring(0, 1);
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.join('').length < 6) {
      setGlobalError('Please enter all 6 digits of the OTP.');
      return;
    }

    setGlobalError('');
    setIsSubmitting(true);
    try {
      const phone = normalizeSignupPhone(formData.phone);
      const response = await authApi.registerPharmacy({
        businessName: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone,
        businessLicenseNumber: formData.license.trim(),
        issuingAuthority: formData.issuingAuthority.trim() || undefined,
        businessLicenseExpiry: formData.expiryDate || undefined,
        professionalLicenseExpiry: formData.profExpiryDate || undefined,
        businessRegistrationUrl: uploadedDocUrls.business,
        operatingLicenseUrl: uploadedDocUrls.professional,
        language: language === 'am' ? 'am' : 'en',
        verificationCode: otp.join(''),
      });
      authApi.storeAuthData(response);
      setupTokenRefresh();
      localStorage.setItem('medcare_role', 'pharmacy');
      localStorage.setItem('medcare_user_name', formData.name.trim());
      localStorage.removeItem('pharmacy_signup_draft');
      router.push('/pharmacy');
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setGlobalError('');
    setIsSubmitting(true);
    try {
      await authApi.sendPharmacySignupVerification(formData.email.trim());
      setCountdown(60);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'otp') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <h1 className="text-3xl font-serif text-brand-950 mb-2">{t('signup.verifyEmail')}</h1>
        <p className="text-gray-500 mb-8">{t('signup.otpSent').replace('{email}', formData.email)}</p>
        
        {globalError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{globalError}</p>
          </div>
        )}

        <div className="flex gap-2 justify-between">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleOtpChange(idx, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digit && idx > 0) {
                  const prevInput = document.getElementById(`otp-${idx - 1}`);
                  prevInput?.focus();
                }
              }}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            />
          ))}
        </div>

        <button 
          onClick={handleVerifyOtp}
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md mt-4 flex justify-center items-center"
        >
          {isSubmitting ? <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" /> : t('signup.verifyAccount')}
        </button>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {t('signup.didNotReceive')}{' '}
            {countdown > 0 ? (
              <span className="font-medium text-gray-700">{t('signup.resendIn').replace('{countdown}', countdown.toString())}</span>
            ) : (
              <button type="button" onClick={handleResendOtp} className="font-bold text-blue-600 hover:text-blue-800">
                {t('signup.resendCode')}
              </button>
            )}
          </p>
        </div>
      </motion.div>
    );
  }

  const pwdScore = calculatePasswordStrength(formData.password);

  return (
    <div className="space-y-5">
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> {t('signup.pharmacy.back')}
      </button>
      
      <h1 className="text-3xl font-serif text-brand-950 mb-2">{t('signup.pharmacy.title')}</h1>
      <p className="text-gray-500 mb-8">{t('signup.pharmacy.subtitle')}</p>

      {globalError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{globalError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.pharmacy.name')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Store className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              name="name"
              required 
              value={formData.name}
              onChange={handleInputChange}
              className={`block w-full pl-11 pr-4 py-3.5 bg-white border ${errors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors`} 
              placeholder="Kenema Pharmacy" 
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.pharmacy.email')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="email" 
              name="email"
              required 
              value={formData.email}
              onChange={handleInputChange}
              onBlur={(e) => validateField('email', e.target.value)}
              className={`block w-full pl-11 pr-4 py-3.5 bg-white border ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors`} 
              placeholder="contact@pharmacy.com" 
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.pharmacy.phone')}</label>
          <div className={`flex items-center border ${errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500'} rounded-xl bg-white overflow-hidden transition-colors h-[50px]`}>
            <div className="flex items-center gap-2 pl-4 pr-3 border-r border-gray-100 bg-gray-50 h-[50px] shrink-0">
              <span className="text-lg leading-none" role="img" aria-label="Ethiopia flag">🇪🇹</span>
              <span className="text-sm font-bold text-gray-500">+251</span>
            </div>
            <input 
              type="tel" 
              name="phone"
              required 
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={(e) => validateField('phone', e.target.value)}
              placeholder="91 234 5678" 
              className="w-full h-full px-4 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.pharmacy.license')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              name="license"
              required 
              value={formData.license}
              onChange={handleInputChange}
              onBlur={(e) => validateField('license', e.target.value)}
              className={`block w-full pl-11 pr-4 py-3.5 bg-white border ${errors.license ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors`} 
              placeholder="EFDA-LIC-12345" 
            />
          </div>
          {errors.license && <p className="text-red-500 text-xs mt-1">{errors.license}</p>}
        </div>

        {/* Dynamic Fields triggered by license entry */}
        <AnimatePresence>
          {formData.license && formData.license.length >= 5 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="space-y-5 overflow-hidden pt-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Issuing Authority</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      name="issuingAuthority"
                      value={formData.issuingAuthority}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                      placeholder="e.g. EFDA" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Expiry Date of Business License</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="date" 
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Expiry Date of Professional License</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input 
                      type="date" 
                      name="profExpiryDate"
                      value={formData.profExpiryDate}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none" 
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Business License Document *</label>
                  {licenseFile ? (
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500 bg-blue-50 p-1.5 rounded-lg" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{licenseFile.name}</p>
                          <p className="text-xs text-gray-500">{(licenseFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile('license')} className="text-gray-400 hover:text-red-500 p-1">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center justify-center py-6 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <input 
                        type="file" 
                        accept=".pdf,image/jpeg,image/png" 
                        onChange={(e) => handleFileUpload(e, 'license')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">Click to upload Business License</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max. 5MB)</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload Professional License Document *</label>
                  {professionalLicenseFile ? (
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-purple-500 bg-purple-50 p-1.5 rounded-lg" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{professionalLicenseFile.name}</p>
                          <p className="text-xs text-gray-500">{(professionalLicenseFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile('professionalLicense')} className="text-gray-400 hover:text-red-500 p-1">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex flex-col items-center justify-center py-6 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <input 
                        type="file" 
                        accept=".pdf,image/jpeg,image/png" 
                        onChange={(e) => handleFileUpload(e, 'professionalLicense')}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">Click to upload Professional License</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG or PNG (max. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.pharmacy.password')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              required 
              value={formData.password}
              onChange={handleInputChange}
              onBlur={(e) => validateField('password', e.target.value)}
              className={`block w-full pl-11 pr-12 py-3.5 bg-white border ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors`} 
              placeholder="••••••••" 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {/* Password strength indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${pwdScore > 0 ? 'bg-red-500' : 'bg-transparent'} flex-1 transition-all`}></div>
                <div className={`h-full ${pwdScore > 1 ? 'bg-orange-500' : 'bg-transparent'} flex-1 transition-all`}></div>
                <div className={`h-full ${pwdScore > 2 ? 'bg-yellow-500' : 'bg-transparent'} flex-1 transition-all`}></div>
                <div className={`h-full ${pwdScore > 3 ? 'bg-green-500' : 'bg-transparent'} flex-1 transition-all`}></div>
              </div>
              <p className="text-xs mt-1.5 text-gray-500">
                {pwdScore === 0 && 'Too weak'}
                {pwdScore === 1 && 'Weak: Add numbers and uppercase letters'}
                {pwdScore === 2 && 'Fair: Add special characters'}
                {pwdScore > 2 && 'Strong password'}
              </p>
            </div>
          )}
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md mt-4 flex items-center justify-center"
        >
          {isSubmitting ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            t('signup.pharmacy.submit')
          )}
        </button>
      </form>
    </div>
  );
}
