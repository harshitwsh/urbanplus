import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Building2, 
  ShieldCheck, 
  Bus, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';
import { Logo } from '../common/Logo';

type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

export const LoginView: React.FC<{ initialMode?: AuthMode }> = ({ initialMode }) => {
  const { login, signup, resetPassword, signInWithGoogle, demoAccounts } = useAuth();
  const { activeTab, setActiveTab } = useApp();

  const [mode, setMode] = useState<AuthMode>(() => {
    if (initialMode) return initialMode;
    if (activeTab === 'signup') return 'SIGNUP';
    if (activeTab === 'forgot_password') return 'FORGOT_PASSWORD';
    return 'LOGIN';
  });

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [organization, setOrganization] = useState<string>('');
  const [staySignedIn, setStaySignedIn] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'signup') setMode('SIGNUP');
    else if (activeTab === 'forgot_password') setMode('FORGOT_PASSWORD');
    else if (activeTab === 'login') setMode('LOGIN');
  }, [activeTab]);

  const validateEmail = (emailStr: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation for Signup
    if (mode === 'SIGNUP') {
      if (!fullName.trim()) {
        setErrorMessage('Full Name is required.');
        return;
      }
      if (!email.trim() || !validateEmail(email)) {
        setErrorMessage('Please provide a valid email address (e.g. name@domain.com).');
        return;
      }
      if (!password) {
        setErrorMessage('Password is required.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Confirm Password does not match Password.');
        return;
      }
    }

    // Validation for Login
    if (mode === 'LOGIN') {
      if (!email.trim() || !validateEmail(email)) {
        setErrorMessage('Please provide a valid email address.');
        return;
      }
      if (!password) {
        setErrorMessage('Please enter your password.');
        return;
      }
    }

    // Validation for Forgot Password
    if (mode === 'FORGOT_PASSWORD') {
      if (!email.trim() || !validateEmail(email)) {
        setErrorMessage('Please enter a valid email address to receive password reset instructions.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'LOGIN') {
        const userCred = await login(email, password, staySignedIn);
        // If email is not verified, redirect to email verification screen
        if (!userCred.emailVerified) {
          setActiveTab('verify_email');
        } else {
          setActiveTab('command_center');
        }
      } else if (mode === 'SIGNUP') {
        const userCred = await signup(
          email, 
          password, 
          fullName.trim(), 
          organization.trim() || 'UrbanPulse',
          staySignedIn
        );
        // After signup with email verification sent, direct to verify_email screen
        setActiveTab('verify_email');
      } else if (mode === 'FORGOT_PASSWORD') {
        await resetPassword(email);
        setSuccessMessage('Password reset link sent to your email. Please check your inbox and spam folder.');
      }
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      let message = 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please verify your credentials or use Google Sign-In.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email address already exists. Please Sign In instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password is too weak. Please use at least 6 characters with a mix of letters and numbers.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email address format.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Access temporarily disabled due to many failed attempts. Try again later or reset password.';
      } else if (err.code === 'auth/network-request-failed') {
        message = 'Network connection issue. Please check your internet connection.';
      } else if (err.message) {
        message = err.message;
      }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await signInWithGoogle(staySignedIn);
      setActiveTab('command_center');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setErrorMessage(err.message || 'Google Sign-In was unable to complete. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoAccount = (demoAcc: typeof demoAccounts[0]) => {
    setEmail(demoAcc.email);
    setPassword(demoAcc.password);
    setMode('LOGIN');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col justify-between p-6 md:p-12 font-sans select-none">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <Logo size="navbar" clickable={false} />
          <div className="hidden sm:block border-l border-[#E2E8F0] pl-2.5 ml-1">
            <p className="text-[10px] text-[#64748B] font-mono font-semibold">BEL / SIH26124 DEMONSTRATION</p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('landing')}
          className="text-xs text-[#64748B] hover:text-[#172033] font-medium"
        >
          ← Product Overview
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="max-w-6xl mx-auto w-full my-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Side Visual */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#EFF6FF] border border-[#BFDBFE] rounded-full text-xs text-[#1D4ED8] font-mono font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>BEL GOVERNMENT-GRADE INTELLIGENCE PLATFORM</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight">
            See your city.<br />
            Before problems become crises.
          </h1>

          <p className="text-sm text-[#64748B] leading-relaxed max-w-lg">
            Transforming existing public transport fleets into distributed mobile AI sensing networks connected with real-time Firebase backend intelligence.
          </p>

          {/* Animated Route & Sensing Visual Box */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-lg space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#E2E8F0] pb-2">
              <span className="font-bold text-[#2563EB]">LIVE FIREBASE AUTH & FIRESTORE</span>
              <span className="text-[#059669]">● REALTIME BACKEND ONLINE</span>
            </div>

            <div className="h-40 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] relative overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-30">
                <pattern id="login-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#login-grid)" />
                <path d="M 20 50 Q 150 20 300 120" fill="none" stroke="#2563EB" strokeWidth="3" strokeDasharray="5,4" />
              </svg>

              <div className="absolute top-6 left-12 px-2 py-0.5 bg-[#2563EB] text-white rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md">
                <Bus className="w-3 h-3" />
                <span>BUS-104 @ Golf Course Rd</span>
              </div>

              <div className="absolute bottom-8 right-16 px-2 py-0.5 bg-[#0F9D8A] text-white rounded text-[10px] font-mono font-bold flex items-center space-x-1 shadow-md">
                <AlertTriangle className="w-3 h-3" />
                <span>Multi-Pass Pothole (96.7%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Authentication Panel */}
        <div className="lg:col-span-5">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 md:p-8 space-y-5 shadow-xl">
            {/* Official Logo Banner */}
            <div className="flex flex-col items-center justify-center pb-1">
              <Logo size="auth" clickable={false} />
            </div>

            {/* Header / Mode Switcher */}
            <div className="space-y-1">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2.5">
                <button
                  type="button"
                  onClick={() => { setMode('LOGIN'); setActiveTab('login'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`text-sm font-bold transition pb-1 relative ${
                    mode === 'LOGIN' ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  Sign In
                  {mode === 'LOGIN' && <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#2563EB]" />}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('SIGNUP'); setActiveTab('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                  className={`text-sm font-bold transition pb-1 relative ${
                    mode === 'SIGNUP' ? 'text-[#2563EB]' : 'text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  Create Account
                  {mode === 'SIGNUP' && <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#2563EB]" />}
                </button>
              </div>

              <p className="text-xs text-[#64748B] pt-1">
                {mode === 'LOGIN' && 'Sign in to access the UrbanPulse Command Center'}
                {mode === 'SIGNUP' && 'Create your official UrbanPulse operator account'}
                {mode === 'FORGOT_PASSWORD' && 'Reset your UrbanPulse account password'}
              </p>
            </div>

            {/* Error / Success Notifications */}
            {errorMessage && (
              <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg text-xs text-[#DC2626] flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs text-[#059669] flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
              {/* Full Name (Sign Up only) */}
              {mode === 'SIGNUP' && (
                <div className="space-y-1">
                  <label className="text-[#64748B] font-mono text-[10px] uppercase font-semibold block">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. Officer Rajesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-2 text-[#172033] focus:outline-none focus:border-[#2563EB]"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Organization (Sign Up only) */}
              {mode === 'SIGNUP' && (
                <div className="space-y-1">
                  <label className="text-[#64748B] font-mono text-[10px] uppercase font-semibold block">Organization</label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="e.g. UrbanPulse / GMDA"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-2 text-[#172033] focus:outline-none focus:border-[#2563EB]"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[#64748B] font-mono text-[10px] uppercase font-semibold block">Email</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="authority@gurugram.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-2 text-[#172033] focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              {mode !== 'FORGOT_PASSWORD' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[#64748B] font-mono text-[10px] uppercase font-semibold block">Password</label>
                    {mode === 'LOGIN' && (
                      <button
                        type="button"
                        onClick={() => { setMode('FORGOT_PASSWORD'); setActiveTab('forgot_password'); setErrorMessage(null); setSuccessMessage(null); }}
                        className="text-[10px] text-[#2563EB] hover:underline font-mono"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-2 text-[#172033] focus:outline-none focus:border-[#2563EB]"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Confirm Password (Sign Up only) */}
              {mode === 'SIGNUP' && (
                <div className="space-y-1">
                  <label className="text-[#64748B] font-mono text-[10px] uppercase font-semibold block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#8290A3] absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-md pl-9 pr-3 py-2 text-[#172033] focus:outline-none focus:border-[#2563EB]"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Stay Signed In Checkbox */}
              {mode !== 'FORGOT_PASSWORD' && (
                <div className="flex items-center space-x-2 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer select-none text-xs text-[#526174]">
                    <input
                      type="checkbox"
                      checked={staySignedIn}
                      onChange={(e) => setStaySignedIn(e.target.checked)}
                      className="w-4 h-4 text-[#2563EB] rounded border-[#CBD5E1] focus:ring-[#2563EB] accent-[#2563EB]"
                    />
                    <span>Stay signed in on this device</span>
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-md transition flex items-center justify-center space-x-1.5 shadow-sm mt-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'LOGIN' && 'Sign In'}
                      {mode === 'SIGNUP' && 'Create Account'}
                      {mode === 'FORGOT_PASSWORD' && 'Send Password Reset Link'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Toggle Link to Create Account or Sign In */}
              <div className="text-center pt-1 text-xs">
                {mode === 'LOGIN' && (
                  <p className="text-[#64748B]">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('SIGNUP'); setActiveTab('signup'); setErrorMessage(null); setSuccessMessage(null); }}
                      className="text-[#2563EB] font-semibold hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                )}
                {mode === 'SIGNUP' && (
                  <p className="text-[#64748B]">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('LOGIN'); setActiveTab('login'); setErrorMessage(null); setSuccessMessage(null); }}
                      className="text-[#2563EB] font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </p>
                )}
                {mode === 'FORGOT_PASSWORD' && (
                  <button
                    type="button"
                    onClick={() => { setMode('LOGIN'); setActiveTab('login'); setErrorMessage(null); setSuccessMessage(null); }}
                    className="text-[#64748B] hover:text-[#172033]"
                  >
                    ← Back to Sign In
                  </button>
                )}
              </div>
            </form>

            {/* Google Authentication */}
            <div className="pt-2 border-t border-[#E2E8F0] space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2 bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#172033] border border-[#CBD5E1] text-xs font-semibold rounded-md transition flex items-center justify-center space-x-2 shadow-xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Pre-configured Demo Credentials */}
              <div className="pt-2">
                <span className="text-[10px] font-mono text-[#8290A3] uppercase font-bold block mb-1.5">
                  PRE-CONFIGURED DEMO CREDENTIALS
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectDemoAccount(acc)}
                      className="px-2 py-1 bg-[#F8FAFC] hover:bg-[#EFF6FF] hover:border-[#2563EB] border border-[#E2E8F0] rounded text-left transition"
                    >
                      <span className="font-semibold text-[#172033] block text-[10px] truncate">{acc.name}</span>
                      <span className="text-[#64748B] text-[9px] font-mono block truncate">{acc.role.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-[10px] text-[#8290A3] font-mono block text-center pt-1">
                UrbanPulse Firebase Production Cluster (urbanpulse-2026)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#64748B] font-mono">
        BEL / SIH26124 • AI-Powered Mobile Urban Intelligence Platform
      </div>
    </div>
  );
};
