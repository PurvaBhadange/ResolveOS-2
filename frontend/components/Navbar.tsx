import React from 'react';
import { ShieldCheck, ShoppingBag, LifeBuoy, Activity, Layers, Cpu, LogIn, LogOut, User } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { data: session } = useSession();

  const navItems = [
    { id: 'help', label: 'Help Center', icon: LifeBuoy },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'cases', label: 'Case Tracker', icon: Activity },
    { id: 'ops', label: 'Operations Dashboard', icon: Layers, badge: 'Judge Console' },
    { id: 'trace', label: 'Agent Trace Inspector', icon: Cpu, badge: 'Live Graph' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('help')}>
            <div className="w-10 h-10 rounded-xl bg-tealbrand-600 flex items-center justify-center text-white shadow-md shadow-tealbrand-600/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Resolve<span className="text-tealbrand-600">OS</span></span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-medium bg-tealbrand-50 text-tealbrand-700 rounded-full border border-tealbrand-200">
                Autonomous Resolution Agent
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
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

            {/* NextAuth Authentication Session Badge */}
            <div className="ml-2 border-l border-slate-200 pl-2">
              {session ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-900 leading-none">{session.user?.name || 'Logged User'}</span>
                    <span className="text-[10px] text-tealbrand-600 font-semibold uppercase">{session.user?.email || 'Operations'}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    title="Sign Out"
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => signIn('google')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tealbrand-50 hover:bg-tealbrand-100 text-tealbrand-700 border border-tealbrand-200 text-xs font-semibold transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
