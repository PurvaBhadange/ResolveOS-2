'use client';

import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [googleNotice, setGoogleNotice] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setGoogleNotice(null);
    try {
      await signIn('google', {
        callbackUrl: window.location.origin,
      });
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setGoogleNotice(
        "Could not initiate Google Sign-In. You can sign in using any of the quick-access roles below or create an account."
      );
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-lg border border-neutral-200/90 p-6 sm:p-7 relative space-y-5 max-h-[90vh] overflow-y-auto shadow-panel">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X size={15} strokeWidth={2} />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-neutral-900 text-white font-serif font-bold text-sm flex items-center justify-center shadow-subtle">
              R
            </div>
            <h2 className="text-lg font-serif font-bold tracking-tight text-neutral-900">
              ResolveOS Portal
            </h2>
          </div>
          <p className="font-serif italic text-xs text-neutral-500">
            Sign in to access your verified customer orders or staff operational workspace.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex bg-neutral-100 p-0.5 rounded-md text-xs font-mono tracking-wide uppercase">
          <button
            onClick={() => { setActiveTab('signin'); setGoogleNotice(null); }}
            className={`flex-1 py-1.5 rounded transition-all font-semibold ${
              activeTab === 'signin' ? 'bg-white text-neutral-900 shadow-subtle' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Sign In / Roles
          </button>
          <button
            onClick={() => { setActiveTab('register'); setGoogleNotice(null); }}
            className={`flex-1 py-1.5 rounded transition-all font-semibold ${
              activeTab === 'register' ? 'bg-white text-neutral-900 shadow-subtle' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {googleNotice && (
          <div className="p-3 rounded-md border border-neutral-200 bg-neutral-50 text-neutral-800 text-xs font-mono leading-normal flex items-start gap-2.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-neutral-600" />
            <p className="text-[11px] font-serif italic">{googleNotice}</p>
          </div>
        )}

        {activeTab === 'signin' ? (
          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 bg-white text-neutral-800 font-mono font-semibold text-xs tracking-wide uppercase shadow-subtle transition-all disabled:opacity-50"
            >
              {googleLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-neutral-700" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.25 21.36 7.34 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-2.5 font-mono text-[10px] tracking-wider uppercase font-semibold text-neutral-400 shrink-0">
                Or Select Role Persona
              </span>
              <div className="border-t border-neutral-200 w-full" />
            </div>

            {/* Quick Staff & Customer Role Selection */}
            <div className="space-y-2">
              <button
                onClick={() => handleStaffLogin('sarah.jenkins@example.com', 'Sarah Jenkins', 'customer')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80 bg-white text-left transition-all group"
              >
                <div>
                  <span className="font-serif font-bold text-xs text-neutral-900 block">Customer (Sarah Jenkins)</span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    Audit orders, lodge disputes &amp; track refunds
                  </span>
                </div>
                <ArrowRight size={13} className="text-neutral-400 group-hover:text-neutral-700 transition-colors" />
              </button>

              <button
                onClick={() => handleStaffLogin('marcus.vance@example.com', 'Marcus Vance', 'operations')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80 bg-white text-left transition-all group"
              >
                <div>
                  <span className="font-serif font-bold text-xs text-neutral-900 block">Operations Lead (Marcus Vance)</span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    Authorize ₹15,000+ approvals &amp; manage constraints
                  </span>
                </div>
                <ArrowRight size={13} className="text-neutral-400 group-hover:text-neutral-700 transition-colors" />
              </button>

              <button
                onClick={() => handleStaffLogin('elena.rostova@example.com', 'Elena Rostova', 'admin')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80 bg-white text-left transition-all group"
              >
                <div>
                  <span className="font-serif font-bold text-xs text-neutral-900 block">Admin Supervisor (Elena Rostova)</span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    Unrestricted ledger access &amp; cryptographic audits
                  </span>
                </div>
                <ArrowRight size={13} className="text-neutral-400 group-hover:text-neutral-700 transition-colors" />
              </button>

              <button
                onClick={() => handleStaffLogin('david.kim@example.com', 'David Kim', 'support_agent')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/80 bg-white text-left transition-all group"
              >
                <div>
                  <span className="font-serif font-bold text-xs text-neutral-900 block">Support Specialist (David Kim)</span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    Review escalated tickets &amp; raw JSON traces
                  </span>
                </div>
                <ArrowRight size={13} className="text-neutral-400 group-hover:text-neutral-700 transition-colors" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block font-mono text-xs tracking-wide uppercase font-semibold text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-neutral-900 text-xs font-serif placeholder:italic placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs tracking-wide uppercase font-semibold text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. priya.sharma@example.com"
                className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-neutral-900 text-xs font-mono placeholder:italic placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs tracking-wide uppercase font-semibold text-neutral-700 mb-1">
                Workspace Role Authority
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-neutral-900 text-xs font-mono focus:border-neutral-900 focus:outline-none"
              >
                <option value="customer">Customer (Standard Client)</option>
                <option value="operations">Operations Lead (Review Queue)</option>
                <option value="support_agent">Support Specialist (Escalations)</option>
                <option value="admin">Admin (Full System Authority)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs tracking-wide uppercase font-semibold text-neutral-700 mb-1">
                Secret Password
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-md border border-neutral-300 bg-white text-neutral-900 text-xs font-mono focus:border-neutral-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-neutral-900 text-white font-mono text-xs tracking-wider uppercase font-semibold hover:bg-neutral-800 shadow-subtle transition-all disabled:opacity-50 mt-1"
            >
              {loading ? 'Creating Credentials...' : 'Create Account & Authorize'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
