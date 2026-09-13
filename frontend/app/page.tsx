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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'help' && (
          <CustomerHelpCenter
            onCaseCreated={(caseId) => setSelectedCaseId(caseId)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            onSelectOrder={(orderNum) => setSelectedOrderNumber(orderNum)}
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
            <div className="p-12 bg-white rounded-3xl text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4 my-12">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Staff Authentication Required</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                The Operations Dashboard &amp; Approval Console is restricted to internal Operations Leads and Admin Supervisors.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tealbrand-600 hover:bg-tealbrand-700 text-white font-semibold text-xs transition-all shadow-sm"
              >
                Sign In as Operations Lead
              </button>
            </div>
          )
        )}

        {activeTab === 'trace' && (
          isStaff ? (
            <AgentTraceInspector selectedCaseId={selectedCaseId} />
          ) : (
            <div className="p-12 bg-white rounded-3xl text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4 my-12">
              <div className="w-12 h-12 rounded-2xl bg-tealbrand-50 text-tealbrand-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Execution Trace Restricted</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                The Execution Trace Log contains internal workflow payloads and enterprise policy audit records. Staff sign-in is required.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-tealbrand-600 hover:bg-tealbrand-700 text-white font-semibold text-xs transition-all shadow-sm"
              >
                Staff Sign In
              </button>
            </div>
          )
        )}
      </main>

      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
          ResolveOS Enterprise Resolution Platform &mdash; High-Reliability Fulfillment &amp; Customer Support Infrastructure
        </div>
      </footer>
    </div>
  );
}
