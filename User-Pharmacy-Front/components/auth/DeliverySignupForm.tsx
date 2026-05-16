'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, Eye, EyeOff, Search, CheckCircle, AlertTriangle, FileText, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { authApi, setupTokenRefresh, type PublicPharmacyOption } from '@/lib/auth-api';

type DeliverySignupFormProps = {
  onBack: () => void;
};

function normalizeSignupPhone(localPart: string): string {
  const d = localPart.replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('251')) return `+${d.slice(0, 12)}`;
  if (d.length === 9 && d.startsWith('9')) return `+251${d}`;
  if (d.length === 10 && d.startsWith('0')) return `+251${d.slice(1)}`;
  return `+251${d}`;
}

export default function DeliverySignupForm({ onBack }: DeliverySignupFormProps) {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nationalId, setNationalId] = useState('');
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [licensePlate, setLicensePlate] = useState('');
  const [pharmacyQuery, setPharmacyQuery] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<PublicPharmacyOption | null>(null);
  const [pharmacyStatus, setPharmacyStatus] = useState<'idle' | 'verified' | 'not-found'>('idle');
  const [searchResults, setSearchResults] = useState<PublicPharmacyOption[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [otpVerifyError, setOtpVerifyError] = useState<string | null>(null);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);
  const [deliverySendSubmitting, setDeliverySendSubmitting] = useState(false);
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  useEffect(() => {
    const q = pharmacyQuery.trim();
    if (q.length === 0) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    const id = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const items = await authApi.fetchPublicPharmacies(pharmacyQuery);
        setSearchResults(items);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [pharmacyQuery]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (showOtp && otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [showOtp, otpCountdown]);

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: '', color: 'bg-gray-200' };
    if (password.length < 8) return { label: language === 'en' ? 'Weak' : 'ደካማ', color: 'bg-red-500' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { label: language === 'en' ? 'Strong' : 'ጠንካራ', color: 'bg-green-500' };
    return { label: language === 'en' ? 'Fair' : 'መካከለኛ', color: 'bg-yellow-500' };
  };
  const passStrength = getPasswordStrength();
  const passwordsMatch = password && confirmPassword ? password === confirmPassword : true;

  const handlePharmacySelect = (pharmacy: PublicPharmacyOption) => {
    setSelectedPharmacy(pharmacy);
    setPharmacyQuery(pharmacy.businessName);
    setPharmacyStatus('verified');
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isFormValid =
    fullName.trim().length >= 3 &&
    emailOk &&
    phone.trim().length >= 8 &&
    password.length >= 8 &&
    passwordsMatch &&
    nationalId.trim().length > 0 &&
    (vehicleType === 'Bicycle' || vehicleType === 'On Foot' || licensePlate.trim().length > 0) &&
    pharmacyStatus === 'verified' &&
    agreedTerms;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSendCodeError(null);
    setDeliverySendSubmitting(true);
    try {
      await authApi.sendDeliverySignupVerification(email.trim());
      setOtp(['', '', '', '', '', '']);
      setOtpCountdown(60);
      setShowOtp(true);
    } catch (err) {
      setSendCodeError(err instanceof Error ? err.message : 'Could not send verification email');
    } finally {
      setDeliverySendSubmitting(false);
    }
  };

  const handleResendDeliveryOtp = async () => {
    setOtpVerifyError(null);
    setDeliverySendSubmitting(true);
    try {
      await authApi.sendDeliverySignupVerification(email.trim());
      setOtpCountdown(60);
    } catch (err) {
      setOtpVerifyError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setDeliverySendSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.substring(0, 1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.join('').length !== 6 || !selectedPharmacy) return;
    setOtpVerifyError(null);
    setOtpSubmitting(true);
    try {
      const normalizedPhone = normalizeSignupPhone(phone);
      const response = await authApi.registerDelivery({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: normalizedPhone,
        nationalId: nationalId.trim(),
        vehicleType,
        licensePlate: licensePlate.trim() || undefined,
        pharmacyId: selectedPharmacy._id,
        language: language === 'am' ? 'am' : 'en',
        verificationCode: otp.join(''),
      });
      authApi.storeAuthData(response);
      setupTokenRefresh();
      localStorage.setItem('medcare_role', 'delivery');
      localStorage.setItem('medcare_user_name', fullName.trim());
      localStorage.setItem('medcare_delivery_phone', phone);
      localStorage.setItem('medcare_delivery_pharmacy', selectedPharmacy.businessName);
      router.push('/delivery');
    } catch (e) {
      setOtpVerifyError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setOtpSubmitting(false);
    }
  };

  if (showOtp) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setShowOtp(false)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> {language === 'en' ? 'Back' : 'ተመለስ'}
        </button>
        
        <h1 className="text-3xl font-serif text-brand-950 mb-2">{t('signup.verifyAccount')}</h1>
        <p className="text-gray-500 mb-8 max-w-sm leading-relaxed">
          {language === 'en'
            ? `We've sent a 6-digit code to ${email.trim()}`
            : `ወደ ${email.trim()} ባለ 6 አሃዝ ኮድ ልከናል።`}
        </p>

        {otpVerifyError && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-4">{otpVerifyError}</div>
        )}

        <div className="flex gap-3 justify-between mb-8 max-w-sm">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => handleVerifyOtp()}
          disabled={otp.join('').length !== 6 || otpSubmitting}
          className="w-full bg-brand-900 hover:bg-brand-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md"
        >
          {otpSubmitting ? '…' : language === 'en' ? 'Verify Account' : 'መለያ ያረጋግጡ'}
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {language === 'en' ? "Didn't receive it? " : 'አልደረሰዎትም? '}
            {otpCountdown > 0 ? (
              <span className="font-medium text-gray-700">
                {language === 'en'
                  ? `Resend in ${otpCountdown}s`
                  : `እንደገና በ ${otpCountdown} ሰከንድ`}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendDeliveryOtp}
                disabled={deliverySendSubmitting}
                className="font-bold text-brand-700 hover:text-brand-900"
              >
                {language === 'en' ? 'Resend code' : 'ኮድ እንደገና ላክ'}
              </button>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> {language === 'en' ? 'Back' : 'ተመለስ'}
      </button>
      
      <h1 className="text-3xl font-serif text-brand-950 mb-2">
        {language === 'en' ? 'Delivery Personnel' : 'አድራሽ'}
      </h1>
      <p className="text-gray-500 mb-8">
        {language === 'en' 
          ? 'Sign up to deliver medications on behalf of a registered pharmacy.'
          : 'በተመዘገበ ፋርማሲ ስም መድሃኒቶችን ለማድረስ ይመዝገቡ።'
        }
      </p>

      {sendCodeError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm mb-4">{sendCodeError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{language === 'en' ? 'Full Name' : 'ሙሉ ስም'}</label>
          <input 
            type="text" 
            required
            minLength={3}
            maxLength={100}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="block w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" 
            placeholder={language === 'en' ? 'Enter your full name' : 'ሙሉ ስምዎን ያስገቡ'} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">
            {language === 'en' ? 'Email' : 'ኢሜይል'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              placeholder={language === 'en' ? 'you@example.com' : 'you@example.com'}
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            {language === 'en'
              ? 'We will send your signup verification code to this address and use it for login.'
              : 'የማረጋገጫ ኮድ እዚህ ይላካል እና ለመግባት ይጠቀማል።'}
          </p>
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
              required 
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
              }}
              placeholder="9XX XXX XXX"
              className="w-full h-full px-4 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500">
            {language === 'en' ? 'Must match the number your pharmacy registered.' : 'ፋርማሲዎ ካስመዘገበው ቁጥር ጋር መዛመድ አለበት።'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{t('signup.patient.password')}</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" 
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
          
          {password.length > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-1 flex-1 mr-4">
                <div className={`h-1.5 flex-1 rounded-full ${password.length > 0 ? passStrength.color : 'bg-gray-200'}`}></div>
                <div className={`h-1.5 flex-1 rounded-full ${password.length >= 8 ? passStrength.color : 'bg-gray-200'}`}></div>
                <div className={`h-1.5 flex-1 rounded-full ${passStrength.label === 'Strong' || passStrength.label === 'ጠንካራ' ? passStrength.color : 'bg-gray-200'}`}></div>
              </div>
              <span className={`text-xs font-bold ${passStrength.label === 'Weak' || passStrength.label === 'ደካማ' ? 'text-red-500' : (passStrength.label === 'Strong' || passStrength.label === 'ጠንካራ' ? 'text-green-500' : 'text-yellow-500')}`}>
                {passStrength.label}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{language === 'en' ? 'Confirm Password' : 'የይለፍ ቃል ያረጋግጡ'}</label>
          <input 
            type={showPassword ? "text" : "password"} 
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`block w-full px-4 py-3.5 bg-white border rounded-xl text-gray-900 focus:ring-2 focus:outline-none transition-colors ${
              !passwordsMatch && confirmPassword.length > 0 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:ring-brand-500 focus:border-brand-500'
            }`} 
            placeholder="••••••••" 
          />
          {!passwordsMatch && confirmPassword.length > 0 && (
            <p className="mt-1.5 text-xs font-medium text-red-500">
              {language === 'en' ? 'Passwords do not match' : 'የይለፍ ቃላት አይዛመዱም'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">{language === 'en' ? 'National ID Number' : 'ብሔራዊ መታወቂያ ቁጥር'}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              required
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" 
              placeholder={language === 'en' ? 'Enter your Ethiopian National ID' : 'የኢትዮጵያ ብሄራዊ መታወቂያ ቁጥር ያስገቡ'} 
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-bold text-gray-700 mb-1.5">{language === 'en' ? 'Vehicle Type' : 'የተሽከርካሪ አይነት'}</label>
           <div className="relative">
             <select
               value={vehicleType}
               onChange={(e) => setVehicleType(e.target.value)}
               className="block w-full pl-4 pr-10 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors appearance-none"
             >
               <option value="Motorcycle">Motorcycle</option>
               <option value="Bicycle">Bicycle</option>
               <option value="On Foot">On Foot</option>
               <option value="Three-Wheeler (Bajaj)">Three-Wheeler (Bajaj)</option>
               <option value="Car">Car</option>
             </select>
             <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
               <ChevronDown className="h-5 w-5 text-gray-400" />
             </div>
           </div>
        </div>

        {(vehicleType === 'Motorcycle' || vehicleType === 'Three-Wheeler (Bajaj)' || vehicleType === 'Car') && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">{language === 'en' ? 'Vehicle License Plate' : 'የተሽከርካሪ ታርጋ ቁጥር'}</label>
            <input 
              type="text" 
              required
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              className="block w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors uppercase" 
              placeholder="e.g., AA 12345" 
            />
          </div>
        )}

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">{language === 'en' ? 'Your Employer Pharmacy' : 'ቀጣሪ ፋርማሲዎ'}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={pharmacyQuery}
                onChange={(e) => {
                  setPharmacyQuery(e.target.value);
                  setSelectedPharmacy(null);
                  setPharmacyStatus('idle');
                }}
                className={`block w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-gray-900 focus:ring-2 focus:outline-none transition-colors ${
                  pharmacyStatus === 'not-found' ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-brand-500 focus:border-brand-500'
                }`} 
                placeholder={language === 'en' ? 'Type to search pharmacy name...' : 'የፋርማሲ ስም ይፈልጉ...'} 
              />
            </div>

            {/* Dropdown for approved pharmacies from API */}
            {pharmacyQuery.length > 0 && !selectedPharmacy && (
              <div className="mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden relative z-10 max-h-48 overflow-y-auto">
                {searchLoading && (
                  <div className="px-4 py-3 text-sm text-gray-500">{language === 'en' ? 'Searching…' : 'በመፈለግ ላይ…'}</div>
                )}
                {!searchLoading &&
                  searchResults.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => handlePharmacySelect(p)}
                    >
                      <div className="font-bold text-gray-900">{p.businessName}</div>
                      <div className="text-xs text-gray-500">{p.address || p.location || p.phone}</div>
                    </button>
                  ))}
                {!searchLoading && searchResults.length === 0 && pharmacyQuery.length > 1 && (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    {language === 'en' ? 'No pharmacies match your search.' : 'ምንም ፋርማሲ አልተገኘም።'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verification Status */}
          {pharmacyStatus === 'verified' && (
            <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-800 font-medium leading-relaxed">
                {language === 'en'
                  ? `✓ Selected — ${selectedPharmacy?.businessName}`
                  : `✓ ተመርጧል — ${selectedPharmacy?.businessName}`}
              </p>
            </div>
          )}

          {pharmacyStatus === 'not-found' && (
            <div className="flex items-start gap-2 bg-red-50 p-3 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800 font-medium leading-relaxed">
                {language === 'en'
                  ? 'This pharmacy has not registered your phone number as a delivery agent. Please ask your pharmacy manager to add you in their Deliveries dashboard before signing up.'
                  : 'ይህ ፋርማሲ ስልክ ቁጥርዎን እንደ አድራሽ አላስመዘገበም። እባክዎ ከመመዝገብዎ በፊት የፋርማሲዎ ስራ አስኪያጅ በማድረሻ ዳሽቦርድ ውስጥ እንዲያክሉዎት ይጠይቁ።'
                }
              </p>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 mt-6">
          <input 
            id="terms" 
            type="checkbox" 
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            className="mt-1 w-5 h-5 text-brand-600 rounded bg-gray-100 border-gray-300 focus:ring-brand-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            {language === 'en' ? 'I agree to the MED-CARE Ethiopia ' : 'በሜድ-ኬር ኢትዮጵያ '}
            <a href="#" className="font-bold text-brand-700 hover:text-brand-900 border-b border-brand-200">
              {language === 'en' ? 'Terms of Service' : 'የአገልግሎት ውሎች'}
            </a>
            {language === 'en' ? ' and ' : ' እና '}
            <a href="#" className="font-bold text-brand-700 hover:text-brand-900 border-b border-brand-200">
              {language === 'en' ? 'Privacy Policy' : 'የግላዊነት ፖሊሲ'}
            </a>
            {language === 'am' && ' እስማማለሁ'}
          </label>
        </div>

        <button 
          type="submit" 
          disabled={!isFormValid || deliverySendSubmitting}
          className="w-full bg-brand-900 hover:bg-brand-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md mt-4"
        >
          {deliverySendSubmitting ? '…' : language === 'en' ? 'Create Delivery Account' : 'የማድረሻ አካውንት ይፍጠሩ'}
        </button>
      </form>
    </div>
  );
}
