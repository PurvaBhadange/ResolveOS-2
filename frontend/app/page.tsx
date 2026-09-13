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
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
            <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 my-16 shadow-xs">
              <div className="w-12 h-12 rounded-full border border-rose-200 bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <Lock size={20} strokeWidth={2} />
              </div>
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-neutral-900">
                Staff Authority Required
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                The Operations Governance Console is restricted to Operations Leads, Support Specialists, and System Administrators.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-neutral-900 bg-neutral-900 text-white font-mono text-xs uppercase tracking-wider font-bold hover:bg-neutral-800 transition-colors shadow-xs"
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
            <div className="border border-rose-200 bg-rose-50/40 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 my-16 shadow-xs">
              <div className="w-12 h-12 rounded-full border border-rose-200 bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                <ShieldAlert size={20} strokeWidth={2} />
              </div>
              <h2 className="font-display text-xl font-bold uppercase tracking-tight text-neutral-900">
                Restricted Audit Trail
              </h2>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Execution trace event payloads, raw JSON outputs, and state transitions require staff-level authentication.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-neutral-900 bg-neutral-900 text-white font-mono text-xs uppercase tracking-wider font-bold hover:bg-neutral-800 transition-colors shadow-xs"
              >
                <span>Staff Sign In</span>
              </button>
            </div>
          )
        )}
      </main>

      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />

      {/* Modern Footer */}
      <footer className="bg-white border-t border-neutral-200 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 font-mono text-xs tracking-wider">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 uppercase">RESOLVE OS</span>
            <span className="text-neutral-300">&bull;</span>
            <span className="text-neutral-600">Enterprise Resolution Engine</span>
          </div>
          <div className="text-neutral-500 text-[11px]">
            Autonomous Resolution &bull; Human-in-the-Loop Governance
          </div>
        </div>
      </footer>
    </div>
  );
}
