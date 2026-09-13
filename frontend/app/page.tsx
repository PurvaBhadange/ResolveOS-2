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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
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
            <div className="p-8 sm:p-12 bg-white rounded-lg text-center border border-slate-200/90 shadow-subtle max-w-md mx-auto space-y-3 my-12">
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Staff Authorization Required</h2>
              <p className="text-xs text-slate-500 leading-normal">
                The Operations Governance Console is restricted to Operations Leads and System Administrators.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-subtle"
              >
                Sign In with Authorized Account
              </button>
            </div>
          )
        )}

        {activeTab === 'trace' && (
          isStaff ? (
            <AgentTraceInspector selectedCaseId={selectedCaseId} />
          ) : (
            <div className="p-8 sm:p-12 bg-white rounded-lg text-center border border-slate-200/90 shadow-subtle max-w-md mx-auto space-y-3 my-12">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto border border-slate-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Restricted Diagnostic View</h2>
              <p className="text-xs text-slate-500 leading-normal">
                Execution trace event payloads and diagnostic state logs require authenticated staff privileges.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-subtle"
              >
                Staff Sign In
              </button>
            </div>
          )
        )}
      </main>

      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />

      <footer className="bg-white border-t border-slate-200/80 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-[11px] text-slate-500 font-medium">
          ResolveOS &bull; Enterprise Order Fulfillment &amp; Customer Resolution Platform
        </div>
      </footer>
    </div>
  );
}
