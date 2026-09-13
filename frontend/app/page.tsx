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
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(1); // Default to Case 1 (Sarah Jenkins Demo)
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>('ORD-2026-8801');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);

  const userRole = (session?.user as any)?.role || (session ? 'operations' : 'customer');
  const isStaff = ['operations', 'admin', 'support_agent'].includes(userRole);

  return (
    <div className="min-h-screen flex flex-col bg-[#fffefb] text-[#201515]">
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
            <div className="zapier-card p-10 text-center max-w-xl mx-auto space-y-4 my-12">
              <div className="w-12 h-12 rounded-xl bg-[#201515] text-[#ff4f00] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <span className="zapier-eyebrow block text-xs">RESTRICTED GOVERNANCE ACCESS</span>
              <h2 className="text-2xl font-semibold text-[#201515]">Staff Authentication Required</h2>
              <p className="text-[#605d52] text-sm leading-relaxed">
                The Operations Dashboard & Approval Console is restricted to internal Operations Leads and Admin Supervisors.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="zapier-btn-primary px-6 py-3 text-sm"
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
            <div className="zapier-card p-10 text-center max-w-xl mx-auto space-y-4 my-12">
              <div className="w-12 h-12 rounded-xl bg-[#201515] text-[#ff4f00] flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="zapier-eyebrow block text-xs">RESTRICTED GRAPH AUDIT</span>
              <h2 className="text-2xl font-semibold text-[#201515]">Agent Inspector Restricted</h2>
              <p className="text-[#605d52] text-sm leading-relaxed">
                The Agent Trace Graph contains internal decision payloads and enterprise policy audit logs. Staff sign-in is required.
              </p>
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="zapier-btn-primary px-6 py-3 text-sm"
              >
                Staff Sign In
              </button>
            </div>
          )
        )}
      </main>

      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} />

      {/* Zapier Dark Coffee Footer */}
      <footer className="bg-[#201515] text-[#f8f4f0] py-10 mt-16 border-t border-[#2f2a26]">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <span className="zapier-eyebrow text-[#ff4f00] text-xs block">AUTONOMOUS WORKFLOW PLATFORM</span>
          <p className="text-sm font-medium text-[#c5c0b1]">
            ResolveOS Platform • Powered by LangGraph, Google Gemini, FastAPI & Enterprise DB
          </p>
        </div>
      </footer>
    </div>
  );
}
