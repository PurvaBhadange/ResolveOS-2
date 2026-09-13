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
    { id: 'help', label: 'Resolution Center', icon: LifeBuoy, roles: ['customer', 'operations', 'admin', 'support_agent'] },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, roles: ['customer', 'admin'] },
    { id: 'cases', label: 'Case Tracker', icon: Activity, roles: ['customer', 'operations', 'admin', 'support_agent'] },
    { id: 'ops', label: 'Operations', icon: Layers, roles: ['operations', 'admin'] },
    { id: 'trace', label: 'Audit Trace', icon: Cpu, roles: ['operations', 'admin', 'support_agent'] },
  ];

  // Filter tabs based on active user role
  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15">
            {/* Brand Logo & Portal Badge */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => setActiveTab('help')}
            >
              <div className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-base shadow-subtle">
                R
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-lg font-serif font-bold tracking-tight text-slate-900">
                  Resolve<span className="font-normal italic text-slate-700">OS</span>
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-md font-mono text-[10px] tracking-wide uppercase border border-violet-200 bg-violet-50 text-violet-800 font-semibold">
                  {userRole === 'customer' ? 'Customer Portal' : `${userRole} Workspace`}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 sm:gap-1.5">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono tracking-wide uppercase transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white font-medium shadow-subtle'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon size={14} strokeWidth={1.5} className={isActive ? 'text-white' : 'text-slate-500'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Role-Based Session & Sign In */}
              <div className="ml-2 pl-3 border-l border-slate-200 flex items-center gap-2">
                {session ? (
                  <div className="flex items-center gap-2.5">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full border border-slate-300 object-cover shadow-subtle"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-mono font-medium text-xs flex items-center justify-center">
                        {(session.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-serif font-bold text-slate-900 leading-none">
                        {session.user?.name || 'Authorized'}
                      </span>
                      <span className="text-[10px] font-mono tracking-wider uppercase text-slate-500">
                        {userRole}
                      </span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      title="Sign Out"
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <LogOut size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSignInOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 text-xs font-mono tracking-wide uppercase hover:bg-slate-50 hover:border-slate-400 shadow-subtle transition-all"
                  >
                    <User size={14} strokeWidth={1.5} className="text-slate-500" />
                    <span>Sign In</span>
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
