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
    { id: 'trace', label: 'Execution Trace Inspector', icon: Cpu, badge: 'Live Audit', roles: ['operations', 'admin', 'support_agent'] },
  ];

  // Filter tabs based on active user role
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Top Enterprise System Status Bar */}
      <div className="bg-slate-50 text-slate-600 text-xs font-medium py-1.5 px-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-tealbrand-50 text-tealbrand-700 font-bold border border-tealbrand-200 text-[10px] uppercase tracking-wider">
              Enterprise Edition
            </span>
            <span className="text-slate-600 hidden sm:inline">ResolveOS Logistics &amp; Fulfillment Resolution Suite</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Systems Operational
            </span>
            <span className="hidden md:inline text-slate-300">•</span>
            <span className="hidden md:inline text-slate-600 font-mono">Real-Time Sync Active</span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('help')}>
              <div className="w-10 h-10 rounded-xl bg-tealbrand-600 border border-tealbrand-700 flex items-center justify-center text-white shadow-sm">
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
                        ? 'bg-tealbrand-50 text-tealbrand-800 font-semibold border border-tealbrand-200 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        isActive ? 'bg-tealbrand-600 text-white' : 'bg-slate-100 text-slate-600'
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
