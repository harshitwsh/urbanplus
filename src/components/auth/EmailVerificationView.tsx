import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Send, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';

export const EmailVerificationView: React.FC = () => {
  const { user, sendVerificationEmail, checkEmailVerification, logout } = useAuth();
  const { setActiveTab } = useApp();

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>({
    type: 'info',
    text: 'Account created! Please check your email inbox and click the verification link.'
  });

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
          text: 'Email not verified yet. Please click the link in the email sent by Firebase and try again.'
        });
      }
    } catch (err: any) {
      console.error('Error checking verification:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Could not verify status. Please try again.'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setMessage(null);
    try {
      await sendVerificationEmail();
      setMessage({
        type: 'success',
        text: 'A fresh verification email has been sent. Please check your inbox and spam folder.'
      });
    } catch (err: any) {
      console.error('Error resending email:', err);
      if (err.code === 'auth/too-many-requests') {
        setMessage({
          type: 'error',
          text: 'Too many requests sent recently. Please wait a moment before trying again.'
        });
      } else {
        setMessage({
          type: 'error',
          text: err.message || 'Failed to resend verification email.'
        });
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setActiveTab('login');
  };

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
            <p className="text-[10px] text-[#64748B] font-mono">SIH26124 • AUTHENTICATION VERIFICATION</p>
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
          {/* Email Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] mx-auto flex items-center justify-center text-[#2563EB] shadow-xs">
            <Mail className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#172033] tracking-tight">
              Verify Your Email
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed">
              We have sent a verification email to:
            </p>
            <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg font-mono text-xs font-bold text-[#2563EB] truncate">
              {user?.email || 'your registered email'}
            </div>
          </div>

          {/* Alert Message Box */}
          {message && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start space-x-2.5 text-left ${
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
              <span className="leading-relaxed">{message.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 font-sans">
            <button
              onClick={handleCheckVerified}
              disabled={isChecking}
              className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking Verification...' : "I've Verified My Email"}</span>
            </button>

            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full py-2.5 bg-[#FFFFFF] hover:bg-[#F8FAFC] disabled:opacity-60 text-[#172033] border border-[#CBD5E1] text-xs font-medium rounded-lg transition flex items-center justify-center space-x-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{isResending ? 'Sending Email...' : 'Resend Verification Email'}</span>
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
