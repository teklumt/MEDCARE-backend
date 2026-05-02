'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Globe, ChevronDown, CheckCircle2, ChevronLeft, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { authApi, setupTokenRefresh } from '@/lib/auth-api';

const translations = {
  en: {
    tagline: "Your health. Your pharmacy. Your language.",
    phone: "Phone Number",
    email: "Email Address",
    or: "or",
    password: "Password",
    forgot: "Forgot password?",
    signIn: "Sign In",
    signingIn: "Signing in...",
    noAccount: "Don't have an account?",
    createOne: "Create one",
    secure: "🔒 Your connection is secure and encrypted.",
    emptyPhoneEmail: "Please enter your phone number or email.",
    emptyPassword: "Please enter your password.",
    invalidCreds: "Incorrect phone number or password. Please try again.",
    mfaHeader: "Two-Factor Authentication",
    mfaInstr: "Enter the 6-digit code from your authenticator app.",
    verify: "Verify",
    backupCode: "Use a backup code instead",
    totpCode: "Use authenticator app instead",
    backToLogin: "Back to login",
    resetPhoneInstr: "Enter your registered phone number and we will send you a reset code.",
    sendResetCode: "Send Reset Code",
    codeSentMsg: "If this number is registered, you will receive a code shortly.",
    resend: "Resend code",
    setNewPassword: "Set New Password",
    confirmNewPassword: "Confirm new password",
    newPasswordLabel: "New password",
    passwordRules: "Minimum 8 characters, at least one number, and one uppercase letter.",
    passwordMismatch: "Passwords do not match.",
    mfaIncorrect: "Incorrect code. Please try again.",
    otpIncorrect: "Incorrect OTP. Please try again.",
    unknownError: "Something went wrong. Please check your connection and try again.",
    successReset: "Password reset successful! Please log in.",
    codeEntryTitle: "Enter Verification Code",
    codeEntryDesc: "We've sent a 6-digit code to your phone number.",
    lockError: "Your account has been temporarily locked for security. Please try again in 30 minutes or reset your password.",
    welcomeBack: "Welcome back",
    resetPasswordTitle: "Reset password",
    checkYourPhone: "Check your phone",
    newPasswordTitle: "New password",
    secureLogin: "Secure login",
    signInToAccess: "Sign in to access your account.",
    backToHome: "Home",
  },
  am: {
    tagline: "ጤናዎ። ፋርማሲዎ። ቋንቋዎ።",
    phone: "ስልክ ቁጥር",
    email: "ኢሜይል አድራሻ",
    or: "ወይም",
    password: "የምስጢር ቃል",
    forgot: "የምስጢር ቃል ረሱ?",
    signIn: "ግባ",
    signingIn: "እየገባ ነው...",
    noAccount: "መለያ የለዎትም?",
    createOne: "ይፍጠሩ",
    secure: "🔒 ግንኙነትዎ ደህንነቱ የተጠበቀ ነው።",
    emptyPhoneEmail: "ስልክ ቁጥር ወይም ኢሜይል ያስገቡ።",
    emptyPassword: "የምስጢር ቃል ያስገቡ።",
    invalidCreds: "ስልክ ቁጥር ወይም የምስጢር ቃል ትክክል አይደለም።",
    mfaHeader: "ሁለት-ደረጃ ማረጋገጫ",
    mfaInstr: "ከ authenticator መተግበሪያዎ 6-አሃዝ ኮድ ያስገቡ።",
    verify: "አረጋግጥ",
    backupCode: "የመጠባበቂያ ኮድ ይጠቀሙ",
    totpCode: "በauthenticator መተግበሪያ ይጠቀሙ",
    backToLogin: "ወደ መግቢያው ተመለስ",
    resetPhoneInstr: "ስልክ ቁጥርዎን ያስገቡ።",
    sendResetCode: "ኮድ ላክ",
    codeSentMsg: "ይህ ስልክ ከተመዘገበ ኮዱን በቅርቡ ይቀበላሉ።",
    resend: "እንደገና ላክ",
    setNewPassword: "አዲስ የምስጢር ቃል ያስገቡ",
    confirmNewPassword: "አዲሱን የምስጢር ቃል ያረጋግጡ",
    newPasswordLabel: "አዲስ የምስጢር ቃል",
    passwordRules: "ቢያንስ 8 ፊደላት፣ ቢያንስ አንድ ቁጥር፣ እና አንድ ትልቅ ፊደል (uppercase) ያስፈልጋል።",
    passwordMismatch: "የምስጢር ቃሎቹ አይመሳሰሉም።",
    mfaIncorrect: "ትክክል ያልሆነ ኮድ። እባክዎ እንደገና ይሞክሩ።",
    otpIncorrect: "ትክክል ያልሆነ ኮድ። እባክዎ እንደገና ይሞክሩ።",
    unknownError: "ችግር ተፈጥሯል። እንደገና ይሞክሩ።",
    successReset: "የምስጢር ቃል በተሳካ ሁኔታ ተቀይሯል! እባክዎ ይግቡ።",
    codeEntryTitle: "የማረጋገጫ ኮድ ያስገቡ",
    codeEntryDesc: "ወደ ስልክ ቁጥርዎ 6-አሃዝ ኮድ ልከናል::",
    lockError: "መለያዎ ለ 30 ደቂቃ ተዘግቷል።",
    welcomeBack: "እንኳን ደህና መጡ",
    resetPasswordTitle: "የምስጢር ቃል ይቀይሩ",
    checkYourPhone: "ስልክዎን ያረጋግጡ",
    newPasswordTitle: "አዲሱ የምስጢር ቃል",
    secureLogin: "ደህንነቱ የተጠበቀ መግቢያ",
    signInToAccess: "ወደ መለያዎ ለመግባት እባክዎ መረጃዎን ያስገቡ።",
    backToHome: "ወደ መነሻ",
  }
};

type ViewState = 'login' | 'forgot-phone' | 'forgot-otp' | 'forgot-new' | 'mfa';

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const tLocal = translations[language as 'en' | 'am'] || translations['en'];

  const [view, setView] = useState<ViewState>('login');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Error states
  const [phoneEmailError, setPhoneEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // MFA states
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const mfaRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [mfaMode, setMfaMode] = useState<'totp' | 'backup'>('totp');
  const [backupCode, setBackupCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaAttempts, setMfaAttempts] = useState(0);
  const [pendingRole, setPendingRole] = useState<'admin'|'pharmacy'>('pharmacy');
  const [pendingUser, setPendingUser] = useState('');

  // Forgot states
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const forgotRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetTimer, setResetTimer] = useState(60);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (view === 'forgot-otp' && resetTimer > 0) {
      interval = setInterval(() => setResetTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [view, resetTimer]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 3) val = val.slice(0, 3) + ' ' + val.slice(3);
    if (val.length > 7) val = val.slice(0, 7) + ' ' + val.slice(7);
    setPhone(val.slice(0, 11));
    if (phoneEmailError) setPhoneEmailError('');
    if (generalError) setGeneralError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (phoneEmailError) setPhoneEmailError('');
    if (generalError) setGeneralError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError('');
    if (generalError) setGeneralError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneEmailError('');
    setPasswordError('');
    setGeneralError('');

    let isValid = true;
    const identifier = email || phone.replace(/\s/g, '');
    
    if (!identifier) {
      setPhoneEmailError(tLocal.emptyPhoneEmail);
      isValid = false;
    }
    if (!password) {
      setPasswordError(tLocal.emptyPassword);
      isValid = false;
    }
    if (!isValid) return;

    setIsLoading(true);

    try {
      // For admin login, we need email format
      let loginEmail = identifier;
      
      // If it's a phone number, handle differently
      if (/^\+?251\d{9}$/.test(identifier.replace(/\s/g, ''))) {
        // This is a phone number, but admin backend expects email
        setGeneralError('Admin login requires email address, not phone number.');
        setIsLoading(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginEmail)) {
        setGeneralError('Please enter a valid email address for admin login.');
        setIsLoading(false);
        return;
      }

      console.log('Attempting login with:', loginEmail);

      // Try to login with backend API
      const response = await authApi.login({
        email: loginEmail,
        password: password
      });

      console.log('Login response:', response);

      // Store authentication data
      authApi.storeAuthData(response);
      
      // Redirect based on user role
      const userRole = response.data.user.role;
      
      if (userRole === 'admin') {
        // Setup token refresh for admin
        setupTokenRefresh();
        router.push('/admin');
      } else if (userRole === 'pharmacy') {
        // Pharmacy users go to pharmacy dashboard
        router.push('/pharmacy');
      } else if (userRole === 'delivery') {
        // Delivery users go to delivery dashboard
        router.push('/delivery');
      } else {
        // Regular patients go to user dashboard
        router.push('/dashboard');
      }

    } catch (error: any) {
      setIsLoading(false);
      
      // Handle specific error cases
      if (error.message.includes('Invalid credentials')) {
        setGeneralError(tLocal.invalidCreds);
      } else if (error.message.includes('Account locked')) {
        setGeneralError(tLocal.lockError);
      } else if (error.message.includes('MFA required')) {
        // Handle MFA requirement
        setPendingUser(loginEmail);
        setView('mfa');
      } else if (error.message.includes('Invalid email format')) {
        setGeneralError('Please enter a valid email address.');
      } else {
        setGeneralError(error.message || tLocal.unknownError);
      }
    }
  };

  const handleMfaSubmit = async () => {
    setMfaError('');
    setIsLoading(true);

    try {
      const code = mfaMode === 'totp' ? mfaCode.join('') : backupCode;
      
      const response = await authApi.verifyMFA({
        email: pendingUser,
        code: code,
        type: mfaMode
      });

      // Store authentication data
      authApi.storeAuthData(response);
      
      // Setup token refresh
      setupTokenRefresh();
      
      // Redirect based on role
      if (response.data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      setIsLoading(false);
      const att = mfaAttempts + 1;
      setMfaAttempts(att);
      
      if (att >= 5) {
        setView('login');
        setGeneralError('Too many failed attempts. Please try logging in again.');
      } else {
        setMfaError(error.message || tLocal.mfaIncorrect);
      }
    }
  };

  const handleMfaChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...mfaCode];
    newCode[index] = value;
    setMfaCode(newCode);
    setMfaError('');

    if (value && index < 5) {
      mfaRefs.current[index + 1]?.focus();
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      mfaRefs.current[index - 1]?.focus();
    }
  };

  const handleForgotPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 3) val = val.slice(0, 3) + ' ' + val.slice(3);
    if (val.length > 7) val = val.slice(0, 7) + ' ' + val.slice(7);
    setForgotPhone(val.slice(0, 11));
    setGeneralError('');
  };

  const handleSendReset = () => {
    if (!forgotPhone) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setGeneralError(tLocal.codeSentMsg); // We show this as a "general message" or use success state
      setView('forgot-otp');
      setResetTimer(60);
    }, 800);
  };

  const handleForgotOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...forgotOtp];
    newCode[index] = value;
    setForgotOtp(newCode);
    setGeneralError('');

    if (value && index < 5) {
      forgotRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      forgotRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyResetOtp = () => {
    if (forgotOtp.join('').length < 6) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (forgotOtp.join('') === '000000') {
        setGeneralError(tLocal.otpIncorrect);
      } else {
        setView('forgot-new');
        setGeneralError('');
      }
    }, 800);
  };

  const handleSetNewPassword = () => {
    setGeneralError('');
    if (newPassword !== confirmPassword) {
      setGeneralError(tLocal.passwordMismatch);
      return;
    }
    // simple regex check
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
      setGeneralError(tLocal.passwordRules);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg(tLocal.successReset);
      setView('login');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setForgotPhone('');
      setForgotOtp(['', '', '', '', '', '']);
    }, 800);
  };

  const isPhoneActive = email.trim() === '';
  const isEmailActive = phone.trim() === '';

  return (
    <main className="min-h-screen flex flex-row-reverse selection:bg-brand-500 selection:text-white font-sans">
      
      {/* RIGHT SIDE - BRANDING */}
      <div className="hidden lg:flex w-[45%] xl:w-1/2 bg-brand-900 relative flex-col justify-between p-12 overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-800/50 blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-brand-950/50 blur-3xl opacity-60"></div>
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-emerald-500/10 blur-3xl"></div>
        


        {/* Hero Text */}
        <div className="relative z-10 mb-12 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="font-serif text-5xl text-white leading-tight mb-6">
            Connecting you to better health, instantly.
          </h1>
          <p className="text-brand-100/90 text-lg leading-relaxed font-medium">
            From managing prescriptions to locating nearby pharmacies, Med-Care Ethiopia brings comprehensive healthcare directly to your fingertips.
          </p>
        </div>
      </div>

      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col relative bg-accent-50 overflow-y-auto">
        
        {/* Header Area */}
        <div className="w-full max-w-[420px] mx-auto flex items-center justify-between mb-8 mt-4 pt-4 sm:pt-8 w-full">
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
              <span className="text-sm font-bold text-brand-950">
                {language === 'en' ? 'EN' : 'አማ'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                <button 
                  onClick={() => { setLanguage('en'); setIsLangDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === 'en' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => { setLanguage('am'); setIsLangDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-brand-50 transition-colors ${language === 'am' ? 'text-brand-600 bg-brand-50/50' : 'text-gray-700'}`}
                >
                  አማርኛ
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center px-6 sm:px-12 lg:px-16 pb-12 w-full">
          <div className="w-full max-w-[420px] flex flex-col">
            
            <Link 
              href="/"
              className="flex items-center text-sm font-medium text-gray-500 hover:text-brand-700 transition-colors mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> {tLocal.backToHome}
            </Link>
            
            {/* Title above form */}
            <div className="hidden lg:block mb-8">
              <h2 className="font-heading font-bold text-3xl text-brand-950 mb-2">{
                view === 'login' ? tLocal.welcomeBack :
                view === 'forgot-phone' ? tLocal.resetPasswordTitle :
                view === 'forgot-otp' ? tLocal.checkYourPhone :
                view === 'forgot-new' ? tLocal.newPasswordTitle :
                tLocal.secureLogin
              }</h2>
              <p className="text-gray-500 font-medium">{view === 'login' ? tLocal.signInToAccess : ''}</p>
            </div>

            {/* Content Area */}
            <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 relative">
              
              {successMsg && view === 'login' && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{successMsg}</p>
                </div>
              )}

              {generalError && (
                 <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-start gap-3 animate-in shake duration-300">
                   <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                   <p className="text-sm font-medium">{generalError}</p>
                 </div>
              )}

              {/* VIEW: LOGIN */}
              {view === 'login' && (
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">{tLocal.phone}</label>
                    <div className={`flex items-center border ${phoneEmailError ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'} rounded-2xl bg-white overflow-hidden transition-all h-14 ${!isPhoneActive ? 'opacity-50 bg-gray-50' : ''}`}>
                      <div className="flex items-center gap-2 pl-4 pr-3 border-r border-gray-100 bg-gray-50 h-full shrink-0">
                        <span className="text-lg leading-none" role="img" aria-label="Ethiopia flag">🇪🇹</span>
                        <span className="text-sm font-bold text-gray-500">+251</span>
                      </div>
                      <input 
                        type="tel"
                        disabled={!isPhoneActive}
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="91 234 5678"
                        className="w-full h-full px-4 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal disabled:text-gray-400"
                      />
                    </div>
                    {phoneEmailError && (
                      <div className="flex items-center gap-1.5 mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-medium">{phoneEmailError}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-px bg-gray-100 flex-1"></div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{tLocal.or}</span>
                    <div className="h-px bg-gray-100 flex-1"></div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">{tLocal.email}</label>
                    <div className={`flex items-center border ${phoneEmailError ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'} rounded-2xl bg-white overflow-hidden transition-all h-14 ${!isEmailActive ? 'opacity-50 bg-gray-50' : ''}`}>
                      <div className="pl-4 shrink-0">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="email"
                        disabled={!isEmailActive}
                        value={email}
                        onChange={handleEmailChange}
                        placeholder="name@example.com"
                        autoComplete="email"
                        className="w-full h-full px-3 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal disabled:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="relative mt-2">
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-sm font-bold text-gray-700">{tLocal.password}</label>
                       <button type="button" onClick={() => { setView('forgot-phone'); setGeneralError(''); }} className="text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors">
                         {tLocal.forgot}
                       </button>
                    </div>
                    
                    <div className={`flex items-center border ${passwordError ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'} rounded-2xl bg-white overflow-hidden transition-all h-14`}>
                      <div className="pl-4 shrink-0">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="w-full h-full px-3 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="pr-4 shrink-0 text-gray-400 hover:text-gray-600 transition-colors h-full flex items-center"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordError && (
                      <div className="flex items-center gap-1.5 mt-2 text-red-500">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="text-xs font-medium">{passwordError}</span>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-brand-900 hover:bg-brand-800 active:bg-brand-950 text-white rounded-full font-bold text-lg transition-colors mt-4 flex justify-center items-center h-14 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{tLocal.signingIn}</span>
                      </div>
                    ) : (
                      tLocal.signIn
                    )}
                  </button>
                  
                  <div className="text-center mt-4">
                    <p className="text-sm font-medium text-gray-600">
                      {tLocal.noAccount}{' '}
                      <Link href="/signup" className="text-brand-600 hover:text-brand-800 font-bold transition-colors">
                        {tLocal.createOne}
                      </Link>
                    </p>
                  </div>
                </form>
              )}

              {/* VIEW: FORGOT PHONE */}
              {view === 'forgot-phone' && (
                <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => setView('login')} className="w-fit flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> {tLocal.backToLogin}
                  </button>
                  
                  <h2 className="text-xl font-bold text-gray-900">{tLocal.forgot}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{tLocal.resetPhoneInstr}</p>

                  <div className="relative mt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">{tLocal.phone}</label>
                    <div className="flex items-center border border-gray-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 rounded-2xl bg-white overflow-hidden transition-all h-14">
                      <div className="flex items-center gap-2 pl-4 pr-3 border-r border-gray-100 bg-gray-50 h-full shrink-0">
                        <span className="text-lg leading-none" role="img" aria-label="Ethiopia flag">🇪🇹</span>
                        <span className="text-sm font-bold text-gray-500">+251</span>
                      </div>
                      <input 
                        type="tel"
                        value={forgotPhone}
                        onChange={handleForgotPhoneChange}
                        placeholder="91 234 5678"
                        className="w-full h-full px-4 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleSendReset}
                    disabled={isLoading || forgotPhone.replace(/\D/g, '').length !== 9}
                    className="w-full bg-brand-900 hover:bg-brand-800 text-white rounded-full font-bold text-lg transition-colors mt-4 flex justify-center items-center h-14 disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : tLocal.sendResetCode}
                  </button>
                </div>
              )}

              {/* VIEW: FORGOT OTP */}
              {view === 'forgot-otp' && (
                <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-200">
                   <button onClick={() => setView('login')} className="w-fit flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> {tLocal.backToLogin}
                  </button>

                  <h2 className="text-xl font-bold text-gray-900">{tLocal.codeEntryTitle}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{tLocal.codeEntryDesc}</p>

                  <div className="flex justify-between gap-2 mt-4">
                    {forgotOtp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { forgotRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleForgotOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleForgotOtpKeyDown(i, e)}
                        className="w-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <button 
                    type="button" 
                    onClick={handleVerifyResetOtp}
                    disabled={isLoading || forgotOtp.join('').length < 6}
                    className="w-full bg-brand-900 hover:bg-brand-800 text-white rounded-full font-bold text-lg transition-colors mt-6 flex justify-center items-center h-14 disabled:opacity-50 shadow-md transform hover:shadow-lg"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : tLocal.verify}
                  </button>

                  <div className="text-center mt-2">
                    {resetTimer > 0 ? (
                       <span className="text-sm font-medium text-gray-500">00:{resetTimer < 10 ? `0${resetTimer}` : resetTimer}</span>
                    ) : (
                       <button onClick={() => setResetTimer(60)} className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors">
                         {tLocal.resend}
                       </button>
                    )}
                  </div>
                </div>
              )}

              {/* VIEW: FORGOT NEW PASSWORD */}
              {view === 'forgot-new' && (
                <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-200">
                   <button onClick={() => setView('login')} className="w-fit flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> {tLocal.backToLogin}
                  </button>

                  <h2 className="text-xl font-bold text-gray-900">{tLocal.setNewPassword}</h2>
                  <p className="text-xs text-gray-500 leading-relaxed">{tLocal.passwordRules}</p>

                  <div className="relative mt-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">{tLocal.newPasswordLabel}</label>
                    <div className="flex items-center border border-gray-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 rounded-2xl bg-white overflow-hidden transition-all h-14">
                      <div className="pl-4 shrink-0">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setGeneralError(''); }}
                        placeholder="••••••••"
                        className="w-full h-full px-3 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="pr-4 shrink-0 text-gray-400 hover:text-gray-600 transition-colors h-full flex items-center"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-bold text-gray-700 mb-2">{tLocal.confirmNewPassword}</label>
                    <div className="flex items-center border border-gray-200 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 rounded-2xl bg-white overflow-hidden transition-all h-14">
                      <div className="pl-4 shrink-0">
                        <CheckCircle2 className={`w-5 h-5 ${confirmPassword && newPassword === confirmPassword ? 'text-emerald-500' : 'text-gray-400'}`} />
                      </div>
                      <input 
                        type={showNewPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setGeneralError(''); }}
                        placeholder="••••••••"
                        className="w-full h-full px-3 bg-transparent outline-none text-gray-900 font-medium placeholder:text-gray-400 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleSetNewPassword}
                    disabled={isLoading || !newPassword || !confirmPassword}
                    className="w-full bg-brand-900 hover:bg-brand-800 text-white rounded-full font-bold text-lg transition-colors mt-6 flex justify-center items-center h-14 disabled:opacity-50 shadow-md"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : tLocal.setNewPassword}
                  </button>
                </div>
              )}

              {/* VIEW: MFA */}
              {view === 'mfa' && (
                <div className="flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
                   <button onClick={() => { setView('login'); setPassword(''); }} className="w-fit flex items-center text-sm font-bold text-gray-500 hover:text-gray-900 mb-2 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" /> {tLocal.backToLogin}
                  </button>

                  <h2 className="text-xl font-bold text-gray-900">{tLocal.mfaHeader}</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{tLocal.mfaInstr}</p>

                  {mfaError && (
                     <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-start gap-3 mt-2">
                       <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                       <span className="text-sm font-medium">{mfaError}</span>
                     </div>
                  )}

                  {mfaMode === 'totp' ? (
                    <div className="flex justify-between gap-2 mt-4">
                      {mfaCode.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { mfaRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleMfaChange(i, e.target.value)}
                          onKeyDown={(e) => handleMfaKeyDown(i, e)}
                          className="w-12 h-14 bg-gray-50 border border-gray-200 rounded-xl text-center text-xl font-bold text-gray-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="relative mt-4">
                      <input 
                        type="text"
                        value={backupCode}
                        onChange={(e) => { setBackupCode(e.target.value); setMfaError(''); }}
                        placeholder="Enter backup code"
                        className="w-full h-14 px-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-medium focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all"
                      />
                    </div>
                  )}

                  <button 
                    type="button" 
                    onClick={handleMfaSubmit}
                    disabled={isLoading || (mfaMode === 'totp' ? mfaCode.join('').length < 6 : backupCode.length < 6)}
                    className="w-full bg-brand-900 hover:bg-brand-800 text-white rounded-[20px] font-bold text-lg transition-colors mt-6 flex justify-center items-center h-14 disabled:opacity-50"
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : tLocal.verify}
                  </button>

                  <div className="text-center mt-2">
                    <button 
                      onClick={() => { setMfaMode(mfaMode === 'totp' ? 'backup' : 'totp'); setMfaError(''); }} 
                      className="text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors"
                    >
                      {mfaMode === 'totp' ? tLocal.backupCode : tLocal.totpCode}
                    </button>
                  </div>
                </div>
              )}
              
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-1 opacity-60">
            <span className="text-[11px] font-medium text-gray-500 tracking-wide">{tLocal.secure}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
