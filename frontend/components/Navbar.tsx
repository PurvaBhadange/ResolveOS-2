import React, { useState } from 'react';
import { ShieldCheck, ShoppingBag, LifeBuoy, Activity, Layers, Cpu, LogOut, User, Sparkles } from 'lucide-react';
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
      {/* Zapier-Style Deep Coffee Ink Top Ribbon */}
      <div className="bg-[#201515] text-[#fffefb] text-xs font-semibold py-2 px-4 border-b border-[#36342e]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#ff4f00] text-[#fffefb] font-bold text-[10px] uppercase tracking-widest">
              IIT Bhubaneswar Hackathon
            </span>
            <span className="text-[#c5c0b1] hidden sm:inline">Track 3: Smart Automation • Problem 5: Autonomous Customer Resolution</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#c5c0b1]">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live API Online
            </span>
            <span className="hidden md:inline text-[#605d52]">•</span>
            <span className="hidden md:inline text-[#ff4f00] font-mono">FastAPI + LangGraph Engine</span>
          </div>
        </div>
      </div>

      {/* Main Navbar with Warm Cream Surface */}
      <header className="sticky top-0 z-40 bg-[#fffefb]/95 backdrop-blur-md border-b border-[#c5c0b1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('help')}>
              <div className="w-10 h-10 rounded-[12px] bg-[#ff4f00] flex items-center justify-center text-[#fffefb] shadow-md shadow-[#ff4f00]/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-[#201515]">Resolve<span className="text-[#ff4f00]">OS</span></span>
                <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 text-[10px] font-bold bg-[#f8f4f0] text-[#201515] rounded-full border border-[#c5c0b1] uppercase tracking-wider">
                  {userRole === 'customer' ? 'Customer Portal' : `${userRole} Access`}
                </span>
              </div>
            </div>

            {/* Nav Items */}
            <nav className="flex items-center gap-1.5 sm:gap-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-[12px] text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#201515] text-[#fffefb] shadow-sm'
                        : 'text-[#605d52] hover:text-[#201515] hover:bg-[#f8f4f0]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-[#ff4f00] text-[#fffefb]' : 'bg-[#c5c0b1]/30 text-[#201515]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Role-Based Sign In & Session Badge */}
              <div className="ml-2 border-l border-[#c5c0b1] pl-2">
                {session ? (
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-bold text-[#201515] leading-none">{session.user?.name || 'Logged User'}</span>
                      <span className="text-[10px] text-[#ff4f00] font-semibold uppercase">{session.user?.email || 'Operations'}</span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      title="Sign Out to switch back to Customer View"
                      className="p-2 rounded-[12px] text-[#605d52] hover:text-rose-600 hover:bg-rose-50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSignInOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#ff4f00] hover:bg-[#e04500] text-[#fffefb] text-xs font-bold transition-all shadow-sm"
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
