import React from 'react';
import { ShieldCheck, ShoppingBag, LifeBuoy, Activity, Layers, Cpu } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
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
          </nav>
        </div>
      </div>
    </header>
  );
};
