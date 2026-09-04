import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  Inbox, 
  AlertTriangle 
} from 'lucide-react';

export const EmailVerificationView: React.FC = () => {
  const { user, sendVerificationEmail, checkEmailVerification, logout } = useAuth();
  const { setActiveTab } = useApp();

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>({
    type: 'info',
    text: "We've sent a verification link to your email. Please check your Inbox and Spam folder."
  });

  // 60-second cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // "I've Verified My Email" button handler
  const handleCheckVerified = async () => {
    setIsChecking(true);
    setMessage(null);
    try {
      const verified = await checkEmailVerification();
      if (verified) {
        setMessage({
          type: 'success',
          text: 'Email verified successfully! Redirecting to Command Center...'
        });
        setTimeout(() => {
          setActiveTab('command_center');
        }, 1200);
      } else {
        setMessage({
          type: 'error',
          text: 'Your email is not verified yet. Please click the verification link in your email.'
        });
      }
    } catch (err: any) {
      console.error('Error checking verification:', err);
      let errorText = 'Could not verify status. Please click the link in your email and try again.';
      if (err.code === 'auth/network-request-failed') {
        errorText = 'Network connection failed. Please check your internet connection.';
      } else if (err.message) {
        errorText = err.message;
      }
      setMessage({
        type: 'error',
        text: errorText
      });
    } finally {
      setIsChecking(false);
    }
  };

  // "Resend Verification Email" button handler with 60-second cooldown
  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setMessage(null);

    try {
      await sendVerificationEmail();
      setCooldown(60); // Start 60-second cooldown
      setMessage({
        type: 'success',
        text: 'A fresh verification email has been sent. Please check your Inbox and Spam folder.'
      });
    } catch (err: any) {
      console.error('Error resending email:', err);
      let errorText = 'Failed to resend verification email.';

      if (err.code === 'auth/too-many-requests') {
        errorText = 'Too many requests sent recently. Please wait a few moments before requesting another email.';
        setCooldown(60);
      } else if (err.code === 'auth/network-request-failed') {
        errorText = 'Network connection error. Please check your internet connection.';
      } else if (err.code === 'auth/invalid-email') {
        errorText = 'The registered email address is invalid.';
      } else if (err.message) {
        errorText = err.message;
      }

      setMessage({
        type: 'error',
        text: errorText
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setActiveTab('login');
  };

  const userEmail = user?.email || 'your registered email';

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col justify-between p-6 md:p-12 font-sans select-none">
      {/* Top Brand Bar */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white text-sm font-mono shadow-sm">
            UP
          </div>
          <div>
            <h1 className="font-bold text-base text-[#172033]">URBANPULSE</h1>
            <p className="text-[10px] text-[#64748B] font-mono">SIH26124 • FIREBASE AUTHENTICATION</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="text-xs text-[#64748B] hover:text-[#DC2626] font-medium flex items-center space-x-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Verification Card */}
      <div className="max-w-md mx-auto w-full my-auto">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 md:p-8 space-y-6 shadow-xl text-center">
          {/* Email Icon Animation */}
          <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] mx-auto flex items-center justify-center text-[#2563EB] shadow-xs">
            <Mail className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Verify Your Email
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              We've sent a verification link to your email address:
            </p>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-xs font-bold text-[#2563EB] truncate">
              {userEmail}
            </div>
          </div>

          {/* Inbox & Spam Instructions */}
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 text-[11px] text-[#64748B] space-y-1.5 text-left">
            <div className="flex items-center space-x-1.5 font-semibold text-[#172033]">
              <Inbox className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Next Steps:</span>
            </div>
            <p>1. Open your email inbox and click the verification link from Firebase.</p>
            <p>2. If you don't see it in your primary inbox, please check your <b>Spam</b> or <b>Junk</b> folder.</p>
            <p>3. Once clicked, return here and tap <b>"I've Verified My Email"</b> below.</p>
          </div>

          {/* Dynamic Alert Message Box */}
          {message && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 text-left transition-all ${
              message.type === 'success' 
                ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]' 
                : message.type === 'error'
                ? 'bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]'
                : 'bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : message.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{message.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 font-sans">
            {/* Primary Action: I've Verified My Email */}
            <button
              onClick={handleCheckVerified}
              disabled={isChecking}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verifying with Firebase...' : "I've Verified My Email"}</span>
            </button>

            {/* Secondary Action: Resend Verification Email (with 60s cooldown) */}
            <button
              onClick={handleResend}
              disabled={isResending || cooldown > 0}
              className={`w-full py-2.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] disabled:opacity-60 text-[#172033] border border-[#CBD5E1] text-xs font-medium rounded-lg transition flex items-center justify-center space-x-2 shadow-xs ${
                cooldown > 0 ? 'cursor-not-allowed text-[#94A3B8]' : ''
              }`}
            >
              {cooldown > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#94A3B8] animate-spin" />
                  <span>Resend in {cooldown}s</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{isResending ? 'Sending Email...' : 'Resend Verification Email'}</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Note */}
          <div className="pt-2 border-t border-[#E2E8F0] text-[11px] text-[#64748B]">
            <span>Need to use a different email? </span>
            <button
              onClick={handleSignOut}
              className="text-[#2563EB] font-semibold hover:underline"
            >
              Sign in with another account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#64748B] font-mono">
        BEL / SIH26124 • Secure Urban Intelligence Authentication
      </div>
    </div>
  );
};
