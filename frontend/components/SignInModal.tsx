'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, UserPlus, LogIn, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  
  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'operations' | 'admin' | 'support_agent'>('customer');
  const [regPassword, setRegPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleStaffLogin = async (roleEmail: string, roleName?: string, userRole?: string) => {
    setLoading(true);
    try {
      await signIn('credentials', {
        email: roleEmail,
        name: roleName || roleEmail.split('@')[0],
        role: userRole || (roleEmail.includes('ops') ? 'operations' : roleEmail.includes('admin') ? 'admin' : roleEmail.includes('agent') ? 'support_agent' : 'customer'),
        password: 'password123',
        redirect: false,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regName) return;

    setLoading(true);
    try {
      await signIn('credentials', {
        email: regEmail,
        name: regName,
        role: regRole,
        password: regPassword || 'password123',
        redirect: false,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Check if Google OAuth ID environment variable is provided
    const hasGoogleEnv = Boolean(process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_ID);
    if (!hasGoogleEnv) {
      setGoogleNotice(
        "Google OAuth keys (AUTH_GOOGLE_ID) are not configured in frontend/.env.local. You can paste your Google Client ID into .env.local, or use 'Create Account' below to sign in instantly!"
      );
      return;
    }

    signIn('google');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#201515]/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fffefb] w-full max-w-md rounded-xl p-6 sm:p-8 shadow-2xl border border-[#c5c0b1] relative space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-[#605d52] hover:text-[#201515] hover:bg-[#f8f4f0] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#201515] text-[#fffefb] flex items-center justify-center mb-2">
            <ShieldCheck className="w-7 h-7 text-[#ff4f00]" />
          </div>
          <span className="zapier-eyebrow block text-xs">PORTAL AUTHENTICATION</span>
          <h2 className="text-2xl font-semibold text-[#201515]">ResolveOS Account</h2>
          <p className="text-[#605d52] text-xs sm:text-sm">
            Sign in to access your customer orders or staff operation console.
          </p>
        </div>

        {/* Modal Header Tabs */}
        <div className="flex bg-[#f8f4f0] p-1.5 rounded-xl border border-[#c5c0b1]/60">
          <button
            onClick={() => { setActiveTab('signin'); setGoogleNotice(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'signin' ? 'bg-[#201515] text-[#fffefb] shadow-sm' : 'text-[#605d52] hover:text-[#201515]'
            }`}
          >
            Sign In / Quick Login
          </button>
          <button
            onClick={() => { setActiveTab('register'); setGoogleNotice(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'register' ? 'bg-[#201515] text-[#fffefb] shadow-sm' : 'text-[#605d52] hover:text-[#201515]'
            }`}
          >
            Create New Account
          </button>
        </div>

        {googleNotice && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Google OAuth Setup Notice</span>
            </div>
            <p className="text-[11px] text-amber-800">{googleNotice}</p>
          </div>
        )}

        {activeTab === 'signin' ? (
          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-[#201515] hover:bg-[#f8f4f0] text-[#201515] font-semibold text-sm transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.25 21.36 7.34 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#c5c0b1] w-full" />
              <span className="bg-[#fffefb] px-3 text-[10px] uppercase font-bold text-[#939084] shrink-0">Or Select Quick Account Role</span>
              <div className="border-t border-[#c5c0b1] w-full" />
            </div>

            {/* Quick Staff & Customer Role Selection */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleStaffLogin('sarah.jenkins@example.com', 'Sarah Jenkins', 'customer')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#f8f4f0] hover:bg-[#e8e2d8] border border-[#c5c0b1] text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-[#201515] block">Customer Account (Sarah Jenkins)</span>
                  <span className="text-[11px] text-[#605d52]">Customer portal: orders, claims & return status</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#ff4f00] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleStaffLogin('ops@resolveos.com', 'Operations Lead', 'operations')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#201515] hover:bg-[#2f2a26] text-[#fffefb] text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-[#fffefb] block">Operations Lead (Judge Role)</span>
                  <span className="text-[11px] text-[#c5c0b1]">Authorizes $200+ high-value refund approvals</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#ff4f00] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleStaffLogin('admin@resolveos.com', 'Admin Supervisor', 'admin')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#f8f4f0] hover:bg-[#e8e2d8] border border-[#c5c0b1] text-left transition-all group"
              >
                <div>
                  <span className="text-xs font-bold text-[#201515] block">Admin Supervisor</span>
                  <span className="text-[11px] text-[#605d52]">Full system & policy administration</span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#201515] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          /* Create New Account Registration Form */
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#201515] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="zapier-input w-full text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#201515] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. alex.morgan@example.com"
                className="zapier-input w-full text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#201515] mb-1">Account Role / Access Type</label>
              <select
                value={regRole}
                onChange={(e: any) => setRegRole(e.target.value)}
                className="zapier-input w-full text-xs font-medium bg-[#fffefb]"
              >
                <option value="customer">Customer (End-User Portal)</option>
                <option value="operations">Operations Lead (Judge Console & Approvals)</option>
                <option value="support_agent">Support Agent (Tier 2 Escalations)</option>
                <option value="admin">Admin Supervisor (Full Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#201515] mb-1">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="zapier-input w-full text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="zapier-btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-xs disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Creating Account...' : 'Register Account & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
