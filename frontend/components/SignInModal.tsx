'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl border border-slate-200/90 relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">ResolveOS Portal</h2>
          </div>
          <p className="text-xs text-slate-500">
            Sign in to access your customer orders or staff operational workspace.
          </p>
        </div>

        {/* Segmented Control Tabs */}
        <div className="flex bg-slate-100 p-0.5 rounded-md text-xs font-medium">
          <button
            onClick={() => { setActiveTab('signin'); setGoogleNotice(null); }}
            className={`flex-1 py-1.5 rounded transition-all ${
              activeTab === 'signin' ? 'bg-white text-slate-900 shadow-subtle' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In / Quick Access
          </button>
          <button
            onClick={() => { setActiveTab('register'); setGoogleNotice(null); }}
            className={`flex-1 py-1.5 rounded transition-all ${
              activeTab === 'register' ? 'bg-white text-slate-900 shadow-subtle' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {googleNotice && (
          <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-normal flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px]">{googleNotice}</p>
          </div>
        )}

        {activeTab === 'signin' ? (
          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors shadow-subtle disabled:opacity-60"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
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

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] uppercase font-semibold text-slate-400 shrink-0">
                Or Select Role Workspace
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            {/* Quick Staff & Customer Role Selection */}
            <div className="space-y-2">
              <button
                onClick={() => handleStaffLogin('sarah.jenkins@example.com', 'Sarah Jenkins', 'customer')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors group"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Customer (Sarah Jenkins)</span>
                  <span className="text-[11px] text-slate-500">View orders, submit returns &amp; track disputes</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                onClick={() => handleStaffLogin('marcus.vance@example.com', 'Marcus Vance', 'operations')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors group"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Operations Lead (Marcus Vance)</span>
                  <span className="text-[11px] text-slate-500">Authorize ₹15,000+ approvals &amp; manage constraints</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                onClick={() => handleStaffLogin('elena.rostova@example.com', 'Elena Rostova', 'admin')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors group"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Admin Supervisor (Elena Rostova)</span>
                  <span className="text-[11px] text-slate-500">Unrestricted operational authority &amp; audits</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>

              <button
                onClick={() => handleStaffLogin('david.kim@example.com', 'David Kim', 'support_agent')}
                disabled={loading}
                className="w-full flex items-center justify-between p-2.5 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors group"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">Support Specialist (David Kim)</span>
                  <span className="text-[11px] text-slate-500">Review escalated tickets &amp; diagnostic logs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. priya.sharma@example.com"
                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Workspace Role</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900 text-xs bg-white"
              >
                <option value="customer">Customer (Standard User)</option>
                <option value="operations">Operations Lead (Review Queue)</option>
                <option value="support_agent">Support Specialist (Escalations)</option>
                <option value="admin">Admin (System-Wide Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-md border border-slate-300 focus:outline-none focus:border-slate-900 text-slate-900 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-subtle mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
