'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, UserPlus, LogIn, Lock, ArrowRight, AlertCircle, Sparkles, Zap } from 'lucide-react';
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
    const hasGoogleEnv = Boolean(process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID || process.env.AUTH_GOOGLE_ID);
    if (!hasGoogleEnv) {
      setGoogleNotice(
        "Google OAuth credentials (AUTH_GOOGLE_ID) are not configured. You can use 'Quick Account Role' below to sign in instantly without setup!"
      );
      return;
    }

    signIn('google');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-fade-in">
      {/* Modal Dialog Surface - ex-modal-card in DESIGN.md */}
      <div className="bg-canvas w-full max-w-md rounded-md p-6 sm:p-8 shadow-modal border border-[#e8e2d8] relative space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-md text-body-mid hover:text-ink hover:bg-canvas-soft border border-transparent hover:border-mute/40 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="w-12 h-12 rounded-md bg-canvas-soft border border-mute/50 flex items-center justify-center mb-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <span className="eyebrow-uppercase text-body-mid text-[11px]">Authentication</span>
          <h2 className="text-2xl font-bold text-ink tracking-tight">ResolveOS Portal</h2>
          <p className="text-body text-xs sm:text-sm leading-relaxed">
            Sign in to access your customer claims or operations governance console.
          </p>
        </div>

        {/* Modal Header Tabs */}
        <div className="flex bg-canvas-soft p-1 rounded-md border border-[#e8e2d8]">
          <button
            onClick={() => { setActiveTab('signin'); setGoogleNotice(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all ${
              activeTab === 'signin' ? 'bg-ink text-canvas shadow-sm' : 'text-body hover:text-ink'
            }`}
          >
            Quick Role Sign In
          </button>
          <button
            onClick={() => { setActiveTab('register'); setGoogleNotice(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-sm transition-all ${
              activeTab === 'register' ? 'bg-ink text-canvas shadow-sm' : 'text-body hover:text-ink'
            }`}
          >
            Create New Account
          </button>
        </div>

        {googleNotice && (
          <div className="p-3.5 rounded-md bg-accent-amber/10 border border-accent-amber/30 text-ink text-xs leading-relaxed space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-accent-amber">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Authentication Note</span>
            </div>
            <p className="text-[11px] text-body">{googleNotice}</p>
          </div>
        )}

        {activeTab === 'signin' ? (
          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-md border border-mute hover:border-ink hover:bg-canvas-soft text-ink font-semibold text-sm transition-all shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.25 21.36 7.34 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              Continue with Google
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-[#e8e2d8] w-full" />
              <span className="bg-canvas px-3 text-[11px] uppercase font-bold text-body-mid shrink-0">
                Or Quick Staff Login
              </span>
              <div className="border-t border-[#e8e2d8] w-full" />
            </div>

            {/* Quick Role Options */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleStaffLogin('ops@resolveos.com', 'Operations Lead', 'operations')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-md bg-canvas-soft hover:bg-[#efe8df] border border-[#e8e2d8] text-left transition-all group shadow-sm"
              >
                <div>
                  <span className="text-xs font-bold text-ink block">Operations Lead (Judge Role)</span>
                  <span className="text-[11px] text-body">Authorizes $200+ high-value refund approvals</span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleStaffLogin('admin@resolveos.com', 'Admin Supervisor', 'admin')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-md bg-canvas-soft hover:bg-[#efe8df] border border-[#e8e2d8] text-left transition-all group shadow-sm"
              >
                <div>
                  <span className="text-xs font-bold text-ink block">Admin Supervisor</span>
                  <span className="text-[11px] text-body">Full system audit & policy management</span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => handleStaffLogin('sarah.jenkins@example.com', 'Sarah Jenkins', 'customer')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-md bg-canvas-soft hover:bg-[#efe8df] border border-[#e8e2d8] text-left transition-all group shadow-sm"
              >
                <div>
                  <span className="text-xs font-bold text-ink block">Customer Account (Sarah Jenkins)</span>
                  <span className="text-[11px] text-body">Demo orders, claims & return status</span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ) : (
          /* Create New Account Registration Form */
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-mute focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. alex.morgan@example.com"
                className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-mute focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Account Role / Access Type</label>
              <select
                value={regRole}
                onChange={(e: any) => setRegRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-mute focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink text-xs font-medium"
              >
                <option value="customer">Customer (End-User Portal)</option>
                <option value="operations">Operations Lead (Judge Console & Approvals)</option>
                <option value="support_agent">Support Agent (Tier 2 Escalations)</option>
                <option value="admin">Admin Supervisor (Full Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-sm bg-canvas border border-mute focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink text-xs font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold shadow-sm disabled:opacity-50"
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
