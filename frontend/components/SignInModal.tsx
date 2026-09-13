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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white w-full max-w-md border-4 border-black p-6 sm:p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors duration-100"
        >
          <X size={14} strokeWidth={2} />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-black text-white font-display font-bold text-sm flex items-center justify-center border border-black">
              R
            </div>
            <h2 className="text-xl font-display font-bold uppercase tracking-tight text-black">
              ResolveOS Portal
            </h2>
          </div>
          <p className="font-serif italic text-xs text-neutral-600">
            Sign in to access your verified dispute portfolio or administrative operations console.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex border-2 border-black p-0.5 text-xs font-mono tracking-wider uppercase">
          <button
            onClick={() => { setActiveTab('signin'); setGoogleNotice(null); }}
            className={`flex-1 py-1.5 transition-colors duration-100 font-bold ${
              activeTab === 'signin' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Sign In / Quick Access
          </button>
          <button
            onClick={() => { setActiveTab('register'); setGoogleNotice(null); }}
            className={`flex-1 py-1.5 transition-colors duration-100 font-bold ${
              activeTab === 'register' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Create Account
          </button>
        </div>

        {googleNotice && (
          <div className="p-3 border-2 border-black bg-neutral-50 text-black text-xs font-mono leading-normal flex items-start gap-2.5">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <p className="text-[11px] font-serif italic">{googleNotice}</p>
          </div>
        )}

        {activeTab === 'signin' ? (
          <div className="space-y-5">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 border-2 border-black bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors duration-100 disabled:opacity-50 group"
            >
              {googleLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
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
              <div className="border-t-2 border-black w-full" />
              <span className="bg-white px-3 font-mono text-[10px] tracking-widest uppercase font-bold text-black shrink-0">
                Or Select Role Persona
              </span>
              <div className="border-t-2 border-black w-full" />
            </div>

            {/* Quick Staff & Customer Role Selection */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleStaffLogin('sarah.jenkins@example.com', 'Sarah Jenkins', 'customer')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 border-2 border-black bg-white hover:bg-black hover:text-white text-black text-left transition-colors duration-100 group"
              >
                <div>
                  <span className="font-serif font-bold text-xs block">Customer (Sarah Jenkins)</span>
                  <span className="font-mono text-[10px] tracking-wider uppercase text-neutral-500 group-hover:text-neutral-300">
                    Audit orders, lodge disputes &amp; track refunds
                  </span>
                </div>
                <ArrowRight size={14} className="text-neutral-400 group-hover:text-white transition-colors duration-100" />
              </button>

              <button
                onClick={() => handleStaffLogin('marcus.vance@example.com', 'Marcus Vance', 'operations')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 border-2 border-black bg-white hover:bg-black hover:text-white text-black text-left transition-colors duration-100 group"
              >
                <div>
                  <span className="font-serif font-bold text-xs block">Operations Lead (Marcus Vance)</span>
                  <span className="font-mono text-[10px] tracking-wider uppercase text-neutral-500 group-hover:text-neutral-300">
                    Authorize ₹15,000+ approvals &amp; manage constraints
                  </span>
                </div>
                <ArrowRight size={14} className="text-neutral-400 group-hover:text-white transition-colors duration-100" />
              </button>

              <button
                onClick={() => handleStaffLogin('elena.rostova@example.com', 'Elena Rostova', 'admin')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 border-2 border-black bg-white hover:bg-black hover:text-white text-black text-left transition-colors duration-100 group"
              >
                <div>
                  <span className="font-serif font-bold text-xs block">Admin Supervisor (Elena Rostova)</span>
                  <span className="font-mono text-[10px] tracking-wider uppercase text-neutral-500 group-hover:text-neutral-300">
                    Unrestricted ledger access &amp; cryptographic audits
                  </span>
                </div>
                <ArrowRight size={14} className="text-neutral-400 group-hover:text-white transition-colors duration-100" />
              </button>

              <button
                onClick={() => handleStaffLogin('david.kim@example.com', 'David Kim', 'support_agent')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3 border-2 border-black bg-white hover:bg-black hover:text-white text-black text-left transition-colors duration-100 group"
              >
                <div>
                  <span className="font-serif font-bold text-xs block">Support Specialist (David Kim)</span>
                  <span className="font-mono text-[10px] tracking-wider uppercase text-neutral-500 group-hover:text-neutral-300">
                    Review escalated tickets &amp; raw JSON traces
                  </span>
                </div>
                <ArrowRight size={14} className="text-neutral-400 group-hover:text-white transition-colors duration-100" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-black mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 border-2 border-black bg-white text-black text-xs font-serif placeholder:italic placeholder:text-neutral-400 focus:border-b-4"
              />
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-black mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. priya.sharma@example.com"
                className="w-full px-3 py-2 border-2 border-black bg-white text-black text-xs font-mono placeholder:italic placeholder:text-neutral-400 focus:border-b-4"
              />
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-black mb-1">
                Workspace Role Authority
              </label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full px-3 py-2 border-2 border-black bg-white text-black text-xs font-mono focus:border-b-4"
              >
                <option value="customer">Customer (Standard Client)</option>
                <option value="operations">Operations Lead (Review Queue)</option>
                <option value="support_agent">Support Specialist (Escalations)</option>
                <option value="admin">Admin (Full System Authority)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-xs tracking-widest uppercase font-bold text-black mb-1">
                Secret Password
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border-2 border-black bg-white text-black text-xs font-mono focus:border-b-4"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border-2 border-black bg-black text-white font-mono text-xs tracking-widest uppercase font-bold hover:bg-white hover:text-black transition-colors duration-100 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Credentials...' : 'Create Account & Authorize'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
