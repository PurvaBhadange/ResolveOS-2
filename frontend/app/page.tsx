'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Lock, ShieldAlert } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { CustomerHelpCenter } from '../components/CustomerHelpCenter';
import { OrdersView } from '../components/OrdersView';
import { CaseDetailsView } from '../components/CaseDetailsView';
import { OperationsDashboard } from '../components/OperationsDashboard';
import { AgentTraceInspector } from '../components/AgentTraceInspector';
import { SignInModal } from '../components/SignInModal';

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<string>('help');
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(1);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('ORD-2026-8801');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);

  const userRole = (session?.user as any)?.role || (session ? 'operations' : 'customer');
  const isStaff = ['operations', 'admin', 'support_agent'].includes(userRole);

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'help' && (
          <CustomerHelpCenter
            onCaseCreated={(caseId) => setSelectedCaseId(caseId)}
            setActiveTab={setActiveTab}
            prefillOrderNumber={selectedOrderNumber}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            onSelectOrder={(orderNum) => {
              setSelectedOrderNumber(orderNum);
              setActiveTab('help');
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'cases' && (
          <CaseDetailsView
            selectedCaseId={selectedCaseId}
            onSelectCase={(id) => setSelectedCaseId(id)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'ops' && (
          isStaff ? (
            <OperationsDashboard />
          ) : (
            <div className="rounded-lg border border-neutral-200/90 p-8 sm:p-10 bg-white text-center max-w-md mx-auto space-y-3.5 my-14 shadow-subtle">
              <div className="w-10 h-10 rounded-full border border-neutral-200 bg-neutral-100 text-neutral-700 flex items-center justify-center mx-auto">
                <Lock size={18} strokeWidth={1.75} />
              </div>
              <h2 className="font-serif text-lg font-bold tracking-tight text-neutral-900">
                Staff Authority Required
              </h2>
              <p className="font-serif italic text-xs text-neutral-500 leading-relaxed">
                The Operations Governance Console is restricted to Operations Leads, Support Specialists, and System Administrators.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs tracking-wide uppercase font-semibold shadow-subtle transition-all"
              >
                <span>Authorize Credentials</span>
              </button>
            </div>
          )
        )}

        {activeTab === 'trace' && (
          isStaff ? (
            <AgentTraceInspector selectedCaseId={selectedCaseId} />
          ) : (
            <div className="rounded-lg border border-neutral-200/90 p-8 sm:p-10 bg-white text-center max-w-md mx-auto space-y-3.5 my-14 shadow-subtle">
              <div className="w-10 h-10 rounded-full border border-neutral-200 bg-neutral-100 text-neutral-700 flex items-center justify-center mx-auto">
                <ShieldAlert size={18} strokeWidth={1.75} />
              </div>
              <h2 className="font-serif text-lg font-bold tracking-tight text-neutral-900">
                Restricted Audit Trail
              </h2>
              <p className="font-serif italic text-xs text-neutral-500 leading-relaxed">
                Execution trace event payloads, raw JSON outputs, and state transitions require staff-level authentication.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs tracking-wide uppercase font-semibold shadow-subtle transition-all"
              >
                <span>Staff Sign In</span>
              </button>
            </div>
          )
        )}
      </main>

      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />

      {/* Editorial Monochrome Footer */}
      <footer className="bg-white border-t border-neutral-200/90 py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 font-mono text-xs tracking-wider uppercase">
          <div className="flex items-center gap-2 text-neutral-700">
            <span className="font-bold text-neutral-900 font-serif">ResolveOS</span>
            <span className="text-neutral-300">&bull;</span>
            <span className="text-neutral-500 text-[11px]">Enterprise Resolution Engine</span>
          </div>
          <div className="text-neutral-400 text-[10px]">
            Balanced Premium Editorial &bull; Production SaaS
          </div>
        </div>
      </footer>
    </div>
  );
}
