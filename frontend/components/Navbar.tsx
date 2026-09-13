import React, { useState } from 'react';
import { ShieldCheck, ShoppingBag, LifeBuoy, Activity, Layers, Cpu, LogOut, User } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { SignInModal } from './SignInModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { data: session } = useSession();
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  // Determine active user role
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
      <header className="sticky top-0 z-40 bg-[#fffefb] border-b border-[#e8e2d8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Zapier-styled Brand Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('help')}>
              <div className="w-10 h-10 rounded-xl bg-[#201515] flex items-center justify-center text-[#fffefb] shadow-sm">
                <ShieldCheck className="w-5 h-5 text-[#ff4f00]" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-[#201515]">
                  Resolve<span className="text-[#ff4f00]">OS</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2.5 py-0.5 text-xs font-semibold bg-[#f8f4f0] text-[#201515] rounded-full border border-[#c5c0b1]">
                  {userRole === 'customer' ? 'Customer Portal' : `${userRole} Access`}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#201515] text-[#fffefb] shadow-sm'
                        : 'text-[#605d52] hover:text-[#201515] hover:bg-[#f8f4f0]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                        isActive ? 'bg-[#ff4f00] text-[#fffefb]' : 'bg-[#e8e2d8] text-[#201515]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Role-Based Sign In & Session Badge */}
              <div className="ml-3 border-l border-[#c5c0b1] pl-3">
                {session ? (
                  <div className="flex items-center gap-2.5">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-bold text-[#201515] leading-none">{session.user?.name || 'Logged User'}</span>
                      <span className="text-[10px] text-[#ff4f00] font-semibold uppercase tracking-wider">{session.user?.email || 'Operations'}</span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      title="Sign Out to switch back to Customer View"
                      className="p-2 rounded-xl text-[#605d52] hover:text-rose-600 hover:bg-[#f8f4f0] transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSignInOpen(true)}
                    className="zapier-btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    <User className="w-4 h-4" />
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
