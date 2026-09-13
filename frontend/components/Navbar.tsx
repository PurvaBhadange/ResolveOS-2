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

  // Determine active user role (Default: customer when unauthenticated)
  const userRole = (session?.user as any)?.role || (session ? 'operations' : 'customer');

  const allNavItems = [
    { id: 'help', label: 'Agent Workbench', icon: LifeBuoy, roles: ['customer', 'operations', 'admin', 'support_agent'] },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, roles: ['customer', 'admin'] },
    { id: 'cases', label: 'Case Tracker', icon: Activity, roles: ['customer', 'operations', 'admin', 'support_agent'] },
    { id: 'ops', label: 'Operations Dashboard', icon: Layers, badge: 'Judge Console', roles: ['operations', 'admin'] },
    { id: 'trace', label: 'Agent Trace Inspector', icon: Cpu, badge: 'Live Loop', roles: ['operations', 'admin', 'support_agent'] },
  ];

  // Filter tabs based on active user role
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-[#e8e2d8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo Brand */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => setActiveTab('help')}
            >
              <div className="w-10 h-10 rounded-md bg-ink flex items-center justify-center text-canvas transition-transform group-hover:scale-105 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                  Resolve<span className="text-primary">OS</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-semibold bg-canvas-soft text-body-mid rounded-full border border-mute/50 uppercase tracking-wider">
                  {userRole === 'customer' ? 'Customer Portal' : `${userRole} Access`}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="flex items-center gap-1 sm:gap-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-ink text-on-primary shadow-sm'
                        : 'text-ink-soft hover:text-ink hover:bg-canvas-soft'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-body'}`} />
                    <span className="hidden md:inline">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${
                          isActive
                            ? 'bg-primary text-on-primary'
                            : 'bg-[#e8e2d8] text-ink-mid'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Session Control / Staff Sign In */}
              <div className="ml-2 border-l border-[#e8e2d8] pl-2">
                {session ? (
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-bold text-ink leading-tight">
                        {session.user?.name || 'Authorized Staff'}
                      </span>
                      <span className="text-[10px] text-body-mid font-medium uppercase tracking-wider">
                        {session.user?.email || 'Active User'}
                      </span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      title="Sign Out to switch back to Customer View"
                      className="p-2.5 rounded-md text-body hover:text-accent-rose hover:bg-canvas-soft border border-transparent hover:border-mute/50 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSignInOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-canvas-soft hover:bg-[#efe8df] text-ink border border-mute text-xs font-semibold transition-all shadow-sm"
                  >
                    <User className="w-3.5 h-3.5 text-primary" />
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
