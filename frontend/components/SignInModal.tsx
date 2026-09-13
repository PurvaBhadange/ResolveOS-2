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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md border border-neutral-200 rounded-2xl shadow-xl p-6 sm:p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          <X size={15} strokeWidth={2} />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white font-display font-bold text-sm flex items-center justify-center shadow-xs">
              R
            </div>
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-neutral-900">
              ResolveOS Portal
            </h2>
          </div>
          <p className="text-xs text-neutral-600">
            Sign in to access your verified dispute portfolio or administrative operations console.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex rounded-lg bg-neutral-100 p-1 text-xs font-mono tracking-wider uppercase border border-neutral-200">
          <button
            onClick={() => { setActiveTab('signin'); setGoogleNotice(null); }}
            className={`flex-1 py-1.5 transition-all duration-150 font-bold rounded-md ${
              activeTab === 'signin' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Sign In / Quick Access
          </button>
          <button
            onClick={() => { setActiveTab('register'); setGoogleNotice(null); }}
            className={`flex-1 py-1.5 transition-all duration-150 font-bold rounded-md ${
              activeTab === 'register' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {googleNotice && (
          <div className="p-3 border border-amber-200 bg-amber-50 text-amber-900 rounded-lg text-xs leading-normal flex items-start gap-2.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-700" />
            <p className="text-[11px]">{googleNotice}</p>
          </div>
        )}

        {activeTab === 'signin' ? (
          <div className="space-y-5">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-neutral-800 font-mono font-bold text-xs uppercase tracking-wider hover:bg-neutral-50 hover:border-neutral-300 transition-colors disabled:opacity-50 group shadow-xs"
            >
              {googleLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-neutral-600" />
                  <span>Authorizing via Google...</span>
                </>
              ) : (
                <>
                  <span className="font-serif font-bold text-sm">G</span>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 font-mono text-[10px] tracking-widest uppercase font-bold text-neutral-400 shrink-0">
                Or Select Role Persona
              </span>
              <div className="border-t border-neutral-200 w-full" />
            </div>

            {/* Quick Staff & Customer Role Selection with pastel tags */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleStaffLogin('sarah.jenkins@example.com', 'Sarah Jenkins', 'customer')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white hover:border-sky-300 hover:bg-sky-50/40 text-left transition-all group shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-xs text-neutral-900">Sarah Jenkins</span>
                    <span className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                      Customer
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block">
                    Audit orders, lodge disputes &amp; track refunds
                  </span>
                </div>
                <ArrowRight size={14} className="text-neutral-400 group-hover:text-sky-700 transition-colors" />
              </button>

              <button
                onClick={() => handleStaffLogin('marcus.vance@example.com', 'Marcus Vance', 'operations')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white hover:border-amber-300 hover:bg-amber-50/40 text-left transition-all group shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-xs text-neutral-900">Marcus Vance</span>
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                      Operations Lead
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block">
                    Authorize ₹15,000+ approvals &amp; manage constraints
                  </span>
                </div>
                <ArrowRight size={14} className="text-neutral-400 group-hover:text-amber-700 transition-colors" />
              </button>

              <button
                onClick={() => handleStaffLogin('elena.rostova@example.com', 'Elena Rostova', 'admin')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white hover:border-violet-300 hover:bg-violet-50/40 text-left transition-all group shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-xs text-neutral-900">Elena Rostova</span>
                    <span className="bg-violet-50 text-violet-800 border border-violet-200 text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                      Admin Supervisor
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block">
                    Unrestricted ledger access &amp; cryptographic audits
                  </span>
                </div>
                <ArrowRight size={14} className="text-neutral-400 group-hover:text-violet-700 transition-colors" />
              </button>

              <button
                onClick={() => handleStaffLogin('david.kim@example.com', 'David Kim', 'support_agent')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all group shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-xs text-neutral-900">David Kim</span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                      Support Specialist
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 block">
                    Review escalated tickets &amp; raw JSON traces
                  </span>
                </div>
                <ArrowRight size={14} className="text-neutral-400 group-hover:text-emerald-700 transition-colors" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-neutral-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 text-xs focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-neutral-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. priya.sharma@example.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-neutral-700 mb-1">
                Workspace Role Authority
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              >
                <option value="customer">Customer (Standard Client)</option>
                <option value="operations">Operations Lead (Review Queue)</option>
                <option value="support_agent">Support Specialist (Escalations)</option>
                <option value="admin">Admin (Full System Authority)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-neutral-700 mb-1">
                Secret Password
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-900 text-xs font-mono focus:ring-2 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 border border-neutral-900 rounded-lg bg-neutral-900 text-white font-mono text-xs tracking-widest uppercase font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50 mt-2 shadow-xs"
            >
              {loading ? 'Creating Credentials...' : 'Create Account & Authorize'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
