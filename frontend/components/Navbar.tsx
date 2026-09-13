import React, { useState } from 'react';
import { ShieldCheck, ShoppingBag, LifeBuoy, Activity, Layers, Cpu, LogOut, User, Lock } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { SignInModal } from './SignInModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { data: session } = useSession();
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  // Determine active user role (Default: customer when unauthenticated)
  const userRole = (session?.user as any)?.role || (session ? 'operations' : 'customer');

  const allNavItems = [
    { id: 'help', label: 'Help Center', icon: LifeBuoy, roles: ['customer', 'operations', 'admin', 'support_agent'] },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, roles: ['customer', 'admin'] },
    { id: 'cases', label: 'Case Tracker', icon: Activity, roles: ['customer', 'operations', 'admin', 'support_agent'] },
    { id: 'ops', label: 'Operations Dashboard', icon: Layers, badge: 'Judge Console', roles: ['operations', 'admin'] },
    { id: 'trace', label: 'Agent Trace Inspector', icon: Cpu, badge: 'Live Graph', roles: ['operations', 'admin', 'support_agent'] },
  ];

  // Filter tabs based on active user role
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Top Hackathon Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-tealbrand-950 to-slate-950 text-white text-xs font-semibold py-1.5 px-4 border-b border-tealbrand-900/50 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-tealbrand-500/20 text-tealbrand-300 font-bold border border-tealbrand-500/30 text-[10px] uppercase tracking-wider">
              Agentic AI Hackathon
            </span>
            <span className="text-slate-300 hidden sm:inline">Track 3: Smart Automation • IIT Bhubaneswar (Tech Zephyr 4.0)</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live API Online
            </span>
            <span className="hidden md:inline text-slate-400">•</span>
            <span className="hidden md:inline text-tealbrand-300 font-mono">FastAPI + LangGraph Engine</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('help')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-tealbrand-700 flex items-center justify-center text-white shadow-md shadow-tealbrand-600/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">Resolve<span className="text-tealbrand-600">OS</span></span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[11px] font-bold bg-tealbrand-50 text-tealbrand-700 rounded-full border border-tealbrand-200 uppercase tracking-wider">
                  {userRole === 'customer' ? 'Customer Portal' : `${userRole} Access`}
                </span>
              </div>
            </div>


            <nav className="flex items-center gap-1 sm:gap-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive ? 'bg-tealbrand-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Role-Based Sign In & Session Badge */}
              <div className="ml-2 border-l border-slate-200 pl-2">
                {session ? (
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-bold text-slate-900 leading-none">{session.user?.name || 'Logged User'}</span>
                      <span className="text-[10px] text-tealbrand-600 font-semibold uppercase">{session.user?.email || 'Operations'}</span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      title="Sign Out to switch back to Customer View"
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSignInOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tealbrand-50 hover:bg-tealbrand-100 text-tealbrand-700 border border-tealbrand-200 text-xs font-semibold transition-all shadow-sm"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Staff Sign In</span>
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Sign In Modal */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </>
  );
};
