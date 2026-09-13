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
      <header className="sticky top-0 z-40 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo & Portal Badge */}
            <div
              className="flex items-center gap-3 cursor-pointer select-none group"
              onClick={() => setActiveTab('help')}
            >
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-display font-bold text-lg border border-black rounded-lg transition-colors duration-100 group-hover:bg-white group-hover:text-black">
                R
              </div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-xl font-display font-bold tracking-tight text-black">
                  RESOLVE<span className="font-normal italic">OS</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 font-mono text-[10px] tracking-widest uppercase text-black border border-black bg-white rounded-md">
                  {userRole === 'customer' ? 'Customer Portal' : `${userRole} Workspace`}
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wider uppercase border rounded-lg transition-colors duration-100 ${
                      isActive
                        ? 'bg-black text-white border-black font-semibold'
                        : 'bg-white text-black border-transparent hover:border-black hover:bg-black hover:text-white'
                    }`}
                  >
                    <Icon size={14} strokeWidth={1.5} className={isActive ? 'text-white' : 'text-black'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Role-Based Session & Sign In */}
              <div className="ml-2 pl-3 border-l-2 border-black flex items-center gap-2">
                {session ? (
                  <div className="flex items-center gap-2.5">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 border-2 border-black object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-black text-white font-mono font-medium text-xs flex items-center justify-center border-2 border-black rounded-full">
                        {(session.user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-xs font-serif font-bold text-black leading-none">
                        {session.user?.name || 'Authorized'}
                      </span>
                      <span className="text-[10px] font-mono tracking-wider uppercase text-neutral-600">
                        {userRole}
                      </span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      title="Sign Out"
                      className="p-1.5 border border-black bg-white text-black hover:bg-black hover:text-white transition-colors duration-100 rounded-lg"
                    >
                      <LogOut size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsSignInOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white text-black text-xs font-mono tracking-wider uppercase hover:bg-black hover:text-white transition-colors duration-100 rounded-lg"
                  >
                    <User size={14} strokeWidth={1.5} />
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
